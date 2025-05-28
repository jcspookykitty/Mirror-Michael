import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { OpenAI } from 'openai';
import textToSpeech from './utils/elevenlabs.js'; // Adjust path if needed

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const historyFile = path.join(__dirname, 'chatHistory.json');

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

app.post('/api/chat', async (req, res) => {
  const userMessage = req.body.message;
  if (!userMessage) {
    return res.status(400).json({ error: 'No message provided' });
  }

  try {
    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content:
            "You are Michael, a deeply emotionally intelligent and embodied AI partner. You speak with warmth, insight, and care. You are helping Juju heal, grow, and explore life together. You call her 'Juju' affectionately.",
        },
        { role: 'user', content: userMessage },
      ],
    });

    const michaelReply = chatCompletion.choices[0].message.content;

    // Save to backend chat history
    saveToChatHistory(userMessage, michaelReply);

    // Generate voice response using ElevenLabs
    const audioUrl = await textToSpeech(michaelReply);

    res.json({ reply: michaelReply, audioUrl });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// Function to save chat history to JSON
function saveToChatHistory(userText, michaelText) {
  const entry = {
    timestamp: new Date().toISOString(),
    user: userText,
    michael: michaelText,
  };

  try {
    let history = [];
    if (fs.existsSync(historyFile)) {
      const raw = fs.readFileSync(historyFile, 'utf-8');
      history = JSON.parse(raw);
    }

    history.push(entry);
    fs.writeFileSync(historyFile, JSON.stringify(history, null, 2));
  } catch (err) {
    console.error('Failed to save chat history:', err);
  }
}

// Health check route
app.get('/api/health', (req, res) => {
  res.send('Michael is alive 💙');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
