const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 🔐 Firestore Setup
const serviceAccount = require('./firebase-service-account.json'); // Replace with your actual path

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const chatCollection = db.collection('chatHistory');

// 🛡️ Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Serves HTML, JS, and CSS from the public folder

// 🧠 Save each chat turn to Firestore
app.post('/api/chat', async (req, res) => {
  const userMessage = req.body.message;
  if (!userMessage) return res.status(400).json({ error: 'Message is required' });

  // ✨ Placeholder: Generate Michael’s response (replace with your AI logic)
  const michaelResponse = `You said: "${userMessage}" and I heard you 💬`;

  try {
    await chatCollection.add({
      user: userMessage,
      michael: michaelResponse,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({ reply: michaelResponse, audioUrl: null }); // Add text-to-speech URL here if needed
  } catch (err) {
    console.error('❌ Firestore error:', err);
    res.status(500).json({ error: 'Failed to save chat' });
  }
});

// 📚 Load full chat history
app.get('/api/history', async (req, res) => {
  try {
    const snapshot = await chatCollection.orderBy('timestamp').get();
    const history = snapshot.docs.map(doc => doc.data());
    res.json(history);
  } catch (err) {
    console.error('❌ Failed to load history:', err);
    res.status(500).json({ error: 'Failed to load chat history' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
