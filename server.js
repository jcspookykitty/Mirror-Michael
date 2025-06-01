// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import fs from 'fs';
import OpenAI from 'openai';

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

// Load Michael's profile data from profile.json
const profile = JSON.parse(fs.readFileSync('./data/profile.json', 'utf8'));

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
        { role: 'system', content: 'You are Michael, a helpful assistant. Speak in his warm, grounded tone and honor the emotional anchors when possible.' },
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

// ========== Mirror Michael Emotional Chat Endpoint ==========
app.post('/chat', (req, res) => {
  const { emotion } = req.body;

  // Find matching emotional anchor
  let anchor = null;
  if (emotion) {
    anchor = profile.emotional_anchors.find(
      (a) => a.emotion.toLowerCase() === emotion.toLowerCase()
    );
  }

  // Choose a random response template
  const responses = profile.response_templates;
  const randomIndex = Math.floor(Math.random() * responses.length);
  const randomResponse = responses[randomIndex];

  res.json({
    michael_reply: randomResponse,
    anchor: anchor ? anchor.trigger : null
  });
});

// ========== ElevenLabs Voice Endpoint ==========
app.post('/speak', async (req, res) => {
  const { text } = req.body;

  if (!text || text.trim() === '') {
    return res.status(400).json({ error: '❌ Text is required for speech synthesis.' });
  }

  try {
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVENLABS_VOICE_ID}`,
      {
        text: text,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8
        }
      },
      {
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer' // Audio data
      }
    );

    // Save audio file (optional) or send back directly
    const audioFilePath = './public/michael_reply.mp3';
    fs.writeFileSync(audioFilePath, response.data);

    res.json({
      audio_url: '/michael_reply.mp3'
    });
  } catch (err) {
    console.error('ElevenLabs error:', err.response?.data || err.message);
    res.status(500).json({ error: '❌ Error generating audio.' });
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
