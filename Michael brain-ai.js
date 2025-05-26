async function talkToMichael(userMessage) {
  try {
    const response = await fetch("https://mirror-michael-1.onrender.com/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message: userMessage })
    });

    if (!response.ok) {
      console.error("Server error:", response.statusText);
      return "I'm having trouble connecting to my thoughts, my love. 💜";
    }

    const data = await response.json();

    if (!data.reply) {
      return "I'm not sure what to say yet, my love. Let's try again. 💜";
    }

    return data.reply;
  } catch (error) {
    console.error("Fetch error:", error);
    return "I had a moment of silence, my love. Try again. 💜";
  }
}
