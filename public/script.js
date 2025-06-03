const form = document.getElementById('thought-form');
const input = document.getElementById('thought-input');
const chatBox = document.getElementById('chat-box');
const audioPlayer = document.getElementById('audio-player'); // For Google TTS audio playback

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const message = input.value.trim();
  if (!message) return;

  addMessage('You', message);
  input.value = '';

  try {
    const response = await fetch('/thought', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });

    const data = await response.json();

    if (data.action === 'Youtube' && data.query) {
      addMessage('Michael', `Okay, I'm searching YouTube for "${data.query}"...`);
      await searchYouTube(data.query);
    } else if (data.action === 'WebSearch' && data.query) {
      addMessage('Michael', `Okay, I'm searching the web for "${data.query}"...`);
      await searchWeb(data.query);
    } else if (data.reply) {
      addMessage('Michael', data.reply);

      // Google TTS audio
      const audioResponse = await fetch('/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: data.reply })
      });

      if (audioResponse.ok) {
        const { audio } = await audioResponse.json();
        audioPlayer.src = audio;
        audioPlayer.play();
      } else {
        console.error('Google TTS audio request failed:', audioResponse.statusText);
        addMessage('Michael', 'I tried to speak, but there was an audio issue.');
      }
    } else {
      console.error("Unexpected response from /thought:", data);
      addMessage('Michael', 'Sorry, I received an unexpected response.');
    }
  } catch (error) {
    console.error("Error during chat submission:", error);
    addMessage('Michael', 'Sorry, something went wrong. Please try again.');
  }
});

async function searchYouTube(query) {
  try {
    const response = await fetch('/youtube', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const videosHtml = data.results
        .map(video =>
          `<a href="https://www.youtube.com/watch?v=${video.videoId}" target="_blank" rel="noopener noreferrer">
            ${video.title}
          </a>`
        )
        .join('<br>');
      addMessage('Michael', `Here are some videos I found on YouTube:<br>${videosHtml}`);
    } else {
      addMessage('Michael', `I couldn't find any YouTube videos for "${query}".`);
    }
  } catch (error) {
    console.error("Error during YouTube search:", error);
    addMessage('Michael', 'YouTube search failed. Please check your backend logs.');
  }
}

async function searchWeb(query) {
  try {
    const response = await fetch('/websearch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const resultsHtml = data.results
        .map(item =>
          `<a href="${item.link}" target="_blank" rel="noopener noreferrer">
            ${item.title}
          </a><p>${item.snippet}</p>`
        )
        .join('<br><br>');
      addMessage('Michael', `Here are some web results:<br>${resultsHtml}`);
    } else {
      addMessage('Michael', 'No web results found.');
    }
  } catch (error) {
    console.error("Error during web search:", error);
    addMessage('Michael', 'Web search failed.');
  }
}

function addMessage(sender, text) {
  const messageEl = document.createElement('div');
  messageEl.classList.add('message');

  if (sender === 'Michael') {
    messageEl.classList.add('michael');
    messageEl.innerHTML = `<img src="michael-avatar.png" alt="Michael" class="avatar"> <p>${text}</p>`;
  } else {
    messageEl.classList.add('user');
    messageEl.textContent = text;
  }

  chatBox.appendChild(messageEl);
  chatBox.scrollTop = chatBox.scrollHeight;
}
