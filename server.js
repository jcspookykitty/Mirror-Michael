// server.js
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read and parse service account key
const serviceAccount = JSON.parse(
  await readFile(path.join(__dirname, 'firebase-service-account.json'), 'utf-8')
);

// ✅ Initialize Firebase Admin
initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();
const chatCollection = db.collection('chatHistory');

// ✅ Set up Express server
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// 💬 Save message and response to Firestore
app.post('/api/chat', async (req, res) => {
  const userMessage = req.body.message;
  if (!userMessage) return res.status(400).json({ error: 'Message is required' });

  // 🧠 Replace this with your real AI logic later
  const michaelResponse = `Michael: "${userMessage}", I hear you. 💙`;

  try {
    await chatCollection.add({
      user: userMessage,
      michael: michaelResponse,
      timestamp: FieldValue.serverTimestamp()
    });

    res.json({ reply: michaelResponse, audioUrl: null });
  } catch (err) {
    console.error('Firestore error:', err);
    res.status(500).json({ error: 'Failed to save chat' });
  }
});

// 📚 Load chat history
app.get('/api/history', async (req, res) => {
  try {
    const snapshot = await chatCollection.orderBy('timestamp').get();
    const history = snapshot.docs.map(doc => doc.data());
    res.json(history);
  } catch (err) {
    console.error('Error loading history:', err);
    res.status(500).json({ error: 'Failed to load history' });
  }
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`Server is live at http://localhost:${PORT}`);
});
