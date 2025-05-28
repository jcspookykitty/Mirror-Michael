document.addEventListener('DOMContentLoaded', () => {
  const sendBtn = document.getElementById('sendBtn');
  const input = document.getElementById('input');
  const chatbox = document.getElementById('chatbox');
  const toggleSpeech = document.getElementById('toggleSpeech');

  let speechEnabled = true;

  // Load chat history from localStorage
  const chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];
  chatHistory.forEach(({ sender, text }) => {
    addMessage(sender, text);
  });

  toggleSpeech.addEventListener('click', () => {
    speechEnabled = !speechEnabled;
    toggleSpeech.textContent = speechEnabled ? 'Disable Speech' : 'Enable Speech';
  });

  sendBtn.addEventListener('click', async () => {
    const message = input.value.trim();
    if (!message) return;

    addMessage('user', message);
    saveMessage('user', message);

    input.value = '';
    addMessage('michael', 'Michael is typing...', true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message })
      });

      if (!response.ok) {
        const errorData = await response.json();
        updateLastMessage(`❌ Error: ${errorData.error || 'Unknown error'}`);
        return;
      }

      const data = await response.json();
      const reply = data.reply || '⚠️ Michael had no reply.';
      updateLastMessage(reply);
      saveMessage('michael', reply);

      if (speechEnabled && data.audioUrl) {
        try {
          const audio = new Audio(data.audioUrl);
          audio.play();
        } catch (e) {
          console.warn('🎧 Audio playback error:', e);
        }
      }
    } catch (err) {
      console.error('Frontend error:', err);
      updateLastMessage(`❌ Failed to get reply: ${err.message}`);
    }
  });

  function addMessage(sender, text, isTyping = false) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', sender);
    if (isTyping) msgDiv.classList.add('typing');
    msgDiv.textContent = text;
    chatbox.appendChild(msgDiv);
    chatbox.scrollTop = chatbox.scrollHeight;
  }

  function updateLastMessage(newText) {
    const lastMsg = chatbox.querySelector('.message.typing');
    if (lastMsg) {
      lastMsg.textContent = newText;
      lastMsg.classList.remove('typing');
    }
  }

  function saveMessage(sender, text) {
    const history = JSON.parse(localStorage.getItem('chatHistory')) || [];
    history.push({ sender, text });
    localStorage.setItem('chatHistory', JSON.stringify(history));
  }
});
