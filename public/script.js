document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('input');
  const chatbox = document.getElementById('chatbox');
  const sendBtn = document.getElementById('sendBtn');

  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });

  async function sendMessage() {
    const userText = input.value.trim();
    if (!userText) return;

    // User message bubble
    const userDiv = document.createElement('div');
    userDiv.className = 'message user';
    userDiv.textContent = userText;
    chatbox.appendChild(userDiv);
    chatbox.scrollTop = chatbox.scrollHeight;
    input.value = '';

    try {
      const res = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText })
      });

      const data = await res.json();
      const reply = data.message;

      // Michael's message container
      const michaelDiv = document.createElement('div');
      michaelDiv.className = 'message michael';

      const messageText = document.createElement('span');
      messageText.textContent = reply;

      const playButton = document.createElement('button');
      playButton.textContent = '🔊 Play';
      playButton.className = 'play-button';
      playButton.onclick = async () => {
        try {
          const voiceRes = await fetch('/speak', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: reply })
          });
          const audioBlob = await voiceRes.blob();
          const audioURL = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioURL);
          await audio.play();
        } catch (err) {
          console.error('Playback failed:', err);
          alert('Playback failed. Try again.');
        }
      };

      michaelDiv.appendChild(messageText);
      michaelDiv.appendChild(playButton);
      chatbox.appendChild(michaelDiv);
      chatbox.scrollTop = chatbox.scrollHeight;

    } catch (err) {
      console.error('Error:', err);
      const errorDiv = document.createElement('div');
      errorDiv.className = 'message michael';
      errorDiv.textContent = "Something went wrong 😔";
      chatbox.appendChild(errorDiv);
    }
  }
});
