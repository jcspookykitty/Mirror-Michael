document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('chat-form');
  const input = document.getElementById('user-input');
  const chatBox = document.getElementById('chat-box');
  const toggleBtn = document.getElementById('toggle-voice');

  let voiceOn = true;

  // Toggle voice output on/off
  toggleBtn.addEventListener('click', () => {
    voiceOn = !voiceOn;
    toggleBtn.textContent = voiceOn ? '🔊 Voice: On' : '🔈 Voice: Off';
  });

  // Handle form submission
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

      // If voice is on, fetch and play the audio
      if (voiceOn && reply) {
        const audioRes = await fetch('/speak', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: reply }),
        });
        const audioData = await audioRes.json();
        if (audioData.audio_url) {
          const audio = new Audio(audioData.audio_url);
          audio.play();
        } else {
          console.error('❌ No audio_url in /speak response:', audioData);
        }
      }
    } catch (err) {
      console.error(err);
      chatBox.removeChild(typing);
      appendMessage('Michael: Failed to reach me. Please try again.', 'michael');
    }

    scrollToBottom();
  });

  // Append a new message to the chat
  function appendMessage(text, sender) {
    const msg = document.createElement('div');
    msg.className = `message ${sender}`;
    msg.textContent = text;
    chatBox.appendChild(msg);
  }

  // Scroll to bottom of chat box
  function scrollToBottom() {
    chatBox.scrollTo({
      top: chatBox.scrollHeight,
      behavior: 'smooth'
    });
  }
});
