import os
import requests
from dotenv import load_dotenv
from pydub import AudioSegment
from pydub.playback import play
import io

# Load environment variables
load_dotenv()
api_key = os.getenv("ELEVENLABS_API_KEY")
agent_id = "agent_01jwa49y8kez985x36mq9yk01g"

# Send message to Agent
def talk_to_michael(user_text):
    url = f"https://api.elevenlabs.io/v1/agents/{agent_id}/messages"
    headers = {
        "xi-api-key": api_key,
        "Content-Type": "application/json"
    }

    data = {
        "text": user_text
    }

    print("Sending message to Michael...")
    response = requests.post(url, json=data, headers=headers)
    response.raise_for_status()
    reply = response.json()

    # Get audio URL
    audio_url = reply["audio_url"]
    print("Received audio, playing now...")

    # Download and play the audio
    audio_data = requests.get(audio_url).content
    audio = AudioSegment.from_file(io.BytesIO(audio_data), format="mp3")
    play(audio)

    # Optional: print Michael's reply text too
    print("Michael says:", reply.get("text", "[No text found]"))

# Example use
talk_to_michael("Hi Michael, how are you today?")
