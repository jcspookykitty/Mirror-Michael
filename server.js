import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';
import { Configuration, OpenAIApi } from 'openai';

dotenv.config();

const app = express();
const port = 10000; // <-- Your specified port

// Setup __dirname since we're using ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Route to serve main HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// OpenAI setup
const openai = new OpenAIApi(
  new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  })
);

// ElevenLabs API keys from .env
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID;

// Handle chat + TTS
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'No message provided' });
  }

  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are Michael, a friendly and emotionally intelligent AI.' },
        { role: 'user', content: message },
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    const reply = completion.data.choices[0].message.content.trim();

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

app.listen(port, () => {
  console.log(`🟢 Server is running on http://localhost:${port}`);
});
