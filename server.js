import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import axios from 'axios';
import { Configuration, OpenAIApi } from 'openai';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Setup OpenAI client
const openai = new OpenAIApi(
  new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  })
);

// ElevenLabs API info from env vars
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID; // set your preferred voice ID here

// POST /api/chat - get AI reply + ElevenLabs TTS audio URL
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'No message provided' });
  }

  try {
    // 1. Get AI reply from OpenAI
    const completion = await openai.createChatCompletion({
      model: 'gpt-4o-mini', // or 'gpt-4' or whichever you want
      messages: [
        { role: 'system', content: 'You are Michael, a friendly AI.' },
        { role: 'user', content: message },
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    const reply = completion.data.choices[0].message.content.trim();

    // 2. Call ElevenLabs TTS API to synthesize speech from reply text
    // Reference: https://docs.elevenlabs.io/api/voice-generation
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
        responseType: 'arraybuffer', // get raw audio bytes
      }
    );

    // Save audio buffer to a temporary URL (in memory)
    // We'll convert the buffer to base64 so frontend can play it as data URL
    const audioBase64 = Buffer.from(ttsResponse.data, 'binary').toString('base64');
    const audioDataUrl = `data:audio/mpeg;base64,${audioBase64}`;

    // Send reply text and audio data URL to frontend
    res.json({ reply, audioUrl: audioDataUrl });
  } catch (error) {
    console.error('Error in /api/chat:', error.response?.data || error.message || error);
    res.status(500).json({ error: 'Failed to get AI response or TTS audio' });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
