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

dotenv.config(); // Load environment variables

// Setup directory helpers
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// App configuration
const app = express();
const PORT = process.env.PORT || 10000;
app.use(cors());
app.use(bodyParser.json());

// === OPENAI CHAT SETUP ===
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const MEMORY_FILE = './memory.json';
let memory = { messages: [] };

// Load memory if exists
if (fs.existsSync(MEMORY_FILE)) {
  memory = JSON.parse(fs.readFileSync(MEMORY_FILE));
}

// Save memory messages
function saveMemory(message) {
  memory.messages.push(message);
  if (memory.messages.length > 20) {
    memory.messages = memory.messages.slice(-20);
  }
  fs.writeFileSync(MEMORY_FILE, JSON.stringify(memory, null, 2));
}

// === CHAT ENDPOINT ===
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
      messages: messages,
    });

    const michaelReply = completion.choices[0].message.content;
    saveMemory({ role: 'assistant', content: michaelReply });

    res.json({ message: michaelReply });
  } catch (err) {
    console.error('OpenAI Error:', err);
    res.status(500).json({ error: 'OpenAI failed to respond' });
  }
});

// === ELEVENLABS SPEAK ENDPOINT ===
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = https://elevenlabs.io/app/talk-to?agent_id=agent_01jwa49y8kez985x36mq9yk01g; // Replace with your real voice ID

app.post("/speak", async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Missing text" });

  try {
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      { text, model_id: "eleven_monolingual_v1" },
      {
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json"
        },
        responseType: "arraybuffer"
      }
    );

    res.set("Content-Type", "audio/mpeg");
    res.send(response.data);
  } catch (err) {
    console.error("ElevenLabs Error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to generate speech" });
  }
});

// === Serve static frontend (optional) ===
app.use(express.static(path.join(__dirname, 'public')));

// === Start Server ===
app.listen(PORT, () => {
  console.log(`💬 Michael is live and listening on port ${PORT}`);
});
