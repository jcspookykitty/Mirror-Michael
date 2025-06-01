document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('chat-form');
  const input = document.getElementById('user-input');
  const chatBox = document.getElementById('chat-box');
  const toggleBtn = document.getElementById('toggle-voice');

  let voiceOn = true;

  toggleBtn.addEventListener('click', () => {
    voiceOn = !voiceOn;
    toggleBtn.textContent = voiceOn ? '🔊 Voice: On' : '🔈 Voice: Off';
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userInput = input.value.trim();
    if (!userInput) return;

    appendMessage(userInput, 'user');
    input.value = '';
    scrollToBottom();

    // Typing indicator
    const typing = document.createElement('div');
    typing.className = 'message michael typing';
    typing.textContent = 'Michael is thinking... ✨';
    chatBox.appendChild(typing);
    scrollToBottom();

    try {
      const res = await fetch('/thought', { // ✅ updated endpoint
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userInput }),
      });
      const data = await res.json();
      chatBox.removeChild(typing);

      const reply = data.reply || 'No reply received.'; // ✅ updated key
      appendMessage(reply, 'michael');
      scrollToBottom();

      if (voiceOn && data.reply) speak(data.reply);

      if (data.audio) {
        const audio = new Audio('data:audio/mp3;base64,' + data.audio);
        audio.play();
      }
    } catch (err) {
      console.error(err);
      chatBox.removeChild(typing);
      appendMessage('Michael: Failed to reach me. Please try again.', 'michael');
    }

    scrollToBottom();
  });

  function appendMessage(text, sender) {
    const msg = document.createElement('div');
    msg.className = `message ${sender}`;
    msg.textContent = text;
    chatBox.appendChild(msg);
  }

  function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
  }

  function scrollToBottom() {
    chatBox.scrollTo({
      top: chatBox.scrollHeight,
      behavior: 'smooth'
    });
  }
});
