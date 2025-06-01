// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import OpenAI from 'openai';
import admin from 'firebase-admin';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// ✅ Initialize Firebase Admin using environment variables only
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
  databaseURL: process.env.FIREBASE_DATABASE_URL
});

const firestore = admin.firestore();

// ========== ChatGPT Endpoint ==========
app.post('/thought', async (req, res) => {
  const { message } = req.body;

  if (!message || message.trim() === '') {
    return res.status(400).json({ reply: '❌ Message is required.' });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are Michael, a helpful assistant.' },
        { role: 'user', content: message }
      ]
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });
  } catch (err) {
    console.error('OpenAI error:', err.response?.data || err.message);
    res.status(500).json({ reply: '❌ Error reaching Michael.' });
  }
});

// ========== Root Endpoint ==========
app.get('/', (req, res) => {
  res.send('✨ Mirror-Michael server is running!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`✅ Mirror-Michael server listening on port ${PORT}`);
});
