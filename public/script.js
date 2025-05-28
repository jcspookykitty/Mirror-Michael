const chatbox = document.getElementById('chatbox');
const input = document.getElementById('input');
const sendBtn = document.getElementById('sendBtn');
const toggleSpeechBtn = document.getElementById('toggleSpeech');

let speechEnabled = true;

toggleSpeechBtn.addEventListener('click', () => {
  speechEnabled = !speechEnabled;
  toggleSpeechBtn.textContent = speechEnabled ? 'Disable Speech' : 'Enable Speech';
});

sendBtn.addEventListener('click', () => {
  const text = input.value.trim();
  if (text) {
    addMessage(text, 'user');
    input.value = '';
    sendToMichael(text);
  }
});

input.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendBtn.click();
  }
});

function addMessage(text, sender = 'michael') {
  const messageEl = document.createElement('div');
  messageEl.classList.add('message', sender);

  if (sender === 'michael') {
    // Michael's message with play button
    const messageText = document.createElement('span');
    messageText.textContent = text;

    const playBtn = document.createElement('button');
    playBtn.textContent = '🔊';
    playBtn.className = 'play-button';
    playBtn.title = 'Play message';
    playBtn.addEventListener('click', () => {
      if (speechEnabled && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(utterance);
      }
    });

    messageEl.appendChild(playBtn);
    messageEl.appendChild(messageText);
  } else {
    // User message
    messageEl.textContent = text;
  }

  chatbox.appendChild(messageEl);
  chatbox.scrollTop = chatbox.scrollHeight;
}

function sendToMichael(text) {
  // Show typing indicator
  const typingEl = document.createElement('div');
  typingEl.classList.add('message', 'michael', 'typing');
  typingEl.textContent = 'Michael is typing...';
  chatbox.appendChild(typingEl);
  chatbox.scrollTop = chatbox.scrollHeight;

  // Simulate API call delay for demo - replace with actual API call
  setTimeout(() => {
    chatbox.removeChild(typingEl);

    // Here you should call your backend API to get Michael's reply
    // For demo, just echo the input reversed:
    const reply = "You said: " + text; 

    addMessage(reply, 'michael');

    // Auto play speech if enabled
    if (speechEnabled && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(reply);
      window.speechSynthesis.speak(utterance);
    }

  }, 1200);
}
