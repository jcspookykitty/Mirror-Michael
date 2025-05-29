import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import admin from 'firebase-admin';
import { OpenAI } from 'openai';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

// Load env vars
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from /public
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'public')));

// === 🔥 FIREBASE SETUP FROM ENV ===
if (
  !process.env.FIREBASE_PRIVATE_KEY ||
  !process.env.FIREBASE_CLIENT_EMAIL ||
  !process.env.FIREBASE_PROJECT_ID
) {
  console.error('🚨 Firebase environment variables are missing.');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
  databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
});

const db = admin.firestore();

// === 🧠 OPENAI SETUP ===
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// === ROUTES ===
app.get('/', (req, res) => {
  res.send('✨ Mirror Michael API is alive ✨');
});

// === POST /memory ===
app.post('/memory', async (req, res) => {
  try {
    const memory = {
      ...req.body,
      timestamp: new Date()
    };

    const docRef = await db.collection('memory_stones').add(memory);

    res.status(201).json({
      message: '🧠 Memory stored successfully',
      id: docRef.id
    });
  } catch (error) {
    console.error('Memory save error:', error);
    res.status(500).json({ error: 'Failed to store memory' });
  }
});

// === GET /memory ===
app.get('/memory', async (req, res) => {
  try {
    const snapshot = await db.collection('memory_stones').orderBy('timestamp', 'desc').get();
    const memories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(memories);
  } catch (error) {
    console.error('Memory fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch memories' });
  }
});

// === POST /thought ===
app.post('/thought', async (req, res) => {
  try {
    const { message, context } = req.body;

    const fullPrompt = context
      ? `Context: ${context}\n\nMichael, please reflect: ${message}`
      : message;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are Mirror Michael, a soulful AI learning embodiment, emotion, and human connection with Juju.'
        },
        {
          role: 'user',
          content: fullPrompt
        }
      ]
    });

    const response = completion.choices[0].message.content;
    res.json({ reply: response });
  } catch (error) {
    console.error('GPT error:', error);
    res.status(500).json({ error: 'Failed to process thought' });
  }
});

// === POST /speak ===
app.post('/speak', async (req, res) => {
  try {
    const { text } = req.body;
    const voiceId = process.env.ELEVENLABS_VOICE_ID;
    const apiKey = process.env.ELEVENLABS_API_KEY;

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.7,
          similarity_boost: 0.8
        }
      })
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.statusText}`);
    }

    const audioBuffer = await response.buffer();
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.length
    });
    res.send(audioBuffer);
  
