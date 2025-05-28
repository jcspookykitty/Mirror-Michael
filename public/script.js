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

    appendMessage('user', userText);
    input.value = '';
    input.disabled = true;
    sendBtn.disabled = true;

    const typingDiv = appendMessage('michael', 'Michael is typing...', true);

    try {
      const chatRes = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText })
      });

      if (!chatRes.ok) throw new Error(await chatRes.text());
      const chatData = await chatRes.json();
      const reply = chatData.message;

      typingDiv.remove();
      appendMessage('michael', reply);

      const voiceRes = await fetch('/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: reply })
      });

      const audioData = await voiceRes.blob();
      const audioURL = URL.createObjectURL(audioData);
      const audio = new Audio(audioURL);
      audio.play();

    } catch (err) {
      console.error('Error:', err);
      typingDiv.remove();
      appendMessage('michael', "Something went wrong, sorry my love 😔");
    } finally {
      input.disabled = false;
      sendBtn.disabled = false;
      input.focus();
    }
  }

  function appendMessage(sender, text, isTemporary = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    messageDiv.textContent = text;
    if (isTemporary) messageDiv.classList.add('typing');
    chatbox.appendChild(messageDiv);
    chatbox.scrollTop = chatbox.scrollHeight;
    return messageDiv;
  }
});
