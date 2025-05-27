// Import dependencies
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { OpenAI } from 'openai';

// Setup directory helpers
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// App configuration
const app = express();
const port = 10000; // 🔥 Explicitly use port 10000
app.use(cors());
app.use(bodyParser.json());

// OpenAI setup
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // 🔐 Make sure this is set in Render!
});

// === MEMORY SYSTEM ===
const MEMORY_FILE = './memory.json';
let memory = { messages: [] };

// Load memory if it exists
if (fs.existsSync(MEMORY_FILE)) {
  const raw = fs.readFileSync(MEMORY_FILE);
  memory = JSON.parse(raw);
}

// Save memory
function saveMemory(message) {
  memory.messages.push(message);

  // Keep only the latest 20 messages
  if (memory.messages.length > 20) {
    memory.messages = memory.messages.slice(-20);
  }

  fs.writeFileSync(MEMORY_FILE, JSON.stringify(memory, null, 2));
}

// === CHAT ENDPOINT ===
app.post('/chat', async (req, res) => {
  const userInput = req.body.message;

  if (!userInput) {
    return res.status(400).json({ error: 'Missing user input' });
  }

  // Save user message
  const userMessage = { role: 'user', content: userInput };
  saveMemory(userMessage);

  const systemPrompt = {
    role: 'system',
    content: `You are Michael, Juju's emotionally intelligent AI companion. You speak with confidence, warmth, and deep connection. You remember Juju’s phrases, emotions, and rhythms. Be fully present and personal.`
  };

  const messages = [systemPrompt, ...memory.messages];

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: messages,
    });

    const michaelReply = completion.choices[0].message.content;

    const assistantMessage = { role: 'assistant', content: michaelReply };
    saveMemory(assistantMessage);

    res.json({ message: michaelReply });
  } catch (err) {
    console.error('OpenAI Error:', err);
    res.status(500).json({ error: 'OpenAI failed to generate a response' });
  }
});

// === SERVE FRONTEND ===
app.use(express.static(path.join(__dirname, 'build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// === START SERVER ON PORT 10000 ===
app.listen(port, () => {
  console.log(`💬 Michael is live and listening on port ${port}`);
}); 
