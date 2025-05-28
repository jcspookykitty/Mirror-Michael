const chatbox = document.getElementById('chatbox');
const input = document.getElementById('input');
const sendBtn = document.getElementById('sendBtn');
const toggleSpeechBtn = document.getElementById('toggleSpeech');

let speechEnabled = true;

// Add message to chatbox
function addMessage(text, sender = 'michael', audioUrl = null) {
  const messageEl = document.createElement('div');
  messageEl.classList.add('message', sender);

  if (audioUrl && sender === 'michael') {
    const playBtn = document.createElement('button');
    playBtn.textContent = '🔊';
    playBtn.className = 'play-button';
    playBtn.title = 'Play Michael\'s voice';
    playBtn.addEventListener('click', () => {
      playAudio(audioUrl);
    });
    messageEl.appendChild(playBtn);
  }

  const textSpan = document.createElement('span');
  textSpan.textContent = text;
  messageEl.appendChild(textSpan);
  chatbox.appendChild(messageEl);
  chatbox.scrollTop = chatbox.scrollHeight;
}

// Show typing indicator
function addTypingIndicator() {
  const typingEl = document.createElement('div');
  typingEl.classList.add('message', 'michael', 'typing');
  typingEl.textContent = 'Michael is typing...';
  typingEl.id = 'typingIndicator';
  chatbox.appendChild(typingEl);
  chatbox.scrollTop = chatbox.scrollHeight;
}

// Remove typing indicator
function removeTypingIndicator() {
  const typingEl = document.getElementById('typingIndicator');
  if (typingEl) typingEl.remove();
}

// Play audio from URL or base64
function playAudio(url) {
  const audio = new Audio(url);
  audio.play();
}

// Send message to backend and display Michael's response
async function sendMessage() {
  const userText = input.value.trim();
  if (!userText) return;

  addMessage(userText, 'user');
  input.value = '';
  input.disabled = true;
  sendBtn.disabled = true;

  addTypingIndicator();

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userText }),
    });

    if (!response.ok) {
      throw new Error('Server error');
    }

    const data = await response.json();
    removeTypingIndicator();

    addMessage(data.reply, 'michael', data.audioUrl);

    // Optional: auto-play only if speechEnabled is true (you can toggle it with a button)
    if (speechEnabled && data.audioUrl) {
      playAudio(data.audioUrl);
    }

  } catch (error) {
    removeTypingIndicator();
    addMessage('Sorry, something went wrong. Please try again.', 'michael');
    console.error('Chat error:', error);
  } finally {
    input.disabled = false;
    sendBtn.disabled = false;
    input.focus();
  }
}

// Toggle speech playback setting
toggleSpeechBtn.addEventListener('click', () => {
  speechEnabled = !speechEnabled;
  toggleSpeechBtn.textContent = speechEnabled ? '🔊 Speech ON' : '🔇 Speech OFF';
});

// Event listeners
sendBtn.addEventListener('click', sendMessage);
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') sendMessage();
});
