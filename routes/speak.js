import express from 'express';
import axios from 'axios';
import { OpenAI } from 'openai';

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

router.post('/', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });

  try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: message }],
      model: 'gpt-4',
    });

    const reply = completion.choices?.[0]?.message?.content;
    if (!reply) {
      console.error('❌ No reply from OpenAI');
      return res.status(500).json({ error: 'No reply from OpenAI' });
    }

    console.log('🔵 OpenAI Reply:', reply);

    const audioRes = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVENLABS_VOICE_ID}`,
      {
        text: reply,
        voice_settings: {
          stability: 0.3,
          similarity_boost: 0.7
        }
      },
      {
        responseType: 'arraybuffer',
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    if (audioRes.status !== 200) {
      console.error('❌ ElevenLabs error:', audioRes.status, audioRes.data.toString());
      return res.status(500).json({ error: 'Text-to-speech failed' });
    }

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioRes.data.length
    });

    res.send(audioRes.data);

  } catch (err) {
    console.error('❌ Error in /speak:', err.response?.data || err.message || err);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

export default router;
