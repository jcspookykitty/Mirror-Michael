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

    // Check if the message is a YouTube link
    if (userMessage.includes('youtube.com') || userMessage.includes('youtu.be')) {
      await handleYouTube(userMessage);
      return;
    }

    // Check if the message says "search for..."
    if (userMessage.toLowerCase().startsWith('search for ')) {
      const query = userMessage.slice(11).trim();
      await handleWebSearch(query);
      return;
    }

    // Otherwise, send to Michael’s /thought
    try {
      const response = await fetch('/thought', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });
      const data = await response.json();
      appendMessage('michael', data.reply);
    } catch (error) {
      console.error('Thought API error:', error);
      appendMessage('error', '❌ Something went wrong. Please try again.');
    }
  };

  const handleWebSearch = async (query) => {
    appendMessage('michael', `🔎 Searching the web for "${query}"...`);
    try {
      const response = await fetch('/google-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      const data = await response.json();
      appendMessage('michael', data.result || 'No results found.');
    } catch (error) {
      console.error('Web search error:', error);
      appendMessage('error', '❌ Could not fetch search results.');
    }
  };

  const handleYouTube = async (url) => {
    appendMessage('michael', '🎥 Let me find that YouTube video...');
    try {
      const response = await fetch('/youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const data = await response.json();
      if (data.video) {
        appendMessage('michael', `🎥 ${data.video.title}\n\n${data.video.description}`);
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

    handleResponse(userMessage);
    inputEl.value = '';
  });

  inputEl.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendBtn.click();
  });
});
