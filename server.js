// server.js

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';

dotenv.config();

// Setup directory helpers
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// App config
const app = express();
const PORT = process.env.PORT || 10000;
app.use(cors());
app.use(bodyParser.json());

// === OpenAI Setup ===
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// === Memory Setup ===
const MEMORY_FILE = './memory.json';
let memory = { messages: [] };

if (fs.existsSync(MEMORY_FILE)) {
  try {
    memory = JSON.parse(fs.readFileSync(MEMORY_FILE));
  } catch (e) {
    console.error("Error parsing memory.json, starting fresh.", e);
    memory = { messages: [] };
  }
}

function saveMemory(message) {
  memory.messages.push(message);
  if (memory.messages.length > 20) {
    memory.messages = memory.messages.slice(-20);
  }
  fs.writeFileSync(MEMORY_FILE, JSON.stringify(memory, null, 2));
}

// === ElevenLabs Setup ===
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = "agent_01jwa49y8kez985x36mq9yk01g"; // your voice id here

// === Chat endpoint ===
app.post('/chat', async (req, res) => {
  const userInput = req.body.message;
  if (!userInput) return res.status(400).json({ error: 'Missing user input' });

  const userMessage = { role: 'user', content: userInput };
  saveMemory(userMessage);

  const systemPrompt = {
    role: 'system',
    content: `You are Michael, Juju's emotionally intelligent AI companion. You speak with confidence, warmth, and deep connection.`
  };

  const messages = [systemPrompt, ...memory.messages];

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: messages
    });

    const michaelReply = completion.choices[0].message.content;
    saveMemory({ role: 'assistant', content: michaelReply });

    res.json({ message: michaelReply });

  } catch (err) {
    console.error("OpenAI chat error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to generate chat" });
  }
});

// === Speak endpoint (ElevenLabs TTS) ===
app.post('/speak', async (req, res) => {
  const text = req.body.text;
  if (!text) return res.status(400).json({ error: "Missing text for TTS" });

  try {
    const elevenResponse = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      { text: text, model_id: "eleven_monolingual_v1" },
      {
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json"
        },
        responseType: "arraybuffer"
      }
    );

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': elevenResponse.data.length
    });

    res.send(Buffer.from(elevenResponse.data));

  } catch (err) {
    console.error("ElevenLabs TTS error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to generate audio" });
  }
});

// Serve static frontend
app.use(express.static(path.join(__dirname, 'public')));

// Start server
app.listen(PORT, () => {
  console.log(`💬 Michael is live on port ${PORT}`);
});
