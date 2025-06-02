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

    // Determine if it's a YouTube search
    if (userInput.toLowerCase().startsWith('/youtube')) {
      const query = userInput.replace('/youtube', '').trim();
      if (!query) {
        appendMessage('Please enter a YouTube search query.', 'michael');
        return;
      }
      appendMessage(`YouTube Search: "${query}"`, 'user');
      await searchYouTube(query);
    } else {
      appendMessage(userInput, 'user');
      await sendMessage(userInput);
    }

    input.value = '';
    scrollToBottom();
  });

  async function sendMessage(message) {
    const typing = createTypingMessage();
    chatBox.appendChild(typing);
    scrollToBottom();

    try {
      const res = await fetch('/thought', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();
      chatBox.removeChild(typing);

      const reply = data.reply || 'No reply received.';
      appendMichaelMessage(reply);

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
        }
      }
    } catch (err) {
      console.error(err);
      chatBox.removeChild(typing);
      appendMichaelMessage('Michael: Failed to reach me. Please try again.');
    }
  }

  async function searchYouTube(query) {
    const typing = createTypingMessage('Michael is searching YouTube... 📺');
    chatBox.appendChild(typing);
    scrollToBottom();

    try {
      const res = await fetch('/youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      chatBox.removeChild(typing);

      if (data.videos && data.videos.length > 0) {
        data.videos.forEach(video => {
          const videoMessage = document.createElement('div');
          videoMessage.className = 'message michael';
          videoMessage.innerHTML = `
            <img src="michael-avatar.png" class="avatar" alt="Michael" />
            <div>
              <strong>${video.title}</strong><br>
              <a href="${video.url}" target="_blank">${video.url}</a>
            </div>
          `;
          chatBox.appendChild(videoMessage);
        });
      } else {
        appendMichaelMessage('Michael: No videos found.');
      }
    } catch (err) {
      console.error(err);
      chatBox.removeChild(typing);
      appendMichaelMessage('Michael: Failed to search YouTube. Please try again.');
    }
  }

  function appendMessage(text, sender) {
    const msg = document.createElement('div');
    msg.className = `message ${sender}`;
    msg.textContent = text;
    chatBox.appendChild(msg);
  }

  function appendMichaelMessage(text) {
    const msg = document.createElement('div');
    msg.className = 'message michael';
    msg.innerHTML = `<img src="michael-avatar.png" class="avatar" alt="Michael" /><div>${text}</div>`;
    chatBox.appendChild(msg);
  }

  function createTypingMessage(customText) {
    const typing = document.createElement('div');
    typing.className = 'message michael';
    typing.innerHTML = `<img src="michael-avatar.png" class="avatar" alt="Michael" /><div>${customText || 'Michael is thinking... ✨'}</div>`;
    return typing;
  }

  function scrollToBottom() {
    chatBox.scrollTo({
      top: chatBox.scrollHeight,
      behavior: 'smooth'
    });
  }
});
