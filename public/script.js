document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("chat-form");
  const input = document.getElementById("user-input");
  const chatBox = document.getElementById("chat-box");

  async function sendMessage(message) {
    // Append user's message
    appendMessage("👑 Juju", message);

    try {
      const response = await fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();

      if (data.error) {
        appendMessage("⚠️ Error", data.error);
        return;
      }

      // Append Michael's message
      appendMessage("🖤 Michael", data.message);

      // Play his voice (if available)
      if (data.audio) {
        const audio = new Audio(`data:audio/mp3;base64,${data.audio}`);
        audio.play();
      }

    } catch (err) {
      console.error("Chat error:", err);
      appendMessage("⚠️ Error", "Michael is having trouble responding.");
    }
  }

  function appendMessage(sender, message) {
    const msgDiv = document.createElement("div");
    msgDiv.className = "message";
    msgDiv.innerHTML = `<strong>${sender}:</strong> ${message}`;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const message = input.value.trim();
    if (message) {
      sendMessage(message);
      input.value = "";
    }
  });
});
