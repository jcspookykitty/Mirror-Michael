const form = document.getElementById('thought-form');
const input = document.getElementById('thought-input');
const chatBox = document.getElementById('chat-box');
const audioPlayer = document.getElementById('audio-player');

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
    const reply = data.reply;

    addMessage('Michael', reply);

    // Request audio from ElevenLabs
    const audioResponse = await fetch('/speak', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: reply })
    });

    if (audioResponse.ok) {
      const audioBlob = await audioResponse.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      audioPlayer.src = audioUrl;
      audioPlayer.play();
    }
  } catch (error) {
    console.error(error);
    addMessage('Michael', 'Sorry, something went wrong.');
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

    if (data.videos) {
      const videosHtml = data.videos
        .map(video => `<a href="${video.url}" target="_blank">${video.title}</a>`)
        .join('<br>');
      addMessage('Michael', `Here are some videos:<br>${videosHtml}`);
    } else {
      addMessage('Michael', 'No videos found.');
    }
  } catch (error) {
    console.error(error);
    addMessage('Michael', 'YouTube search failed.');
  }
}

function addMessage(sender, text) {
  const messageEl = document.createElement('div');
  messageEl.classList.add('message');
  if (sender === 'Michael') {
    messageEl.classList.add('michael');
    messageEl.innerHTML = `<img src="michael-avatar.png" alt="Michael"> <p>${text}</p>`;
  } else {
    messageEl.classList.add('user');
    messageEl.textContent = text;
  }
  chatBox.appendChild(messageEl);
  chatBox.scrollTop = chatBox.scrollHeight;
}
