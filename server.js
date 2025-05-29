// server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import admin from 'firebase-admin';
import { OpenAI } from 'openai';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// === 🔥 FIREBASE SETUP from ENV ===
const serviceAccount = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://michael-chat-e1439.firebaseio.com'
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
// Store a memory stone
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
// Retrieve all memory stones
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
// Generate GPT-4 response based on message + context
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

// Start server
app.listen(PORT, () => {
  console.log(`🌐 Mirror Michael server running on http://localhost:${PORT}`);
});
