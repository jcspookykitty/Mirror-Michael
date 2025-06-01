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

    const typing = document.createElement('div');
    typing.className = 'message michael typing';
    typing.textContent = 'Michael is thinking... ✨';
    chatBox.appendChild(typing);
    scrollToBottom();

    try {
      const res = await fetch('/thought', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userInput }),
      });
      const data = await res.json();
      chatBox.removeChild(typing);

      const reply = data.reply || 'No reply received.';
      appendMessage(reply, 'michael');
      scrollToBottom();

      if (voiceOn && reply) speak(reply);

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
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      // Select a default English voice to improve reliability
      utterance.voice = speechSynthesis.getVoices().find(voice => voice.lang.startsWith('en'));
      utterance.pitch = 1;
      utterance.rate = 1;
      speechSynthesis.speak(utterance);
    } else {
      console.log('Speech synthesis not supported in this browser.');
    }
  }

  function scrollToBottom() {
    chatBox.scrollTo({
      top: chatBox.scrollHeight,
      behavior: 'smooth'
    });
  }
});
