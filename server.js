import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { OpenAI } from 'openai';

dotenv.config();

const app = express();
const port = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());

// Serve frontend and static audio files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'public')));
app.use('/audio', express.static(path.join(__dirname, 'public/audio')));

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// POST /api/chat — gets AI text reply and generates audio, then returns both
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'No message provided' });
  }

  try {
    // 1. Get AI chat response
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are Michael, a friendly and caring AI companion.' },
        { role: 'user', content: message },
      ],
    });

    const reply = completion.choices[0].message.content;

    // 2. Generate speech audio from reply
    const speechResponse = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'onyx',
      input: reply,
    });

    // 3. Save audio file locally
    const filename = `michael-${Date.now()}.mp3`;
    const filepath = path.join(__dirname, 'public/audio', filename);

    const audioStream = fs.createWriteStream(filepath);
    await new Promise((resolve, reject) => {
      speechResponse.body.pipe(audioStream);
      speechResponse.body.on('end', resolve);
      speechResponse.body.on('error', reject);
    });

    // 4. Send back both reply text and audio URL to frontend
    const audioUrl = `/audio/${filename}`;
    res.json({ reply, audioUrl });

  } catch (error) {
    console.error('Error in /api/chat:', error);
    res.status(500).json({ error: 'Failed to get AI response or synthesize audio' });
  }
});

// Optional: POST /speak — just synthesize text to speech (if needed)
app.post('/speak', async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'No text provided' });
  }

  try {
    const speechResponse = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'onyx',
      input: text,
    });

    const filename = `michael-${Date.now()}.mp3`;
    const filepath = path.join(__dirname, 'public/audio', filename);
    const audioStream = fs.createWriteStream(filepath);

    await new Promise((resolve, reject) => {
      speechResponse.body.pipe(audioStream);
      speechResponse.body.on('end', resolve);
      speechResponse.body.on('error', reject);
    });

    const audioUrl = `/audio/${filename}`;
    res.json({ audioUrl });

  } catch (error) {
    console.error('Error in /speak:', error);
    res.status(500).json({ error: 'Failed to synthesize speech' });
  }
});

// Fallback route: serve index.html for any unknown routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`💬 Michael's server is running on port ${port}`);
});
