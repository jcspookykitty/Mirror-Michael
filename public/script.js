// script.js
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
    typing.innerHTML = `
      <div class="avatar"></div>
      <div class="text">Michael is thinking... ✨</div>
    `;
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

      // If videos returned, show them
      if (data.videos && data.videos.length > 0) {
        appendMessage(data.reply, 'michael');
        data.videos.forEach(video => {
          const videoMsg = document.createElement('div');
          videoMsg.className = 'message michael';
          videoMsg.innerHTML = `
            <div class="avatar"></div>
            <div class="text">
              <strong>${video.title}</strong><br>
              <a href="${video.url}" target="_blank">${video.url}</a>
            </div>
          `;
          chatBox.appendChild(videoMsg);
        });
      } else {
        appendMessage(data.reply, 'michael');
      }

      // Voice
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
        }
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
    if (sender === 'michael') {
      msg.innerHTML = `
        <div class="avatar"></div>
        <div class="text">${text}</div>
      `;
    } else {
      msg.innerHTML = `<div class="text">${text}</div>`;
    }
    chatBox.appendChild(msg);
  }

  function scrollToBottom() {
    chatBox.scrollTo({
      top: chatBox.scrollHeight,
      behavior: 'smooth'
    });
  }
});
