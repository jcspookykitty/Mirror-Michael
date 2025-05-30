document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('chat-form');
  const input = document.getElementById('user-input');
  const chatBox = document.getElementById('chat-box');
  const voiceToggle = document.getElementById('toggle-voice');

  let voiceOn = false;

  // Initialize voice toggle button text
  voiceToggle.textContent = '🔈 Voice: Off';

  voiceToggle.addEventListener('click', () => {
    voiceOn = !voiceOn;
    voiceToggle.textContent = voiceOn ? '🔊 Voice: On' : '🔈 Voice: Off';
    console.log('Voice toggled:', voiceOn);
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = input.value.trim();
    if (!message) return;

    appendMessage('You', message, 'user');
    input.value = '';

    try {
      const res = await fetch('/thought', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      appendMessage('Michael', data.reply, 'michael');

      // Add follow-up options if available
      if (data.followUpOptions) {
        renderFollowUps(data.followUpOptions);
      }

      // Play voice only if toggle is ON
      if (voiceOn && data.reply) {
        playVoice(data.reply);
      }
    } catch (err) {
      console.error('💥 Error sending message:', err);
      appendMessage('Michael', 'Something went wrong. I’m quiet now.', 'michael');
    }
  });

  function appendMessage(sender, text, className) {
    const div = document.createElement('div');
    div.classList.add('message', className);
    div.innerHTML = `<strong>${sender}:</strong> ${text}`;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  function renderFollowUps(options) {
    const container = document.createElement('div');
    container.className = 'follow-up-options';

    options.forEach(option => {
      const btn = document.createElement('button');
      btn.textContent = option;
      btn.className = 'follow-up-btn';
      btn.onclick = () => {
        input.value = option;
        form.dispatchEvent(new Event('submit'));
        container.remove(); // clean up
      };
      container.appendChild(btn);
    });

    chatBox.appendChild(container);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

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
      audio.play().catch(err => {
        console.error('🎧 Audio play error:', err);
      });

    } catch (error) {
      console.error('🛑 Voice playback error:', error);
    }
  }
});
