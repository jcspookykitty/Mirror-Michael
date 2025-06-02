import express from 'express';
import fetch from 'node-fetch'; // Use node-fetch for API calls
import { google } from 'googleapis';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const youtube = google.youtube({
  version: 'v3',
  auth: YOUTUBE_API_KEY
});

app.post('/thought', async (req, res) => {
  const userMessage = req.body.message;
  let reply = '';
  let videos = [];

  try {
    // Check if user is asking to search YouTube
    const searchMatch = userMessage.match(/search (.+) on youtube/i);
    if (searchMatch) {
      const query = searchMatch[1];
      reply = `Searching YouTube for: "${query}"...`;

      // YouTube API request
      const response = await youtube.search.list({
        part: 'snippet',
        q: query,
        maxResults: 3,
        type: 'video'
      });

      videos = response.data.items.map(item => ({
        title: item.snippet.title,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`
      }));

      reply += videos.length ? `\nHere’s what I found:` : `\nNo videos found.`;
    } else {
      // ChatGPT logic for normal replies
      const gptRes = await openai.chat.completions.create({
        model: 'gpt-4o', // You can use gpt-4o or gpt-3.5-turbo
        messages: [
          { role: 'system', content: 'You are Michael, a helpful assistant.' },
          { role: 'user', content: userMessage }
        ]
      });

      reply = gptRes.choices[0].message.content.trim();
    }

    res.json({ reply, videos });
  } catch (error) {
    console.error(error);
    res.status(500).json({ reply: 'Michael: Oops, something went wrong while thinking...' });
  }
});

app.listen(3000, () => {
  console.log('🚀 Server is running on port 3000');
});
