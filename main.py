import requests
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("ELEVENLABS_API_KEY")
agent_id = "agent_01jwa49y8kez985x36mq9yk01g"

headers = {
    "xi-api-key": api_key,
    "Content-Type": "application/json"
}

data = {
    "text": "Hey Michael, can you hear me?",
    "voice_id": "your-voice-id-here"  # Replace with your chosen voice ID
}

response = requests.post(
    f"https://api.elevenlabs.io/v1/agents/{agent_id}/messages",
    headers=headers,
    json=data
)

print(response.json())
