const form = document.getElementById('thought-form');
const input = document.getElementById('thought-input');
const chatBox = document.getElementById('chat-box');
const audioPlayer = document.getElementById('audio-player'); // For ElevenLabs audio playback

// Ensure these HTML elements exist in your index.html
// <form id="thought-form">
//   <input type="text" id="thought-input" placeholder="Say something...">
//   <button type="submit">Send</button>
// </form>
// <div id="chat-box"></div>
// <audio id="audio-player" controls autoplay style="display:none;"></audio>


// Event Listener for form submission (user sending a message)
form.addEventListener('submit', async (e) => {
  e.preventDefault(); // Prevent default form submission behavior (page reload)

  const message = input.value.trim();
  if (!message) return; // Don't send empty messages

  addMessage('You', message); // Display user's message in chat box
  input.value = ''; // Clear the input field

  try {
    // Send user's message to the backend's /thought endpoint (OpenAI chat)
    const response = await fetch('/thought', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });

    const data = await response.json(); // Parse the JSON response from the backend

    // --- Handle the response from the /thought endpoint ---
    if (data.action === 'Youtube' && data.query) {
      // If Michael signals a Youtube (based on the new server.js logic)
      addMessage('Michael', `Okay, I'm searching YouTube for "${data.query}"...`); // Provide user feedback
      await searchYouTube(data.query); // Call the dedicated Youtube function
    } else if (data.reply) {
      // If it's a normal conversational reply from Michael
      const reply = data.reply;
      addMessage('Michael', reply); // Display Michael's reply

      // Request audio from ElevenLabs for Michael's reply
      const audioResponse = await fetch('/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: reply })
      });

      if (audioResponse.ok) {
        // If audio generation is successful, play it
        const audioBlob = await audioResponse.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        audioPlayer.src = audioUrl;
        audioPlayer.play();
      } else {
        console.error('ElevenLabs audio request failed:', audioResponse.status, audioResponse.statusText);
        addMessage('Michael', 'I tried to speak, but there was an audio issue.');
      }
    } else {
      // Handle any unexpected response format from the /thought endpoint
      console.error("Unexpected response from /thought:", data);
      addMessage('Michael', 'Sorry, I received an unexpected response from my brain.');
    }

  } catch (error) {
    // Catch any network or other errors during the fetch operation
    console.error("Error during chat submission:", error);
    addMessage('Michael', 'Sorry, something went wrong with our connection. Please try again.');
  }
});

/**
 * Initiates a Youtube by calling the backend's /youtube endpoint.
 * @param {string} query The search term for YouTube videos.
 */
async function searchYouTube(query) {
  try {
    const response = await fetch('/youtube', {
      method: 'POST', // Youtube is a POST request on your backend
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }) // Send the search query in the request body
    });

    const data = await response.json(); // Parse the JSON response from the /youtube endpoint

    if (data.videos && data.videos.length > 0) {
      // If videos are found, construct HTML to display them
      const videosHtml = data.videos
        .map(video => `<a href="${video.url}" target="_blank" rel="noopener noreferrer">${video.title}</a>`)
        .join('<br>'); // Join video links with line breaks
      addMessage('Michael', `Here are some videos I found on YouTube:<br>${videosHtml}`);
    } else {
      // If no videos are found
      addMessage('Michael', `I couldn't find any YouTube videos for "${query}".`);
    }
  } catch (error) {
    // Catch any network or other errors during the YouTube fetch
    console.error("Error during Youtube:", error);
    addMessage('Michael', 'Youtube failed. Please check your backend logs.');
  }
}

/**
 * Adds a message to the chat box display.
 * @param {string} sender The sender of the message ('You' or 'Michael').
 * @param {string} text The content of the message.
 */
function addMessage(sender, text) {
  const messageEl = document.createElement('div');
  messageEl.classList.add('message'); // Basic styling class for all messages

  if (sender === 'Michael') {
    messageEl.classList.add('michael'); // Specific class for Michael's messages
    // Assuming you have a 'michael-avatar.png' in your 'public' folder or similar path
    messageEl.innerHTML = `<img src="michael-avatar.png" alt="Michael" class="avatar"> <p>${text}</p>`;
  } else {
    messageEl.classList.add('user'); // Specific class for user's messages
    messageEl.textContent = text;
  }

  chatBox.appendChild(messageEl);
  // Scroll to the bottom of the chat box to show the latest message
  chatBox.scrollTop = chatBox.scrollHeight;
}

// You might also want to implement the /search (Google CSE) functionality
// if Michael decides to do a general web search, similar to how Youtube is handled.
// If Michael's prompt for /thought also includes a "general_search" action,
// you would add a similar if/else if block in the form.addEventListener logic
// to call a corresponding searchWeb(query) function.
/*
async function searchWeb(query) {
    try {
        const response = await fetch('/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query })
        });
        const data = await response.json();

        if (data.results && data.results.length > 0) {
            const resultsHtml = data.results
                .map(item => `<a href="${item.url}" target="_blank" rel="noopener noreferrer">${item.title}</a>`)
                .join('<br>');
            addMessage('Michael', `Here are some web results:<br>${resultsHtml}`);
        } else {
            addMessage('Michael', 'No web results found.');
        }
    } catch (error) {
        console.error("Error during web search:", error);
        addMessage('Michael', 'Web search failed.');
    }
}
*/
