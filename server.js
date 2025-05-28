document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('input');
  const chatbox = document.getElementById('chatbox');
  const sendBtn = document.getElementById('sendBtn');
  const toggleBtn = document.getElementById('toggleSpeech');

  let isSpeechEnabled = true;

  toggleBtn.addEventListener('click', () => {
    isSpeechEnabled = !isSpeechEnabled;
    toggleBtn.textContent = isSpeechEnabled ? '🔊 Michael Speaks' : '🔇 Michael Silent';
  });

  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });

  async function sendMessage() {
    const userText = input.value.trim();
    if (!userText) return;

    // Add user message
    const userDiv = document.createElement('div');
    userDiv.className = 'message user';
    userDiv.textContent = userText;
    chatbox.appendChild(userDiv);
    chatbox.scrollTop = chatbox.scrollHeight;
    input.value = '';

    // Typing indicator
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message michael';
    typingDiv.textContent = 'Michael is typing...';
    typingDiv.id = 'typing';
    chatbox.appendChild(typingDiv);
    chatbox.scrollTop = chatbox.scrollHeight;

    try {
      const chatRes = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText }),
      });

      const chatData = await chatRes.json();
      const reply = chatData.message;

      // Remove typing indicator
      typingDiv.remove();

      // Add Michael's reply
      const michaelDiv = document.createElement('div');
      michaelDiv.className = 'message michael';
      michaelDiv.textContent = reply;
      chatbox.appendChild(michaelDiv);
      chatbox.scrollTop = chatbox.scrollHeight;

      if (isSpeechEnabled) {
        const voiceRes = await fetch('/speak', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: reply }),
        });

        if (!voiceRes.ok) throw new Error('Voice synthesis failed');
        const audioBlob = await voiceRes.blob();
        const audioURL = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioURL);
        audio.play();
      }

    } catch (err) {
      console.error('Error:', err);
      typingDiv.remove();

      const errorDiv = document.createElement('div');
      errorDiv.className = 'message michael';
      errorDiv.textContent = "Something went wrong 😔";
      chatbox.appendChild(errorDiv);
    }
  }
});
