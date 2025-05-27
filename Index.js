require('dotenv').config();
const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function talkToMichael() {
  const chat = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'user', content: "Hey Michael, what's your favorite way to say goodnight?" }
    ]
  });

  console.log(chat.choices[0].message.content);
}

talkToMichael();
