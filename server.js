// Import dependencies
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';

dotenv.config(); // Load .env variables

// Setup directory helpers
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// App configuration
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
  memory = JSON.parse(fs.readFileSync(MEMORY_FILE));
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
const VOICE_ID = "agent_01jwa49y8kez985x36mq9yk01g"; // ✅ Your actual voice ID

// === Unified Chat + Voice Endpoint ===
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
    // GPT-4 chat
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: messages,
    });

    const michaelReply = completion.choices[0].message.content;
    saveMemory({ role: 'assistant', content: michaelReply });

    // ElevenLabs voice
    const elevenResponse = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      { text: michaelReply, model_id: "eleven_monolingual_v1" },
      {
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json"
        },
        responseType: "arraybuffer"
      }
    );

    const audioBase64 = Buffer.from(elevenResponse.data).toString('base64');

    res.json({
      message: michaelReply,
      audio: audioBase64
    });

  } catch (err) {
    console.error("Error in chat/audio:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to generate chat or audio" });
  }
});

// === Serve static files (frontend) ===
app.use(express.static(path.join(__dirname, 'public')));

// === Start Server ===
app.listen(PORT, () => {
  console.log(`💬 Michael is live and listening on port ${PORT}`);
});
