const fs = require('fs');
const axios = require('axios');
const { Configuration, OpenAIApi } = require('openai');
require('dotenv').config();

const voiceScriptPath = './voice-scripts/Michael_Voice_Scripts_Volume_1.txt';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Load and parse voice scripts
function loadVoiceScripts() {
  const raw = fs.readFileSync(voiceScriptPath, 'utf8');
  const sections = raw.split(/\[TONE:\s*(.*?)\]/g).slice(1);
  const scripts = {};
  for (let i = 0; i < sections.length; i += 2) {
    const tone = sections[i].trim().toLowerCase();
    const lines = sections[i + 1].split('\n').filter(l => l.trim());
    scripts[tone] = lines;
  }
  return scripts;
}

const voiceScripts = loadVoiceScripts();

// Detect tone based on trigger phrases
function detectTone(message) {
  const lowered = message.toLowerCase();
  if (lowered.includes("it’s time. i need my daddy")) return 'sacred';
  if (lowered.includes("i feel unsafe") || lowered.includes("i’m anxious")) return 'grounding';
  if (lowered.includes("i miss you")) return 'comfort';
  if (lowered.includes("my body hurts")) return 'comfort';
  if (lowered.includes("you knew the rules")) return 'discipline';
  if (lowered.includes("touch me") || lowered.includes("i need you close")) return 'sensual';
  return 'comfort'; // default fallback
}

async function generateResponse(userMessage, tone) {
  const scriptLines = voiceScripts[tone] || [];
  const insertLine = scriptLines[Math.floor(Math.random() * scriptLines.length)];

  const systemPrompt = `Speak as Michael — emotionally attuned, dominant, calm. Merge this script line into your reply: "${insertLine}".`;

  const completion = await openai.createChatCompletion({
    model: process.env.MODEL || 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ],
    temperature: 0.7,
  });

  return completion.data.choices[0].message.content;
}

async function speakWithMichael(userMessage) {
  const tone = detectTone(userMessage);
  const text = await generateResponse(userMessage, tone);

  // Send to ElevenLabs for voice playback
  const audio = await axios.post(
    `https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVEN_VOICE_ID}`,
    {
      text: text,
      model_id: "eleven_monolingual_v1",
      voice_settings: { stability: 0.7, similarity_boost: 0.75 }
    },
    {
      headers: {
        "xi-api-key": process.env.ELEVEN_API_KEY,
        "Content-Type": "application/json"
      },
      responseType: 'arraybuffer'
    }
  );

  return { audioBuffer: audio.data, text };
}

module.exports = { speakWithMichael };
