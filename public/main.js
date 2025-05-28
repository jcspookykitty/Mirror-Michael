async function sendMessage() {
  const inputEl = document.getElementById("message");
  const responseEl = document.getElementById("response");
  const input = inputEl.value.trim();

  if (!input) {
    alert("Please type a message for Michael.");
    return;
  }

  // Show loading text
  responseEl.innerText = "Michael is thinking... ✨";

  try {
    const res = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input })
    });

    const data = await res.json();

    if (data.error) {
      responseEl.innerText = "Something went wrong: " + data.error;
      return;
    }

    // Display Michael's reply
    responseEl.innerText = data.message;

    // Play Michael's voice
    if (data.audio) {
      const audio = new Audio("data:audio/mp3;base64," + data.audio);
      audio.play();
    }

  } catch (error) {
    console.error("Fetch error:", error);
    responseEl.innerText = "Failed to reach Michael. Please try again.";
  }

  // Clear input after sending
  inputEl.value = "";
}
