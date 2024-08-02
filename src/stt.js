import axios from 'axios';

// Replace with your API key
const apiKey = process.env.REACT_APP_STT_API_KEY;

// Function to recognize speech or synthesize text
export async function recognize(speech) {
  const url = `https://speech.googleapis.com/v1/speech:recognize`;

  // Construct the request payload
  const requestPayload = {
    config: {
      encoding: 'MP3',  
      sampleRateHertz: 16000,
      languageCode: 'en-US',
    },
    audio: {
      content: speech,
    },
  };

  console.log("Request Payload: ", requestPayload); 

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

    const transcript = response.data.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');

    return transcript;
  } catch (error) {
    console.error('Error during speech-to-text conversion:', error.response ? error.response.data : error.message);
    throw error;
  }
}
