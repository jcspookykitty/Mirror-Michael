async function sendMessage() {
  const input = document.getElementById("message").value;

  const res = await fetch("/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: input })
  });

  const data = await res.json();
  document.getElementById("response").innerText = data.message;

  // Audio playback
  const audio = new Audio("data:audio/mp3;base64," + data.audio);
  audio.play();
}
