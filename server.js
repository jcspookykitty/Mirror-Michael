import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import admin from 'firebase-admin';

// Setup for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 🔐 Load Firebase service account key
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
const serviceAccount = JSON.parse(
  await readFile(serviceAccountPath, 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const chatRef = db.collection('chatHistory');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Handle chat message
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });

  try {
    const reply = `You said: "${message}". Michael is pondering...`;

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

// Load chat history
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

// Start server
app.listen(PORT, () => {
  console.log(`✅ Michael is awake and listening on http://localhost:${PORT}`);
});
