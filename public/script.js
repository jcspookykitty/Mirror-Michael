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
    playBtn.title = 'Play message audio';
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

// Play audio from URL or base64 data
function playAudio(url) {
  const audio = new Audio(url);
  audio.play();
}

// Send message to backend and handle response
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
   
