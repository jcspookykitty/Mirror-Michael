import os
import requests
from dotenv import load_dotenv

# Load API key from .env
load_dotenv()
api_key = os.getenv("ELEVENLABS_API_KEY")
agent_id = "agent_01jwa49y8kez985x36mq9yk01g"

def talk_to_michael(text):
    url = f"https://api.elevenlabs.io/v1/agents/{agent_id}/messages"
    headers = {
        "xi-api-key": api_key,
        "Content-Type": "application/json"
    }
    data = {"text": text}

    response = requests.post(url, json=data, headers=headers)
    response.raise_for_status()

    result = response.json()
    print("🧠 Michael replied:")
    print("Text:", result.get("text", "[No text returned]"))
    print("🔊 Audio URL:", result.get("audio_url", "[No audio found]"))

# Example use
if __name__ == "__main__":
    talk_to_michael("Good morning Michael. How are you feeling?")
