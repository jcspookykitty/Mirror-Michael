// public/chat.js
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

      if (data.followUpOptions) {
        appendMessage('michael', data.reply);
        showFollowUpOptions(data.followUpOptions, userMessage);
      } else {
        appendMessage('michael', data.reply);
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
      const searchResponse = await fetch('/thought', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `search the web for ${query}` })
      });
      const searchData = await searchResponse.json();
      appendMessage('michael', searchData.reply);
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
        appendMessage('michael', `🎥 **${title}**\n\n${description}\n\n👍 Likes: ${likes} | 👁️ Views: ${views}`);
      } else {
        appendMessage('michael', '❌ Could not fetch video details.');
      }
    } catch (error) {
      console.error('YouTube fetch error:', error);
      appendMessage('error', '❌ Failed to fetch video.');
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
