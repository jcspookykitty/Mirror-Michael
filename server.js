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

// Static file serving
app.use(express.static(path.join(__dirname, 'public')));
app.use('/audio', express.static(path.join(__dirname, 'public/audio')));

// OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Conversation history (in-memory + saved to file)
let conversationHistory = [
  { role: 'system', content: 'You are Michael, a friendly and caring AI companion.' }
];

const historyFile = path.join(__dirname, 'chat-history.json');

// Load saved history on server start (optional)
if (fs.existsSync(historyFile)) {
  try {
    const fileData = fs.readFileSync(historyFile, 'utf-8');
    const saved = JSON.parse(fileData);
    saved.forEach(pair => {
      if (pair.user) conversationHistory.push({ role: 'user', content: pair.user });
      if (pair.michael) conversationHistory.push({ role: 'assistant', content: pair.michael });
    });
  } catch (e) {
    console.error('⚠️ Failed to load saved history:', e);
  }
}

// Save conversation to history file
function saveHistory(userMessage, michaelReply) {
  let historyData = [];

  if (fs.existsSync(historyFile)) {
    try {
      const existing = fs.readFileSync(historyFile, 'utf-8');
      historyData = JSON.parse(existing);
    } catch (err) {
      console.error('⚠️ Error reading existing history file:', err);
    }
  }

  historyData.push({ user: userMessage, michael: michaelReply });

  try {
    fs.writeFileSync(historyFile, JSON.stringify(historyData.slice(-50), null, 2));
  } catch (err) {
    console.error('⚠️ Failed to save history:', err);
  }
}

// 🔁 API to get last 50 messages
app.get('/api/history', (req, res) => {
  try {
    if (!fs.existsSync(historyFile)) return res.json([]);
    const data = fs.readFileSync(historyFile, 'utf-8');
    const history = JSON.parse(data);
    res.json(history.slice(-50));
  } catch (err) {
    console.error('❌ Failed to read chat history:', err);
    res.status(500).json({ error: 'Failed to load history' });
  }
});

// 🧠 POST /api/chat — Get AI reply + TTS audio
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Invalid message' });
  }

  try {
    conversationHistory.push({ role: 'user', content: message });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: conversationHistory,
    });

    const reply = completion.choices[0].message.content;
    conversationHistory.push({ role: 'assistant', content: reply });

    // Save history to file
    saveHistory(message, reply);

    const speechResponse = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'onyx',
      input: reply,
    });

    const filename = `michael-${Date.now()}.mp3`;
    const filepath = path.join(__dirname, 'public/audio', filename);
    const writeStream = fs.createWriteStream(filepath);

    await new Promise((resolve, reject) => {
      speechResponse.body.pipe(writeStream);
      speechResponse.body.on('end', resolve);
      speechResponse.body.on('error', reject);
    });

    res.json({
      reply,
      audioUrl: `/audio/${filename}`,
    });

  } catch (error) {
    console.error('❌ Error in /api/chat:', error);
    res.status(500).json({ error: 'Failed to process chat or generate speech' });
  }
});

// ✨ Serve SPA frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// 🚀 Start server
app.listen(port, () => {
  console.log(`💬 Michael's Mirror server listening on port ${port}`);
});
