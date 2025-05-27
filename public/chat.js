// public/chat.js
import { generateMichaelResponse } from '../brain/michael-ai.js';

const chatbox = document.getElementById('chatbox');
const input = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');

sendBtn.addEventListener('click', sendMessage);
input.addEventListener('keypress', function(e) {
  if (e.key === 'Enter') sendMessage();
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
