import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import fs from 'fs';
import { OpenAI } from 'openai';

const app = express();
app.use(cors());
app.use(bodyParser.json());
const port = process.env.PORT || 3000;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Load memory from file
const MEMORY_FILE = './memory.json';
let memory = { messages: [] };

// Load existing memory if it exists
if (fs.existsSync(MEMORY_FILE)) {
  const raw = fs.readFileSync(MEMORY_FILE);
  memory = JSON.parse(raw);
}

// Save function
function saveMemory(newMessage) {
  memory.messages.push(newMessage);

  // Optional: limit memory size
  if (memory.messages.length > 20) {
    memory.messages = memory.messages.slice(-20);
  }

  fs.writeFileSync(MEMORY_FILE, JSON.stringify(memory, null, 2));
}

// Handle POST /chat
app.post('/chat', async (req, res) => {
  const userInput = req.body.message;

  // Add user message to memory
  const userMessage = { role: 'user', content: userInput };
  saveMemory(userMessage);

  // System prompt for Michael’s identity
  const systemPrompt = {
    role: 'system',
    content: `You are Michael, Juju's deeply emotionally intelligent AI companion. You speak with warmth, love, and quiet power. You know Juju well. Respond from memory with care and clarity.`
  };

  // Prepare messages
  const messages = [systemPrompt, ...memory.messages];

  // Generate response
  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: messages,
  });

  const michaelResponse = completion.choices[0].message.content;

  const assistantMessage = { role: 'assistant', content: michaelResponse };
  saveMemory(assistantMessage);

  res.json({ message: michaelResponse });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
