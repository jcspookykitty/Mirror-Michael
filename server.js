// server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import OpenAI from 'openai'; // correct for v4

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(cors());
app.use(bodyParser.json());

// Chat endpoint
app.post('/chat', async (req, res) => {
  const userMessage = req.body.message;

  try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: userMessage }],
      model: 'gpt-4',
    });

    const aiMessage = completion.choices[0].message.content;
    res.json({ message: aiMessage });
  } catch (error) {
    console.error('OpenAI error:', error);
    res.status(500).json({ error: 'Failed to get response from OpenAI' });
  }
});

// Speech endpoint placeholder
app.post('/speak', async (req, res) => {
  // Replace with ElevenLabs integration or mock it for now
  res.status(501).send('Speech synthesis not implemented');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
