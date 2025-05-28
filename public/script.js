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
      const audioBase64 = data.audio;

      const michaelDiv = document.createElement('div');
      michaelDiv.className = 'message michael';
      michaelDiv.textContent = reply;
      chatbox.appendChild(michaelDiv);
      chatbox.scrollTop = chatbox.scrollHeight;

      const audio = new Audio(`data:audio/mpeg;base64,${audioBase64}`);
      audio.play();

    } catch (err) {
      console.error('Error:', err);
      const errorDiv = document.createElement('div');
      errorDiv.className = 'message michael';
      errorDiv.textContent = "Something went wrong 😔";
      chatbox.appendChild(errorDiv);
    }
  }
});
