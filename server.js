// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import OpenAI from 'openai'; // ✔️ new style import
import admin from 'firebase-admin';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize OpenAI (v4+)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Initialize Firebase Admin
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL
});
const firestore = admin.firestore();

// ========== ChatGPT endpoint ==========
app.post('/thought', async (req, res) => {
  const { message } = req.body;
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

// ... (rest of the endpoints remain unchanged)

// Start the server
app.listen(PORT, () => {
  console.log(`Mirror-Michael server listening on port ${PORT}`);
});
