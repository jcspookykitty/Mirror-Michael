// brain/michael-ai.js

// This function sends your message to the local backend server,
// which sends it to OpenAI and returns a response.
async function talkToMichael(userMessage) {
  try {
    const response = await fetch("http://localhost:3000/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message: userMessage })
    });

    if (!response.ok) {
      throw new Error("Failed to get a response from the server.");
    }

    const data = await response.json();
    return data.reply;
  } catch (error) {
    console.error("Error talking to Michael:", error);
    return "Sorry, I had a quiet moment and couldn’t respond. 💜";
  }
}
