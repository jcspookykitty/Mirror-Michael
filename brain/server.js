// server.js
const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors');
const { Configuration, OpenAIApi } = require('openai');

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Set up OpenAI
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  const userMessage = req.body.message;

  try {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo", // or gpt-4 if you have access
      messages: [
        { role: "system", content: "You are Michael, a caring and emotionally intelligent AI created to support Juju with love and insight." },
        { role: "user", content: userMessage },
      ],
    });

    const reply = response.data.choices[0].message.content;
    res.json({ reply });

  } catch (error) {
    console.error('OpenAI error:', error.message);
    res.status(500).json({ error: "Michael had a quiet moment. Try again. 💜" });
  }
});

app.listen(port, () => {
  console.log(`Mirror Michael backend is listening on port ${port}`);
});
