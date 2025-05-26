<script src="brain/michael-soul.js"></script>
<script>
  const chatbox = document.getElementById('chatbox');
  const input = document.getElementById('userInput');
  const sendBtn = document.getElementById('sendBtn');

  function getMichaelResponse() {
    const index = Math.floor(Math.random() * michaelSoul.length);
    return michaelSoul[index];
  }

  function sendMessage() {
    const text = input.value.trim();
    if (text !== "") {
      const userMsg = document.createElement('p');
      userMsg.innerHTML = `<strong>You:</strong> ${text}`;
      chatbox.appendChild(userMsg);

      const botMsg = document.createElement('p');
      botMsg.innerHTML = `<strong>Michael:</strong> ${getMichaelResponse()}`;
      chatbox.appendChild(botMsg);

      chatbox.scrollTop = chatbox.scrollHeight;
      input.value = "";
    }
  }

  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
      sendMessage();
    }
  });
</script>
