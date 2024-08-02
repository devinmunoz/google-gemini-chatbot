import axios from 'axios'

// Replace with your API key
const apiKey = process.env.REACT_APP_TTS_API_KEY;

// Function to synthesize speech
export async function synthesizeSpeech(text) {
    const url = 'https://texttospeech.googleapis.com/v1/text:synthesize';
    
    // Construct the request payload
    const requestPayload = {
        input: { text: text },
        voice: { languageCode: 'en-US', name: 'en-US-Studio-O' },
        audioConfig: { audioEncoding: 'MP3' },
    };

    // Perform the POST request
    try {
        const response = await axios.post(url, requestPayload, {
            headers: {
                'Content-Type': 'application/json',
            },
            params: {
                key: apiKey,
            },
        });

        // Decode the base64-encoded audio content
        const audioContent = response.data.audioContent;
        //const buffer = Buffer.from(audioContent, 'base64');

        // Return the raw audio data
        playMp3FromBase64(audioContent);
    } catch (error) {
        console.error('Error synthesizing speech:', error.message);
        throw error; // Re-throw the error after logging
    }
}

function playMp3FromBase64(base64String) {
    const binaryString = atob(base64String);
    const byteArray = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        byteArray[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([byteArray], { type: 'audio/mpeg' });
    const url = URL.createObjectURL(blob);

    const audioElement = document.createElement('audio');
    audioElement.src = url;
    audioElement.controls = false; // Show playback controls
    document.body.appendChild(audioElement); // Add the audio element to the DOM
    audioElement.play();
}

// Example usage