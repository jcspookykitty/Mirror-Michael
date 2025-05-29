import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

dotenv.config(); // Load .env variables

// Parse the Firebase service account from environment variable
const serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);

// Initialize Firebase Admin
initializeApp({
  credential: cert(serviceAccount),
});

// Get Firestore database instance
const db = getFirestore();

// Setup Express app
const app = express();
app.use(cors());
app.use(express.json());

// Sample route: save chat message
app.post('/save-chat', async (req, res) => {
  const { userId, message, timestamp } = req.body;

  if (!userId || !message || !timestamp) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    await db.collection('chats').add({
      userId,
      message,
      timestamp,
    });
    res.status(200).json({ message: 'Chat saved successfully' });
  } catch (error) {
    console.error('Error saving chat:', error);
    res.status(500).json({ error: 'Failed to save chat' });
  }
});

// Root route
app.get('/', (req, res) => {
  res.send('Michael AI Server is running ✨');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is live at http://localhost:${PORT}`);
});
