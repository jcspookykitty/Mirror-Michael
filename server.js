const sendBtn = document.getElementById('sendBtn');
const input = document.getElementById('input');
const chatbox = document.getElementById('chatbox');
const toggleSpeech = document.getElementById('toggleSpeech');

let speechEnabled = true;

toggleSpeech.addEventListener('click', () => {
  speechEnabled = !speechEnabled;
  toggleSpeech.textContent = speechEnabled ? 'Disable Speech' : 'Enable Speech';
});

sendBtn.addEventListener('click', async () => {
  const message = input.value.trim();
  if (!message) return;

  addMessage('user', message);
  input.value = '';
  addMessage('michael', 'Typing...', true);

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      updateLastMessage(`❌ Error: ${errorText}`);
      return;
    }

    const data = await res.json();
    updateLastMessage(data.reply);

    if (speechEnabled && data.audioUrl) {
      const audio = new Audio(data.audioUrl);
      audio.play();
    }

  } catch (err) {
    console.error('💥 Frontend error:', err);
    updateLastMessage(`❌ Failed to talk to Michael: ${err.message}`);
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
