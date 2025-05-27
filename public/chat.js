// public/chat.js
import { generateMichaelResponse } from '../brain/michael-ai.js';

const chatbox = document.getElementById('chatbox');
const input = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');

// Allow pressing "Enter" to send message
input.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
    document.getElementById("sendBtn").click();
  }
});

function sendMessage() {
  const text = input.value.trim();
  if (text !== "") {
    const userMsg = document.createElement('p');
    userMsg.innerHTML = `<strong>You:</strong> ${text}`;
    chatbox.appendChild(userMsg);

    const botMsg = document.createElement('p');
    botMsg.innerHTML = `<strong>Michael:</strong> ${generateMichaelResponse(text)}`;
    chatbox.appendChild(botMsg);

    chatbox.scrollTop = chatbox.scrollHeight;
    input.value = "";
  }
}
