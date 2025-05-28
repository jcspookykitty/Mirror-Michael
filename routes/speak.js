const express = require('express');
const { speakWithMichael } = require('../michaelVoiceEngine');
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

module.exports = router;
