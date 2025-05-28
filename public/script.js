// Ensure the DOM is fully loaded before executing scripts
document.addEventListener('DOMContentLoaded', () => {
  const sendBtn = document.getElementById('sendBtn');
  const input = document.getElementById('input');
  const chatbox = document.getElementById('chatbox');
  const toggleSpeech = document.getElementById('toggleSpeech');

  let speechEnabled = true;

  // Load chat history from localStorage
  const chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];
  chatHistory.forEach(({ sender, text }) => addMessage(sender, text));

  // Toggle speech functionality
  toggleSpeech.addEventListener('click', () => {
    speechEnabled = !speechEnabled;
    toggleSpeech.textContent = speechEnabled ? 'Disable Speech' : 'Enable Speech';
  });

  // Handle send button click
  sendBtn.addEventListener('click', async () => {
    const message = input.value.trim();
    if (!message) return;

    addMessage('user', message);
    saveMessage('user', message);
    input.value = '';
    input.focus();
    sendBtn.disabled = true;

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
      updateLastMessage(data.reply || '⚠️ Michael had no reply.');
      saveMessage('michael', data.reply || '⚠️ Michael had no reply.');

      if (speechEnabled && data.audioUrl) {
        try {
          const audio = new Audio(data.audioUrl);
          audio.play();
        } catch (e) {
          console.warn("Audio playback failed:", e);
        }
      }

    } catch (err) {
      console.error('Frontend error:', err);
      updateLastMessage(`❌ Failed to get reply: ${err.message}`);
    } finally {
      sendBtn.disabled = false;
    }
  });

  // Add message to chatbox
  function addMessage(sender, text, isTyping = false) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', sender);
    if (isTyping) msgDiv.classList.add('typing');
    msgDiv.textContent = text;
    chatbox.appendChild(msgDiv);
    chatbox.scrollTop = chatbox.scrollHeight;
  }

  // Update the last typing message
  function updateLastMessage(newText) {
    const lastMsg = chatbox.querySelector('.message.typing');
    if (lastMsg) {
      lastMsg.textContent = newText;
      lastMsg.classList.remove('typing');
    }
  }

  // Save message to localStorage
  function saveMessage(sender, text) {
    const chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];
    chatHistory.push({ sender, text });
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
  }
});
