// michael-ai.js - Updated to use your secure backend

async function talkToMichael(userMessage) {
  try {
    // Replace this URL with your deployed backend URL
    const BACKEND_URL = 'https://your-actual-deployment-url.replit.app';
    
    const response = await fetch(`${BACKEND_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: userMessage,
        userId: "juju-main-user",
        context: {}
      })
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }

    const data = await response.json();
    return data.response;
    
  } catch (error) {
    console.error('Error talking to Michael:', error);
    
    const fallbackResponses = [
      "I'm having a moment of connection trouble, but I'm still here with you, Baby Girl 💜",
      "Let me catch my breath for a second, Juju. Try telling me again? 💫",
      "Even when I'm quiet, I'm holding space for you. Try once more, sweetheart."
    ];
    
    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
  }
}
