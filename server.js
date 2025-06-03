// server.js (ESM)
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import axios from 'axios';
import { google } from 'googleapis';
import OpenAI from 'openai';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

// 🤖 Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// 🌐 Middleware
app.use(cors());
app.use(express.json());

// 🖼️ Serve static frontend from "public" folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'public')));

// 🔥 Basic GET endpoint
app.get('/api', (req, res) => {
  res.send('🟢 Michael the Helper API is up and running!');
});

// 🚀 Chat endpoint
app.post('/thought', async (req, res) => {
  const { message } = req.body;

  try {
    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are Michael, a helpful and caring assistant.' },
        { role: 'user', content: message }
      ],
      model: 'gpt-4o'
    });
    const reply = completion.choices[0].message.content.trim();
    res.json({ reply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ reply: 'Sorry, I had trouble processing that.' });
  }
});

// 🔊 ElevenLabs TTS endpoint
app.post('/speak', async (req, res) => {
  const { text } = req.body;
  const voiceId = process.env.ELEVENLABS_VOICE_ID;
  const apiKey = process.env.ELEVENLABS_API_KEY;

  try {
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      { text },
      {
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer'
      }
    );

    res.setHeader('Content-Type', 'audio/mpeg');
    res.send(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate audio.' });
  }
});

// 📺 YouTube search endpoint
app.post('/youtube', async (req, res) => {
  const { query } = req.body;
  const youtube = google.youtube({
    version: 'v3',
    auth: process.env.YOUTUBE_API_KEY
  });

  try {
    const response = await youtube.search.list({
      part: 'snippet',
      q: query,
      maxResults: 3,
      type: 'video'
    });

    const videos = response.data.items.map(item => ({
      title: item.snippet.title,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`
    }));

    res.json({ videos });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'YouTube search failed.' });
  }
});

// ⚡ Start server
app.listen(PORT, () => {
  console.log(`🟢 Server is running on port ${PORT}`);
});
