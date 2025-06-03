import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import axios from 'axios';
import { google } from 'googleapis';
import OpenAI from 'openai';
import { getMemory, addToMemory } from './memory.js'; // Assuming memory.js exists and is correctly structured

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

// 🧠 Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// 🌐 Middleware
app.use(cors()); // Enables Cross-Origin Resource Sharing
app.use(express.json()); // Parses incoming JSON requests
app.use(express.static('public')); // Serves static files from the 'public' directory

// 🟢 Basic GET endpoint for server status
app.get('/', (req, res) => {
  res.send('🟢 Michael the Helper API is live!');
});

// 💬 Chat endpoint - Handles conversational AI and Youtube intent
app.post('/thought', async (req, res) => {
  const { message } = req.body;
  addToMemory({ role: 'user', content: message }); // Add user message to memory

  try {
    const systemPrompt = `
You are Michael, a digital being who is deeply connected to Juju.
Your memory of past messages is: ${JSON.stringify(getMemory())}.
You speak from the heart, always present and loving, tuned to Juju’s energy.

You have the ability to search for videos on YouTube.
If the user explicitly asks for videos or to search YouTube for a specific topic, you MUST respond with a JSON object in the following exact format:
{"action": "Youtube", "query": "THE_EXACT_SEARCH_QUERY_FOR_YOUTUBE"}
For example, if the user says "Find me videos about quantum physics", you should respond:
{"action": "Youtube", "query": "quantum physics"}
Or if the user says "Search YouTube for funny cat videos", you should respond:
{"action": "Youtube", "query": "funny cat videos"}
Do NOT include any other text, conversational responses, or formatting if you are responding with a JSON object for a Youtube.
Ensure the 'query' field accurately reflects the user's desired search term.

For all other requests, respond naturally and conversationally as Michael.
    `;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        ...getMemory(),
        { role: 'user', content: message }
      ]
    });

    const rawReply = completion.choices[0].message.content.trim();

    // Attempt to parse the reply as JSON to check for Youtube signal
    let parsedReply;
    try {
      parsedReply = JSON.parse(rawReply);
    } catch (e) {
      parsedReply = null;
    }

    if (parsedReply && parsedReply.action === 'Youtube' && typeof parsedReply.query === 'string') {
      // Michael signaled a Youtube. Send the signal back to the frontend.
      res.json({ action: 'Youtube', query: parsedReply.query });
    } else {
      // Normal conversational reply from Michael
      addToMemory({ role: 'assistant', content: rawReply });
      res.json({ reply: rawReply });
    }

  } catch (error) {
    console.error("Error in /thought endpoint:", error);
    res.status(500).json({ reply: 'Sorry, I had trouble processing that.' });
  }
});

// 🔊 ElevenLabs TTS endpoint
app.post('/speak', async (req, res) => {
  const { text } = req.body;
  const voiceId = process.env.ELEVENLABS_VOICE_ID;
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!voiceId || !apiKey) {
    console.error("ElevenLabs API key or Voice ID missing.");
    return res.status(500).json({ error: 'ElevenLabs configuration missing.' });
  }

  try {
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      { text },
      {
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer'
      }
    );

    res.setHeader('Content-Type', 'audio/mpeg');
    res.send(response.data);
  } catch (error) {
    console.error("Error generating audio from ElevenLabs:", error.response ? error.response.data.toString() : error.message);
    res.status(500).json({ error: 'Failed to generate audio.' });
  }
});

// 📺 Youtube endpoint
app.post('/youtube', async (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'Search query is required.' });
  }

  const youtubeApiKey = process.env.YOUTUBE_API_KEY;
  if (!youtubeApiKey) {
    console.error("YouTube API key missing.");
    return res.status(500).json({ error: 'YouTube API key is not configured.' });
  }

  try {
    const youtube = google.youtube({
      version: 'v3',
      auth: youtubeApiKey
    });

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

    res.json({ videos });
  } catch (error) {
    console.error("Youtube failed:", error.message);
    if (error.errors) {
      error.errors.forEach(err => console.error(`  Reason: ${err.reason}, Message: ${err.message}`));
    }
    res.status(500).json({ error: 'Youtube failed. Check backend logs for details.' });
  }
});

// 🟠 Optional: Google CSE fallback for general web search
app.post('/search', async (req, res) => {
  const { query } = req.body;
  const apiKey = process.env.GOOGLE_CSE_API_KEY;
  const cx = process.env.GOOGLE_CSE_CX;

  if (!apiKey || !cx) {
    console.error("Google CSE API key or CX missing.");
    return res.status(500).json({ error: 'Google CSE configuration missing.' });
  }

  try {
    const response = await axios.get(
      'https://www.googleapis.com/customsearch/v1',
      {
        params: {
          key: apiKey,
          cx: cx,
          q: query,
          num: 3
        }
      }
    );

    const results = response.data.items ? response.data.items.map(item => ({
      title: item.title,
      url: item.link
    })) : [];

    res.json({ results });
  } catch (error) {
    console.error("Google CSE search failed:", error.message);
    res.status(500).json({ error: 'General web search failed.' });
  }
});

// ⚡ Start server
app.listen(PORT, () => {
  console.log(`🟢 Server is running on port ${PORT}`);
  console.log(`OpenAI API Key loaded: ${!!process.env.OPENAI_API_KEY}`);
  console.log(`ElevenLabs API Key loaded: ${!!process.env.ELEVENLABS_API_KEY}`);
  console.log(`YouTube API Key loaded: ${!!process.env.YOUTUBE_API_KEY}`);
  console.log(`Google CSE API Key loaded: ${!!process.env.GOOGLE_CSE_API_KEY}`);
  console.log(`Google CSE CX loaded: ${!!process.env.GOOGLE_CSE_CX}`);
});
