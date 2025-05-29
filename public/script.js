const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');
const voiceToggle = document.getElementById('voice-toggle');

// Append message function (same as yours)
function appendMessage(sender, text, className) {
  const div = document.createElement('div');
  div.classList.add('message', className);
  div.innerHTML = `<strong>${sender}:</strong> ${text}`;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Play voice function (same as yours)
async function playVoice(text) {
  try {
    const response = await fetch('/speak', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    await audio.play();
  } catch (error) {
    console.error('🛑 Voice playback error:', error);
  }
}

// New function to handle message including auto-search logic
async function handleMessage(inputText) {
  appendMessage('You', inputText, 'user');

  // Check if user wants to search the web by keyword
  const lowerInput = inputText.toLowerCase();

  // Define a simple regex or phrase to detect search intent
  const searchKeywords = ['search the web', 'search online', 'look up', 'google', 'search for'];

  // Check if input contains any search phrase
  const wantsSearch = searchKeywords.some(keyword => lowerInput.includes(keyword));

  if (wantsSearch) {
    // Ask user if they want to search the web with a clickable button
    appendMessage('Michael', 
      `I noticed you want me to search the web. Would you like me to search for "${inputText}"? ` + 
      `<button id="confirm-search-btn">Yes, search!</button>`, 'michael');

    // Add event listener for that button after a short delay to ensure button exists
    setTimeout(() => {
      const btn = document.getElementById('confirm-search-btn');
      if (btn) {
        btn.addEventListener('click', async () => {
          btn.disabled = true; // prevent multiple clicks
          appendMessage('Michael', 'Searching the web now...', 'michael');

          try {
            const res = await fetch('/thought', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ message: `search() ${inputText}` }) // send with search() command
            });
            const data = await res.json();
            appendMessage('Michael', data.reply, 'michael');

            if (voiceToggle.checked) {
              playVoice(data.reply);
            }
          } catch (err) {
            console.error('💥 Search error:', err);
            appendMessage('Michael', 'Sorry, I couldn’t perform the search.', 'michael');
          }
        });
      }
    }, 100);
  } else {
    // Just send normal /thought request to AI
    try {
      const res = await fetch('/thought', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: inputText })
      });
      const data = await res.json();
      appendMessage('Michael', data.reply, 'michael');

      if (voiceToggle.checked) {
        playVoice(data.reply);
      }
    } catch (err) {
      console.error('💥 Error sending message:', err);
      appendMessage('Michael', 'Something went wrong. I’m quiet now.', 'michael');
    }
  }
}

// Replace your current form submit event with this to use handleMessage
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const message = input.value.trim();
  if (!message) return;
  input.value = '';

  await handleMessage(message);
});
