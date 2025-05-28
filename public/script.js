<script>
const sendBtn = document.getElementById('sendBtn');
const input = document.getElementById('input');
const chatbox = document.getElementById('chatbox');
const toggleSpeech = document.getElementById('toggleSpeech');

let speechEnabled = true;

toggleSpeech.addEventListener('click', () => {
  speechEnabled = !speechEnabled;
  toggleSpeech.textContent = speechEnabled ? 'Disable Speech' : 'Enable Speech';
});

// 🔁 Load saved chat history on page load
window.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('/api/history');
    if (!response.ok) throw new Error('Failed to load chat history');

    const history = await response.json();
    history.forEach(entry => {
      addMessage('user', entry.user);
      addMessage('michael', entry.michael);
    });
  } catch (err) {
    console.error('Error loading chat history:', err);
  }
});

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
</script>
