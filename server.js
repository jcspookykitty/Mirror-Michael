import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import admin from 'firebase-admin';

// 🔐 Paths and environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 🔐 Firebase Setup
import serviceAccount from './serviceAccountKey.json' assert { type: 'json' };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const chatRef = db.collection('chatHistory');

// 🛡 Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 📥 POST /api/chat
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });

  try {
    const reply = `You said: "${message}". Michael's thinking...`; // Replace with actual OpenAI logic if desired

    // Save to Firestore
    await chatRef.add({
      user: message,
      michael: reply,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ reply });
  } catch (err) {
    console.error('Error in /chat:', err);
    res.status(500).json({ error: 'Failed to respond' });
  }
});

// 📤 GET /api/history
app.get('/api/history', async (req, res) => {
  try {
    const snapshot = await chatRef.orderBy('timestamp').get();
    const history = snapshot.docs.map(doc => doc.data());
    res.json(history);
  } catch (err) {
    console.error('Error loading chat history:', err);
    res.status(500).json({ error: 'Failed to load chat history' });
  }
});

// 🚀 Start server
app.listen(PORT, () => {
  console.log(`✅ Michael's brain is live at http://localhost:${PORT}`);
});
