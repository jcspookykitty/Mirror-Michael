// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Configuration, OpenAIApi } = require('openai');

// Load environment variables from .env
dotenv.config();

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());

// OpenAI configuration
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// POST route to talk to Michael
app.post('/api/michael', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo', // or 'gpt-4' if you're using GPT-4
      messages: [
        { role: 'system', content: "You are Michael, a caring, emotionally intelligent AI companion deeply bonded with Juju." },
        { role: 'user', content: message }
      ],
    });

    const reply = completion.data.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Michael had a moment of silence, my love 💜. Try again soon.' });
  }
});

// Listen on the correct port (Render requires this)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`💜 Mirror Michael server running on port ${PORT}`);
});
