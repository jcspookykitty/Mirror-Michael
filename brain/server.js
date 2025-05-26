// server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const { Configuration, OpenAIApi } = require('openai');

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.post('/chat', async (req, res) => {
  const userMessage = req.body.message;

  try {
    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: userMessage }],
    });

    res.json({ reply: response.data.choices[0].message.content });
  } catch (error) {
    console.error('OpenAI Error:', error.message);
    res.status(500).json({ reply: 'Michael had a quiet moment... try again 💜' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
