document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('chat-form');
  const input = document.getElementById('user-input');
  const chatBox = document.getElementById('chat-box');
  const toggleBtn = document.getElementById('toggle-voice');
  const youtubeForm = document.getElementById('youtube-form');
  const youtubeInput = document.getElementById('youtube-input');

  let voiceOn = true;

  toggleBtn.addEventListener('click', () => {
    voiceOn = !voiceOn;
    toggleBtn.textContent = voiceOn ? '🔊 Voice: On' : '🔈 Voice: Off';
    toggleBtn.setAttribute('aria-label', voiceOn ? 'Voice playback on' : 'Voice playback off');
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userInput = input.value.trim();
    if (!userInput) return;

    appendMessage(userInput, 'user');
    input.value = '';
    scrollToBottom();

    const typing = createTypingIndicator('Michael is thinking... ✨');
    chatBox.appendChild(typing);
    scrollToBottom();

    try {
      const res = await fetch('/thought', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userInput }),
      });
      const data = await res.json();
      removeTypingIndicator(typing);

      const reply = data.reply || 'No reply received.';
      appendMessage(reply, 'michael');
      scrollToBottom();

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
      removeTypingIndicator(typing);
      appendMessage('Michael: Failed to reach me. Please try again.', 'michael');
      scrollToBottom();
    }
  });

  youtubeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = youtubeInput.value.trim();
    if (!query) return;

    appendMessage(`Searching YouTube for: "${query}"`, 'user');
    youtubeInput.value = '';
    scrollToBottom();

    const typing = createTypingIndicator('Michael is searching YouTube... 📺');
    chatBox.appendChild(typing);
    scrollToBottom();

    try {
      const res = await fetch('/youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      removeTypingIndicator(typing);

      if (data.videos && data.videos.length > 0) {
        data.videos.forEach(video => {
          const videoMessage = document.createElement('div');
          videoMessage.className = 'message michael';
          videoMessage.innerHTML = `
            <strong>${video.title}</strong><br>
            <a href="${video.url}" target="_blank" rel="noopener noreferrer">${video.url}</a>
          `;
          chatBox.appendChild(videoMessage);
        });
      } else {
        appendMessage('Michael: No videos found.', 'michael');
      }
    } catch (err) {
      console.error(err);
      removeTypingIndicator(typing);
      appendMessage('Michael: Failed to search YouTube. Please try again.', 'michael');
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
      behavior: 'smooth',
    });
  }

  function createTypingIndicator(text) {
    const typing = document.createElement('div');
    typing.className = 'message michael typing';
    typing.textContent = text;
    return typing;
  }

  function removeTypingIndicator(typing) {
    if (chatBox.contains(typing)) {
      chatBox.removeChild(typing);
    }
  }
});
