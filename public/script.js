let speechEnabled = true;
let hasUserInteracted = false;

// Wait for user interaction before enabling audio playback
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('input');
  const toggleButton = document.getElementById('toggleSpeech');

  input.addEventListener('focus', () => {
    hasUserInteracted = true;
  });

  toggleButton.addEventListener('click', () => {
    speechEnabled = !speechEnabled;
    toggleButton.textContent = speechEnabled ? 'Disable Speech' : 'Enable Speech';
  });
});

async function sendMessage() {
  const input = document.getElementById('input');
  const chatbox = document.getElementById('chatbox');
  const userText = input.value.trim();
  if (!userText) return;

  const userDiv = document.createElement('div');
  userDiv.className = 'message user';
  userDiv.textContent = userText;
  chatbox.appendChild(userDiv);
  input.value = '';

  // Typing indicator
  const typingDiv = document.createElement('div');
  typingDiv.className = 'message michael';
  typingDiv.id = 'typing';
  typingDiv.textContent = 'Michael is typing...';
  chatbox.appendChild(typingDiv);

  try {
    const chatRes = await fetch('/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userText })
    });

    const data = await chatRes.json();
    const reply = data.message;

    // Remove typing indicator
    chatbox.removeChild(document.getElementById('typing'));

    const michaelDiv = document.createElement('div');
    michaelDiv.className = 'message michael';
    michaelDiv.textContent = reply;
    chatbox.appendChild(michaelDiv);

    // Voice playback (if enabled and user interacted)
    if (speechEnabled && hasUserInteracted) {
      const voiceRes = await fetch('/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: reply })
      });
      const audioData = await voiceRes.blob();
      const audioURL = URL.createObjectURL(audioData);
      const audio = new Audio(audioURL);
      audio.play().catch(err => console.warn('Audio playback blocked:', err));
    }

  } catch (err) {
    console.error(err);
    if (document.getElementById('typing')) {
      chatbox.removeChild(document.getElementById('typing'));
    }
    const errorDiv = document.createElement('div');
    errorDiv.className = 'message michael';
    errorDiv.textContent = "Something went wrong 😔";
    chatbox.appendChild(errorDiv);
  }
}
