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

      // Append main reply
      appendMessage(data.reply || 'No reply received.', 'michael');

      // If videos are included, display them
      if (data.videos && data.videos.length > 0) {
        data.videos.forEach(video => {
          const videoMessage = document.createElement('div');
          videoMessage.className = 'message michael';
          videoMessage.innerHTML = `
            <strong>${video.title}</strong><br>
            <a href="${video.url}" target="_blank">${video.url}</a>
          `;
          chatBox.appendChild(videoMessage);
        });
      }

      // Play voice if enabled
      if (voiceOn && data.reply) {
        const audioRes = await fetch('/speak', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: data.reply }),
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
      appendMessage('Michael: Something went wrong. Please try again.', 'michael');
    }

    scrollToBottom();
  });

  function appendMessage(text, sender) {
    const msg = document.createElement('div');
    msg.className = `message ${sender}`;
    msg.textContent = text;
    chatBox.appendChild(msg);
  }

  function scrollToBottom() {
    chatBox.scrollTo({
      top: chatBox.scrollHeight,
      behavior: 'smooth'
    });
  }
});
