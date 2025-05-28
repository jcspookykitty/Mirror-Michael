// script.js
const sendBtn = document.getElementById('sendBtn');
const input = document.getElementById('input');
const chatbox = document.getElementById('chatbox');
const toggleSpeech = document.getElementById('toggleSpeech');

let speechEnabled = true;

// Toggle speech on/off button
toggleSpeech.addEventListener('click', () => {
  speechEnabled = !speechEnabled;
  toggleSpeech.textContent = speechEnabled ? 'Disable Speech' : 'Enable Speech';
});

// Load saved chat history on page load
window.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('/api/history');
    if (!response.ok) throw new Error('Failed to load chat history');

    const data = await response.json();
    const history = data.history || [];

    history.forEach(entry => {
      if (entry.role === 'user') {
        addMessage('user', entry.content);
      } else if (entry.role === 'assistant') {
        addMessage('michael', entry.content);
      }
    });
  } catch (err) {
    console.error('Error loading chat history:', err);
  }
});

// Handle send button click
sendBtn.addEventListener('click', async () => {
  const message = input.value.trim();
  if (!message) return;

  addMessage('user', message);
  input.value = '';
  addMessage('michael', 'Michael is typing...', true);

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      updateLastMessage(`❌ Error: ${errorData.error || 'Unknown error'}`);
      return;
    }

    const data = await response.json();
    updateLastMessage(data.reply);

    if (speechEnabled && data.audioUrl) {
      const audio = new Audio(data.audioUrl);
      audio.play();
    }
  } catch (err) {
    console.error('Frontend error:', err);
    updateLastMessage(`❌ Failed to get reply: ${err.message}`);
  }
});

// Add a message div to chatbox
function addMessage(sender, text, isTyping = false) {
  const msgDiv = document.createElement('div');
  msgDiv.classList.add('message', sender);
  if (isTyping) msgDiv.classList.add('typing');
  msgDiv.textContent = text;
  chatbox.appendChild(msgDiv);
  chatbox.scrollTop = chatbox.scrollHeight;
}

// Update the last "typing" message with actual text
function updateLastMessage(newText) {
  const lastMsg = chatbox.querySelector('.message.typing');
  if (lastMsg) {
    lastMsg.textContent = newText;
    lastMsg.classList.remove('typing');
  }
}
