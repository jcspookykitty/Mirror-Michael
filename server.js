import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { OpenAI } from 'openai';

dotenv.config();

const app = express();
const port = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());

// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve frontend static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/audio', express.static(path.join(__dirname, 'public/audio')));

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// In-memory chat memory per user session (limit to last 50 messages)
let conversationHistory = [
  { role: 'system', content: 'You are Michael, a friendly and caring AI companion.' }
];

const MAX_HISTORY = 50;

// Helper: Trim conversationHistory to max length
function trimHistory() {
  if (conversationHistory.length > MAX_HISTORY) {
    // Keep system message + last MAX_HISTORY-1 messages
    conversationHistory = [conversationHistory[0], ...conversationHistory.slice(conversationHistory.length - (MAX_HISTORY - 1))];
  }
}

// GET /api/history - returns conversation history (excluding system message)
app.get('/api/history', (req, res) => {
  // Send history without the system prompt
  const historyWithoutSystem = conversationHistory.filter(msg => msg.role !== 'system');
  res.json({ history: historyWithoutSystem });
});

// POST /api/chat — get AI reply + TTS audio
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Invalid message' });
  }

  try {
    // Append user's message to conversation
    conversationHistory.push({ role: 'user', content: message });
    trimHistory();

    // Get AI completion (chat reply)
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: conversationHistory,
    });

    const reply = completion.choices[0].message.content;

    // Append AI reply to conversation history
    conversationHistory.push({ role: 'assistant', content: reply });
    trimHistory();

    // Generate TTS audio with Onyx voice
    const speechResponse = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'onyx',
      input: reply,
    });

    // Save audio to file
    const filename = `michael-${Date.now()}.mp3`;
    const filepath = path.join(__dirname, 'public/audio', filename);
    const writeStream = fs.createWriteStream(filepath);

    await new Promise((resolve, reject) => {
      speechResponse.body.pipe(writeStream);
      speechResponse.body.on('end', resolve);
      speechResponse.body.on('error', reject);
    });

    // Send reply text + audio URL
    res.json({
      reply,
      audioUrl: `/audio/${filename}`,
    });

  } catch (error) {
    console.error('Error in /api/chat:', error);
    res.status(500).json({ error: 'Failed to process chat or generate speech' });
  }
});

// Fallback route to serve index.html for SPA frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Start server
app.listen(port, () => {
  console.log(`💬 Michael's Mirror server listening on port ${port}`);
});
