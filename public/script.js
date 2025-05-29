const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');
const voiceToggle = document.getElementById('voice-toggle');

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

    const data = await res.json();
    appendMessage('Michael', data.reply, 'michael');

    if (voiceToggle.checked) {
      console.log('🔊 Voice toggle is ON. Sending text to /speak...');
      const audioRes = await fetch('/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: data.reply })
      });

      if (!audioRes.ok) {
        console.error('🛑 Error fetching audio:', await audioRes.text());
        return;
      }

      const audioBlob = await audioRes.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      try {
        await audio.play();
        console.log('🎧 Audio playback successful');
      } catch (err) {
        console.error('🚫 Audio playback blocked by browser:', err);
        alert('Audio was blocked by the browser. Please interact with the page (e.g., click) to allow sound.');
      }
    }
  } catch (err) {
    console.error('💥 Something went wrong:', err);
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
