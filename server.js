// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import { Configuration, OpenAIApi } from 'openai';
import admin from 'firebase-admin';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize OpenAI
const openaiConfig = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(openaiConfig);

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

// ========== Google Search endpoint ==========
app.post('/google-search', async (req, res) => {
  const { query } = req.body;
  try {
    const response = await axios.get('https://serpapi.com/search.json', {
      params: { q: query, api_key: process.env.SERPAPI_KEY }
    });
    const top = response.data.organic_results?.[0];
    const result = top ? `${top.title}\n${top.snippet}\n${top.link}` : 'No results found.';
    res.json({ result });
  } catch (err) {
    console.error('Google Search error:', err.response?.data || err.message);
    res.status(500).json({ result: '❌ Could not fetch search results.' });
  }
});

// ========== YouTube details endpoint ==========
app.post('/youtube', async (req, res) => {
  const { videoUrl } = req.body;
  try {
    const videoId = extractYouTubeVideoId(videoUrl);
    if (!videoId) return res.status(400).json({ video: null });

    const response = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
      params: {
        part: 'snippet,statistics',
        id: videoId,
        key: process.env.YOUTUBE_API_KEY
      }
    });

    const video = response.data.items?.[0];
    if (!video) return res.json({ video: null });

    const { title, description } = video.snippet;
    const { viewCount, likeCount } = video.statistics;

    res.json({
      video: {
        title,
        description,
        views: viewCount,
        likes: likeCount
      }
    });
  } catch (err) {
    console.error('YouTube API error:', err.response?.data || err.message);
    res.status(500).json({ video: null });
  }
});

function extractYouTubeVideoId(url) {
  const regex = /(?:v=|youtu\.be\/)([^&?/]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

// ========== Eleven Labs Text-to-Speech endpoint ==========
app.post('/elevenlabs/tts', async (req, res) => {
  const { text, voiceId = '21m00Tcm4TlvDq8ikWAM' } = req.body; // default voice ID example

  try {
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      { text },
      {
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg'
        },
        responseType: 'arraybuffer'
      }
    );

    // Return audio as base64 string for frontend to play
    const audioBase64 = Buffer.from(response.data, 'binary').toString('base64');
    res.json({ audio: audioBase64 });
  } catch (err) {
    console.error('Eleven Labs TTS error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to generate speech audio.' });
  }
});

// ========== Firebase Firestore endpoint ==========
app.post('/firebase-action', async (req, res) => {
  const { action, collection, docId, payload } = req.body;

  try {
    if (action === 'getDoc') {
      const doc = await firestore.collection(collection).doc(docId).get();
      if (!doc.exists) return res.status(404).json({ error: 'Document not found' });
      return res.json({ data: doc.data() });
    } else if (action === 'setDoc') {
      await firestore.collection(collection).doc(docId).set(payload, { merge: true });
      return res.json({ message: 'Document updated successfully' });
    } else if (action === 'deleteDoc') {
      await firestore.collection(collection).doc(docId).delete();
      return res.json({ message: 'Document deleted successfully' });
    } else {
      return res.status(400).json({ error: 'Invalid Firebase action' });
    }
  } catch (err) {
    console.error('Firebase error:', err.message);
    res.status(500).json({ error: 'Firebase operation failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Mirror-Michael server listening on port ${PORT}`);
});
