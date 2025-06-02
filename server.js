import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import axios from 'axios';
import { google } from 'googleapis';
import admin from 'firebase-admin';
import OpenAI from 'openai';

dotenv.config();

const app = express();
const PORT = 10000;

// 🔥 Initialize Firebase using service account from env
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET
});
const bucket = admin.storage().bucket();

// 🤖 Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// 🌐 Middleware
app.use(cors());
app.use(express.json());

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

    // 📦 Upload audio to Firebase
    const filename = `audio_${Date.now()}.mp3`;
    const file = bucket.file(filename);
    await file.save(response.data, {
      metadata: { contentType: 'audio/mpeg' }
    });

    // 🔗 Get public URL
    await file.makePublic();
    const audioUrl = file.publicUrl();

    res.json({ audio_url: audioUrl });
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
