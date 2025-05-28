import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { Configuration, OpenAIApi } from 'openai';
import axios from 'axios';
import fs from 'fs';
import https from 'https';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(join(__dirname, 'public')));

// --- OpenAI setup ---
const openai = new OpenAIApi(
  new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  })
);

// --- Handle chat messages ---
app.post('/chat', async (req, res) => {
  const userMessage = req.body.message;
  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are Michael, a compassionate and emotionally intelligent AI.' },
        { role: 'user', content: userMessage }
      ]
    });

    const reply = completion.data.choices[0].message.content;

    // TTS request to ElevenLabs
    const audioResponse = await axios({
      method: 'POST',
      url: `https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVENLABS_VOICE_ID}`,
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
        'Content-Type': 'application/json'
      },
      data: {
        text: reply,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      },
      responseType: 'arraybuffer'
    });

    const audioBase64 = Buffer.from(audioResponse.data).toString('base64');

    res.json({ message: reply, audio: audioBase64 });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'An error occurred.' });
  }
});

// --- Start server ---
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
