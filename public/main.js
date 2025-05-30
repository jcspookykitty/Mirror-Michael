document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('chat-form');
  const input = form.querySelector('input');
  const chatBox = document.getElementById('chat-box');
  const toggleBtn = document.getElementById('toggle-voice');

  let voiceOn = false;

  toggleBtn.addEventListener('click', () => {
    voiceOn = !voiceOn;
    toggleBtn.textContent = voiceOn ? '🔊 Voice: On' : '🔈 Voice: Off';
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const userInput = input.value.trim();
    if (!userInput) return;

    sendMessage(userInput);
    input.value = '';
  });

  async function sendMessage(userInput) {
    // Add user's message to chat box
    const userMessage = document.createElement('div');
    userMessage.className = 'message user';
    userMessage.textContent = userInput;
    chatBox.appendChild(userMessage);

    // Add typing indicator
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'message typing';
    typingIndicator.textContent = 'Michael is thinking... ✨';
    chatBox.appendChild(typingIndicator);

    // Scroll to bottom
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
      const res = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userInput }),
      });

      // Remove typing indicator
      chatBox.removeChild(typingIndicator);

      if (!res.ok) {
        let errorMsg = `HTTP error: ${res.status}`;
        try {
          const errData = await res.json();
          if (errData.error) errorMsg = errData.error;
        } catch {}
        const errorMsgEl = document.createElement('div');
        errorMsgEl.className = 'message michael';
        errorMsgEl.textContent = `Michael: Something went wrong: ${errorMsg}`;
        chatBox.appendChild(errorMsgEl);
        chatBox.scrollTop = chatBox.scrollHeight;
        return;
      }

      const data = await res.json();

      // Michael's reply
      const michaelMessage = document.createElement('div');
      michaelMessage.className = 'message michael';
      michaelMessage.textContent = data.message || 'No reply received.';
      chatBox.appendChild(michaelMessage);

      // Voice synthesis (optional)
      if (voiceOn && data.message) {
        speak(data.message);
      }

      // Play audio if server sent it
      if (data.audio) {
        const audio = new Audio('data:audio/mp3;base64,' + data.audio);
        audio.play();
      }

    } catch (error) {
      console.error('Fetch error:', error);
      chatBox.removeChild(typingIndicator);
      const errorMsgEl = document.createElement('div');
      errorMsgEl.className = 'message michael';
      errorMsgEl.textContent = 'Michael: Failed to reach me. Please try again.';
      chatBox.appendChild(errorMsgEl);
    }

    // Scroll to bottom
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
  }
});
