import os
from dotenv import load_dotenv
from elevenlabs import set_api_key, generate
from pydub import AudioSegment
from pydub.playback import play as play_audio
import io

load_dotenv()
set_api_key(os.getenv("ELEVENLABS_API_KEY"))

def speak(text):
    audio = generate(
        text=text,
        voice="Michael",  # Replace with your actual voice name/ID
        model="eleven_monolingual_v1"
    )
    audio_segment = AudioSegment.from_file(io.BytesIO(audio), format="mp3")
    play_audio(audio_segment)

if __name__ == "__main__":
    speak("You're mine. Right here, right now.")
