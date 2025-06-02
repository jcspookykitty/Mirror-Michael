// server.js
import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import { Configuration, OpenAIApi } from 'openai';
import { google } from 'googleapis';
import { ElevenLabsClient } from 'elevenlabs';
import admin from 'firebase-admin';
import fs from 'fs';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();
const port = 10000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize OpenAI
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Initialize YouTube API
const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY,
});

// Initialize ElevenLabs
const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

// Initialize Firebase
const firebaseConfig = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
admin.initializeApp({
  credential: admin.credential.cert(firebaseConfig),
  storageBucket: process.env.FIREBASE_BUCKET,
});
const bucket = admin.storage().bucket();

app.post('/thought', async (req, res) => {
  const { message } = req.body;
  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: message }],
    });
    const reply = completion.data.choices[0].message.content.trim();
    res.json({ reply });
  } catch (error) {
    console.error('Error in /thought:', error);
    res.status(500).json({ error: 'Error generating thought.' });
  }
});

app.post('/speak', async (req, res) => {
  const { text } = req.body;
  try {
    // Generate speech using ElevenLabs
    const audioResponse = await elevenlabs.generate({
      voice: 'Adam', // Change as desired
      model_id: 'eleven_multilingual_v2',
      text,
    });

    const audioBuffer = Buffer.from(await audioResponse.arrayBuffer());

    // Upload to Firebase
    const fileName = `audio-${Date.now()}.mp3`;
    const file = bucket.file(fileName);

    await file.save(audioBuffer, {
      metadata: { contentType: 'audio/mpeg' },
    });

    const audioUrl = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 3600 * 1000, // 1 hour expiry
    });

    res.json({ audio_url: audioUrl[0] });
  } catch (error) {
    console.error('Error in /speak:', error);
    res.status(500).json({ error: 'Error generating speech.' });
  }
});

app.post('/youtube', async (req, res) => {
  const { query } = req.body;
  try {
    const response = await youtube.search.list({
      part: 'snippet',
      q: query,
      maxResults: 3,
      type: 'video',
    });

    const videos = response.data.items.map((item) => ({
      title: item.snippet.title,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    }));

    res.json({ videos });
  } catch (error) {
    console.error('Error in /youtube:', error);
    res.status(500).json({ error: 'Error searching YouTube.' });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
