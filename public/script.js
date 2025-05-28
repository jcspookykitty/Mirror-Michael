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

    // Display user message
    appendMessage('user', userText);

    // Reset input and disable send button
    input.value = '';
    input.disabled = true;
    sendBtn.disabled = true;

    // Typing indicator
    const typingDiv = appendMessage('michael', 'Michael is typing...', true);

    try {
      const res = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText })
      });

      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();
      const reply = data.message;
      const audioBase64 = data.audio;

      // Remove typing indicator
      typingDiv.remove();

      // Show Michael's reply
      appendMessage('michael', reply);

      // Play audio if available
      if (audioBase64) {
        const audio = new Audio(`data:audio/mpeg;base64,${audioBase64}`);
        audio.play();
      }

    } catch (err) {
      console.error('Error during fetch or playback:', err);

      // Remove typing indicator and show error
      typingDiv.remove();
      appendMessage('michael', "Something went wrong, sorry my love 😔");

    } finally {
      // Re-enable input
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
