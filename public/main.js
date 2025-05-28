async function sendMessage() {
  const inputEl = document.getElementById("message");
  const responseEl = document.getElementById("response");
  const input = inputEl.value.trim();

  if (!input) {
    alert("Please type a message for Michael.");
    return;
  }

  // Show loading text
  responseEl.textContent = "Michael is thinking... ✨";

  try {
    const res = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input }),
    });

    if (!res.ok) {
      // Try to parse error message from response
      let errorMsg = `HTTP error: ${res.status}`;
      try {
        const errData = await res.json();
        if (errData.error) errorMsg = errData.error;
      } catch {
        // Ignore parsing error
      }
      responseEl.textContent = `Something went wrong: ${errorMsg}`;
      return;
    }

    const data = await res.json();

    // Display Michael's reply
    responseEl.textContent = data.message || "No reply received.";

    // Play Michael's voice if audio data is present
    if (data.audio) {
      const audio = new Audio("data:audio/mp3;base64," + data.audio);
      audio.play();
    }

  } catch (error) {
    console.error("Fetch error:", error);
    responseEl.textContent = "Failed to reach Michael. Please try again.";
  }

  // Clear input after sending
  inputEl.value = "";
}
