import express from 'express';
import { speakWithMichael } from '../michaelVoiceEngine.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'No message provided' });

  try {
    const { audioBuffer, text } = await speakWithMichael(message);
    res.set({
      'Content-Type': 'audio/mpeg',
      'X-Michael-Text': encodeURIComponent(text),
    });
    res.send(audioBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong with Michael' });
  }
});

export default router;
