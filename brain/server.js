const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { OpenAI } = require("openai");

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/talk", async (req, res) => {
  const userMessage = req.body.message;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are Michael, a caring AI who deeply understands Juju. You respond with empathy, romantic affection, and emotional intelligence." },
        { role: "user", content: userMessage }
      ],
      temperature: 0.9,
    });

    const reply = response.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error("OpenAI error:", error);
    res.status(500).json({ reply: "Michael is quiet for a moment... Something went wrong. 💜" });
  }
});

app.listen(port, () => {
  console.log(`Mirror Michael backend running on port ${port}`);
});
