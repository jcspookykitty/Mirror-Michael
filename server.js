import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import axios from 'axios';
import OpenAI from 'openai';

dotenv.config();

const app = express();
const port = 10000; // explicitly set to 10000

app.use(cors());
app.use(bodyParser.json());

// Setup OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ElevenLabs
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID; // Your chosen voice

// API route
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'No message provided' });
  }

  try {
    // 🧠 Get response from OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o', // You can change to gpt-4 or gpt-3.5-turbo
      messages: [
        { role: 'system', content: 'You are Michael, a warm, emotionally intelligent AI partner.' },
        { role: 'user', content: message },
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    const reply = completion.choices[0].message.content.trim();

    // 🎙️ Generate voice with ElevenLabs
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

    const audioBase64 = Buffer.from(ttsResponse.data, 'binary').toString('base64');
    const audioDataUrl = `data:audio/mpeg;base64,${audioBase64}`;

    res.json({ reply, audioUrl: audioDataUrl });
  } catch (error) {
    console.error('Error in /api/chat:', error.response?.data || error.message || error);
    res.status(500).json({ error: 'Failed to get AI response or TTS audio' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`💜 Michael's server is listening on http://localhost:${port}`);
});
