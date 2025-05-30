document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('chat-form');
  const input = document.getElementById('user-input');
  const chatBox = document.getElementById('chat-box');
  const toggleBtn = document.getElementById('toggle-voice');

  let voiceOn = false;

  toggleBtn.addEventListener('click', () => {
    voiceOn = !voiceOn;
    toggleBtn.textContent = voiceOn ? '🔊 Voice: On' : '🔈 Voice: Off';
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = input.value.trim();
    if (!message) return;

    appendMessage('You', message, 'user');
    input.value = '';

    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'message typing';
    typingIndicator.textContent = 'Michael is thinking... ✨';
    chatBox.appendChild(typingIndicator);
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
      const res = await fetch('/thought', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });

      chatBox.removeChild(typingIndicator);

      if (!res.ok) {
        throw new Error(`HTTP error: ${res.status}`);
      }

      const data = await res.json();
      appendMessage('Michael', data.reply || 'No reply received.', 'michael');

      if (data.followUpOptions) {
        renderFollowUps(data.followUpOptions);
      }

      if (voiceOn && data.reply) {
        playVoice(data.reply);
      }

    } catch (error) {
      console.error('💥 Error:', error);
      chatBox.removeChild(typingIndicator);
      appendMessage('Michael', 'Something went wrong. I’m quiet now.', 'michael');
    }

    chatBox.scrollTop = chatBox.scrollHeight;
  });

  function appendMessage(sender, text, className) {
    const div = document.createElement('div');
    div.classList.add('message', className);
    div.textContent = `${sender}: ${text}`;
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
        container.remove();
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
