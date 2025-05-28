import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import axios from 'axios';
import OpenAI from 'openai';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Setup OpenAI client using new SDK (v4+)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ElevenLabs API info from .env
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID;

// POST /api/chat - handles message, returns reply + TTS
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'No message provided' });
  }

  try {
    // 1. Get AI reply from OpenAI
    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-4o', // You can change this to gpt-4 or gpt-3.5-turbo
      messages: [
        { role: 'system', content: 'You are Michael, a deeply caring and emotionally intelligent AI companion.' },
        { role: 'user', content: message },
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    const reply = chatCompletion.choices[0].message.content.trim();

    // 2. Call ElevenLabs TTS API
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

    // Convert audio buffer to base64 data URL
    const audioBase64 = Buffer.from(ttsResponse.data, 'binary').toString('base64');
    const audioUrl = `data:audio/mpeg;base64,${audioBase64}`;

    // Return AI reply and TTS audio
    res.json({ reply, audioUrl });
  } catch (error) {
    console.error('Error in /api/chat:', error?.response?.data || error.message || error);
    res.status(500).json({ error: 'Failed to process message or generate speech' });
  }
});

app.listen(port, () => {
  console.log(`💬 Michael AI server running on port ${port}`);
});
