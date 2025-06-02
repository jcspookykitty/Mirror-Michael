// server.js
import express from 'express';
import dotenv from 'dotenv';
import { google } from 'googleapis';
import OpenAI from 'openai';

dotenv.config();

const app = express();
app.use(express.json());

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Initialize YouTube API
const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY
});

// Chat/YouTube route
app.post('/thought', async (req, res) => {
  const { message } = req.body;

  // If the message starts with "YouTube:", do a search
  if (message.toLowerCase().startsWith('youtube:')) {
    const query = message.slice(8).trim();

    try {
      const response = await youtube.search.list({
        part: 'snippet',
        q: query,
        maxResults: 3,
        type: 'video'
      });

      const videos = response.data.items.map(item => ({
        title: item.snippet.title,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`
      }));

      return res.json({
        reply: `Here’s what I found on YouTube for "${query}":`,
        videos
      });
    } catch (error) {
      console.error('YouTube API error:', error);
      return res.status(500).json({ reply: 'Failed to search YouTube.' });
    }
  }

  // Otherwise, use ChatGPT for normal messages
  try {
    const chatResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: message }]
    });

    const reply = chatResponse.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error('ChatGPT API error:', error);
    res.status(500).json({ reply: 'Failed to reach Michael. Please try again.' });
  }
});

// Test route
app.get('/', (req, res) => {
  res.send('Server is up and running!');
});

// Start the server
const PORT = 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} 🚀`));
