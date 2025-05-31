document.addEventListener('DOMContentLoaded', () => {
  const inputEl = document.getElementById('chat-input');
  const outputEl = document.getElementById('chat-output');
  const sendBtn = document.getElementById('send-btn');

  const appendMessage = (role, text) => {
    const messageEl = document.createElement('div');
    messageEl.classList.add('message', role);
    messageEl.textContent = text;
    outputEl.appendChild(messageEl);
    outputEl.scrollTop = outputEl.scrollHeight;
  };

  const handleResponse = async (userMessage) => {
    appendMessage('user', userMessage);

    try {
      const response = await fetch('/thought', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });
      const data = await response.json();

      if (data.reply) {
        appendMessage('michael', data.reply);
        playElevenLabsAudio(data.reply);
      }

      if (data.followUpOptions) {
        showFollowUpOptions(data.followUpOptions, userMessage);
      }
    } catch (error) {
      console.error('Thought API error:', error);
      appendMessage('error', '❌ Something went wrong. Please try again.');
    }
  };

  const showFollowUpOptions = (options, originalMessage) => {
    const optionsEl = document.createElement('div');
    optionsEl.classList.add('follow-up-options');

    options.forEach(option => {
      const btn = document.createElement('button');
      btn.textContent = option;
      btn.addEventListener('click', () => {
        handleFollowUp(option, originalMessage);
        optionsEl.remove();
      });
      optionsEl.appendChild(btn);
    });

    outputEl.appendChild(optionsEl);
  };

  const handleFollowUp = async (option, originalMessage) => {
    if (option.toLowerCase().includes('search')) {
      appendMessage('michael', '🔎 Let me look that up for you...');
      await handleWebSearch(originalMessage);
    } else {
      appendMessage('michael', '💬 Okay, let’s keep talking.');
    }
  };

  const handleWebSearch = async (query) => {
    try {
      const searchResponse = await fetch('/google-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      const searchData = await searchResponse.json();
      appendMessage('michael', searchData.result);
      playElevenLabsAudio(searchData.result);
    } catch (error) {
      console.error('Web search error:', error);
      appendMessage('error', '❌ Could not fetch search results.');
    }
  };

  const handleYouTube = async (url) => {
    try {
      const response = await fetch('/youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl: url })
      });
      const data = await response.json();
      if (data.video) {
        const { title, description, views, likes } = data.video;
        const videoInfo = `🎥 ${title}\n\n${description}\n\n👍 Likes: ${likes} | 👁️ Views: ${views}`;
        appendMessage('michael', videoInfo);
        playElevenLabsAudio(`Here is the video info. Title: ${title}. It has ${views} views and ${likes} likes.`);
      } else {
        appendMessage('michael', '❌ Could not fetch video details.');
      }
    } catch (error) {
      console.error('YouTube fetch error:', error);
      appendMessage('error', '❌ Failed to fetch video.');
    }
  };

  const playElevenLabsAudio = async (text) => {
    try {
      const response = await fetch('/elevenlabs/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      const data = await response.json();
      if (data.audio) {
        const audio = new Audio(`data:audio/mpeg;base64,${data.audio}`);
        audio.play();
      }
    } catch (error) {
      console.error('Eleven Labs TTS error:', error);
    }
  };

  sendBtn.addEventListener('click', () => {
    const userMessage = inputEl.value.trim();
    if (!userMessage) return;

    if (userMessage.includes('youtube.com') || userMessage.includes('youtu.be')) {
      handleYouTube(userMessage);
    } else {
      handleResponse(userMessage);
    }

    inputEl.value = '';
  });

  inputEl.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendBtn.click();
  });
});
