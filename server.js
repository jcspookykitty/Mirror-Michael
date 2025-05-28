import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import OpenAI from 'openai';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // serves script.js, index.html, etc.

// 🧠 Chat endpoint
app.post('/chat', async (req, res) => {
  const userMessage = req.body.message;
  if (!userMessage) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: userMessage }],
    });

    const reply = completion.choices[0]?.message?.content?.trim();
    res.json({ message: reply || "Michael is silent, try again." });

  } catch (error) {
    console.error("OpenAI error:", error);
    res.status(500).json({ error: "Failed to get response from OpenAI." });
  }
});

// 🔊 Placeholder for speech synthesis
app.post('/speak', async (req, res) => {
  const text = req.body.text;
  if (!text) return res.status(400).send("Text required");

  // Placeholder response — you can integrate ElevenLabs here
  res.status(501).send("Speech synthesis not implemented yet.");
});

app.listen(port, () => {
  console.log(`✨ Michael is live at http://localhost:${port}`);
});
