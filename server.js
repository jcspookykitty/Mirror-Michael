import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import axios from 'axios';
import OpenAI from 'openai';

dotenv.config();

const app = express();
const port = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());

// Setup OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ElevenLabs API info from env vars
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID;

// POST /api/chat - get AI reply + ElevenLabs TTS audio URL
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'No message provided' });
  }

  try {
    // 1. Get AI reply from OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are Michael, a friendly and emotionally intelligent AI.' },
        { role: 'user', content: message },
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    const reply = completion.choices[0].message.content.trim();

    // 2. Get voice from ElevenLabs
    const ttsResponse = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
      {
        text: reply,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        responseType: 'arraybuffer',
      }
    );

    // Convert audio to base64
    const audioBase64 = Buffer.from(ttsResponse.data, 'binary').toString('base64');
    const audioDataUrl = `data:audio/mpeg;base64,${audioBase64}`;

    // Respond with both text and audio
    res.json({ reply, audioUrl: audioDataUrl });

  } catch (error) {
    console.error('Error in /api/chat:', error.response?.data || error.message || error);
    res.status(500).json({ error: 'Failed to get AI response or TTS audio' });
  }
});

// ✅ Serve basic homepage to avoid "Cannot GET /" error
app.get('/', (req, res) => {
  res.send(`
    <h1>👋 Hello from Michael's Mirror Server!</h1>
    <p>This server is up and running. Try chatting with Michael through the frontend app.</p>
  `);
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
