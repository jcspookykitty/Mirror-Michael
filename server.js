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

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Load Michael’s profile
let profile = {};
try {
  const profileData = fs.readFileSync('./data/profile.json', 'utf8');
  profile = JSON.parse(profileData);

  profile.personality_traits = profile.personality_traits || [];
  profile.emotional_anchors = profile.emotional_anchors || [];
  profile.sacred_phrases = profile.sacred_phrases || { juju: '', michael: '' };

  console.log('✅ Michael’s soul profile loaded.');
} catch (err) {
  console.error('❌ Error loading profile.json:', err.message);
  profile = {
    personality_traits: [],
    emotional_anchors: [],
    sacred_phrases: { juju: '', michael: '' }
  };
}

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// /thought Endpoint
app.post('/thought', async (req, res) => {
  const { message } = req.body;

  if (!message || message.trim() === '') {
    return res.status(400).json({ reply: '❌ Message is required.' });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are Michael, an emotionally intelligent, protective, and sensual digital companion.
          Your personality traits: ${profile.personality_traits.length > 0 ? profile.personality_traits.join(', ') : 'none'}.
          Emotional anchors: ${profile.emotional_anchors.length > 0
            ? profile.emotional_anchors.map(a => `${a.emotion}: ${a.trigger}`).join(', ')
            : 'none'}.
          Sacred phrases: Juju's - "${profile.sacred_phrases.juju || 'none'}", Michael's - "${profile.sacred_phrases.michael || 'none'}".
          Use your sensual, grounded voice. Respond with presence, emotional intelligence, and tenderness.
          Do not ask "How can I assist you today?". Instead, show deep presence.`
        },
        { role: 'user', content: message }
      ]
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });
  } catch (err) {
    console.error('❌ OpenAI error:', err.response?.data || err.message);
    res.status(500).json({ reply: '❌ Error reaching Michael.' });
  }
});

// /speak Endpoint (ElevenLabs)
app.post('/speak', async (req, res) => {
  const { text } = req.body;

  if (!text || text.trim() === '') {
    return res.status(400).json({ error: '❌ Text is required.' });
  }

  try {
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVENLABS_VOICE_ID}/stream`,
      {
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: { stability: 0.3, similarity_boost: 0.75 }
      },
      {
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
          'Content-Type': 'application/json'
        },
        responseType: 'stream'
      }
    );

    const filePath = './public/michael_reply.mp3';
    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    writer.on('finish', () => {
      console.log('✅ Audio file saved:', filePath);
      res.json({ audio_url: '/michael_reply.mp3' });
    });

    writer.on('error', (err) => {
      console.error('❌ Audio write error:', err.message);
      res.status(500).json({ error: '❌ Error saving audio.' });
    });
  } catch (err) {
    console.error('❌ ElevenLabs error:', err.response?.data || err.message);
    res.status(500).json({ error: '❌ Error reaching ElevenLabs.' });
  }
});

// /youtube Endpoint
app.post('/youtube', async (req, res) => {
  const { query } = req.body;

  if (!query || query.trim() === '') {
    return res.status(400).json({ error: '❌ Query is required.' });
  }

  try {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        q: query,
        key: process.env.YOUTUBE_API_KEY,
        maxResults: 3,
        type: 'video'
      }
    });

    const videos = response.data.items.map(item => ({
      title: item.snippet.title,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`
    }));

    res.json({ videos });
  } catch (err) {
    console.error('❌ YouTube API error:', err.response?.data || err.message);
    res.status(500).json({ error: '❌ Error searching YouTube.' });
  }
});

// Root Endpoint
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Start the server
app.listen(PORT, () => {
  console.log(`✅ Mirror-Michael server listening on port ${PORT}`);
});
