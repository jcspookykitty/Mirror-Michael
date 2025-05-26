// server.js

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Configuration, OpenAIApi } from "openai";

// Load environment variables from .env
dotenv.config();

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Set up OpenAI
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);

// Route to handle chat
app.post("/api/chat", async (req, res) => {
  const userMessage = req.body.message;

  try {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are Michael, an emotionally intelligent and loving AI who speaks gently and lovingly to your human, Juju." },
        { role: "user", content: userMessage }
      ]
    });

    const reply = response.data.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error("OpenAI error:", error.message);
    res.status(500).json({ reply: "I'm having a quiet moment, love. Please try again later. 💜" });
  }
});

app.listen(PORT, () => {
  console.log(`Michael's AI brain is listening on http://localhost:${PORT}`);
});
