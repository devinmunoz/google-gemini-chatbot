from flask import Flask
import requests
import base64
import os
from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)

API_KEY = os.getenv("GOOGLE_API_KEY") # Replace with your actual API key

@app.route("/speech")
def speech():
    url = "https://texttospeech.googleapis.com/v1/text:synthesize"
    headers = {
        'Content-Type': 'application/json',
    }
    params = {
        'key': API_KEY,
    }
    data = {
        'input': {
            'text': "Hello, I'm Gemini, your AI teacher! Ask me anything you want."
        },
        'voice': {
            'languageCode': 'en-US',
            'name': 'en-US-Studio-O'
        },
        'audioConfig': {
            'audioEncoding': 'MP3'
        }
    }
    response = requests.post(url, headers=headers, params=params, json=data)
    response.raise_for_status()
    audio_content = response.json().get('audioContent')
    return base64.b64decode(audio_content)
    
if __name__ == "__main__":
    app.run()
