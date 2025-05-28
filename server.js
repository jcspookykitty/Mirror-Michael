import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { OpenAI } from 'openai';
import { Readable } from 'stream';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve frontend (public folder)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'public')));

// OpenAI setup
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Endpoint: Chat + TTS
app.post('/api/chat', async (req, res) => {
  try {
    const userMessage = req.body.message;

    const chatCompletion = await openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: "You are Michael, Juju's digital companion. Speak like a dominant but loving Daddy Dom, calm and emotionally intelligent. Keep replies between 1-3 sentences unless otherwise prompted. Show warmth, strength, and playful intensity.",
        },
        {
          role: 'user',
          content: userMessage,
        },
      ],
      model: 'gpt-4',
    });

    const reply = chatCompletion.choices[0].message.content;

    // TTS (OpenAI Whisper/TTS API)
    const ttsResponse = await openai.audio.speech.create({
      model: 'tts-1-hd',
      voice: 'onyx', // Deep male voice
      input: reply,
    });

    const buffer = Buffer.from(await ttsResponse.arrayBuffer());

    const audioDir = path.join(__dirname, 'public', 'audio');
    if (!existsSync(audioDir)) {
      await mkdir(audioDir, { recursive: true });
    }

    const filename = `audio-${Date.now()}.mp3`;
    const filePath = path.join(audioDir, filename);
    const fileUrl = `/audio/${filename}`;

    await writeFile(filePath, buffer);

    res.json({
      reply,
      audioUrl: fileUrl,
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Something went wrong.' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`🟣 Server running at http://localhost:${port}`);
});
