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
    const userInputText = input.value.trim();
    if (!userInputText) return;

    appendMessage(userInputText, 'user');
    input.value = '';
    scrollToBottom();

    // Typing indicator
    const typing = document.createElement('div');
    typing.className = 'message michael typing';
    typing.textContent = 'Michael is thinking... ✨';
    chatBox.appendChild(typing);
    scrollToBottom();

    try {
      if (userInputText.toLowerCase().startsWith('youtube ')) {
        const query = userInputText.slice(8).trim();

        const youtubeRes = await fetch('/youtube', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query }),
        });
        const youtubeData = await youtubeRes.json();
        chatBox.removeChild(typing);

        if (youtubeData.videos && youtubeData.videos.length > 0) {
          const videoLinks = youtubeData.videos
            .map(v => `<a href="${v.url}" target="_blank">${v.title}</a>`)
            .join('<br>');
          appendMessage(`Here are some YouTube links:<br>${videoLinks}`, 'michael', true);
        } else {
          appendMessage('Michael: I couldn’t find any videos.', 'michael');
        }
      } else {
        const res = await fetch('/thought', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: userInputText }),
        });
        const data = await res.json();
        chatBox.removeChild(typing);

        const reply = data.reply || 'No reply received.';
        appendMessage(reply, 'michael');
        scrollToBottom();

        if (voiceOn && data.reply) speak(data.reply);

        if (data.audio) {
          const audio = new Audio('data:audio/mp3;base64,' + data.audio);
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

  function appendMessage(text, sender, isHTML = false) {
    const msg = document.createElement('div');
    msg.className = `message ${sender}`;
    if (isHTML) {
      msg.innerHTML = text;
    } else {
      msg.textContent = text;
    }
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
