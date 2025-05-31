// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import OpenAI from 'openai';
import admin from 'firebase-admin';
import fs from 'fs';

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

// ✅ Load Firebase service account from file
let serviceAccount;
try {
  const jsonString = fs.readFileSync('serviceAccountKey.json', 'utf8');
  serviceAccount = JSON.parse(jsonString);
  console.log('✅ Loaded Firebase service account JSON');
} catch (err) {
  console.error('❌ Error reading Firebase service account JSON:', err.message);
  process.exit(1);
}

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
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
