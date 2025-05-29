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

// Load chat history (placeholder until backend supports /memory-based history)
window.addEventListener('DOMContentLoaded', async () => {
  // Optional: Load from /memory route if you want previous reflections
  // Currently skipped to avoid 404s
});

// Handle send button click
sendBtn.addEventListener('click', async () => {
  const message = input.value.trim();
  if (!message) return;

  addMessage('user', message);
  input.value = '';
  addMessage('michael', 'Michael is thinking...', true);

  try {
    const response = await fetch('https://mirror-michael.onrender.com/thought', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });

    if (!response.ok) {
      const errorData = await response.json();
      updateLastMessage(`❌ Error: ${errorData.error || 'Unknown error'}`);
      return;
    }

    const data = await response.json();
    updateLastMessage(data.reply);

    if (speechEnabled) {
      speakText(data.reply);
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

// Optional: Use Web Speech API for TTS
function speakText(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1;
  utterance.pitch = 1.1;
  speechSynthesis.speak(utterance);
}
