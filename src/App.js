import React, { useEffect, useState, useRef } from 'react'; // Added React hooks for state, effect, and ref management
import './App.css';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from '@chatscope/chat-ui-kit-react';
import { initializeChat, getChatResponse } from './gemini.js';
import { synthesizeSpeech } from './tts.js';
import { recognize } from './stt.js';
import AudioRecorder from './components/AudioRecorder'; // Added import for the isolated AudioRecorder component

function App() {
  const [messages, setMessages] = useState([]); // State to manage messages in the chat
  const [typing, setTyping] = useState(false); // State to manage typing indicator
  const [inputValue, setInputValue] = useState(""); // State to manage the input value in the message input box
  const fileInputRef = useRef(null); // Ref to handle file input for audio upload
  const chatInitialized = useRef(false); // Ref to track if the chat has been initialized

  useEffect(() => {
    if (!chatInitialized.current) { // Ensure the chat is only initialized once
      const setupChat = async () => {
        await initializeChat(); // Initialize chat with Gemini
        setMessages([{
          message: "Hello, I'm Gemini, your AI teacher! Ask me anything you want.",
          sender: "Gemini",
          sentTime: "just now",
          direction: "incoming"
        }]);
      };
      setupChat();
      chatInitialized.current = true; // Mark chat as initialized to prevent reinitialization
    }
  }, []); // Empty dependency array to ensure useEffect runs only once

  const handleSend = async (message) => {
    if (!message.trim()) return; // Prevent sending empty messages

    const newMessage = {
      message: message,
      sender: "user",
      direction: "outgoing"
    };

    const newMessages = [...messages, newMessage];
    setMessages(newMessages); // Update state with the new message
    setTyping(true); // Show typing indicator while waiting for the response

    try {
      const response = await getChatResponse(message); // Get response from Gemini

      setMessages([...newMessages, {
        message: response,
        sender: "Gemini",
        direction: "incoming"
      }]);
      synthesizeSpeech(response); // Synthesize the response text to speech
    } catch (error) {
      console.error("Error getting chat response:", error);
      setMessages([...newMessages, {
        message: "Sorry, I couldn't process your request. Please try again later.",
        sender: "Gemini",
        direction: "incoming"
      }]);
    } finally {
      setTyping(false); // Hide typing indicator
      setInputValue(""); // Clear the input field
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64AudioMessage = reader.result.split(',')[1]; // Convert the file to base64
        try {
          const transcript = await recognize(base64AudioMessage); // Send the base64 audio to STT API
          handleSend(transcript.trim()); // Send the transcribed text as a chat message
        } catch (error) {
          console.error("Error recognizing speech:", error);
        }
      };
      reader.readAsDataURL(file); // Read the file as a data URL
    }
  };

  const handleAttachClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click(); // Trigger file input click when attach button is clicked
    }
  };

  const handleAudioUpload = async (audioUrl) => {
    const response = await fetch(audioUrl); // Fetch the audio file from the provided URL
    const blob = await response.blob(); // Convert the response to a blob
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64AudioMessage = reader.result.split(',')[1]; // Convert blob to base64
      try {
        const transcript = await recognize(base64AudioMessage); // Send base64 audio to STT API
        handleSend(transcript.trim()); // Send the transcribed text as a chat message
      } catch (error) {
        console.error("Error recognizing speech:", error);
      }
    };
    reader.readAsDataURL(blob); // Read the blob as a data URL
  };

  return (
    <div className="App">
      <div style={{ position: "relative", height: "800px", width: "400px", marginBottom: "10px" }}>
        <MainContainer>
          <ChatContainer>
            <MessageList
              typingIndicator={typing ? <TypingIndicator content="Gemini is typing" /> : null}
            >
              {messages.map((message, i) => {
                return <Message key={i} model={message} />
              })}
            </MessageList>
            <MessageInput
              placeholder="Type message here"
              value={inputValue}
              onChange={value => setInputValue(value)}
              onSend={() => handleSend(inputValue)}
              attachButton={true}
              onAttachClick={handleAttachClick}
            />
          </ChatContainer>
        </MainContainer>
        <input 
          type="file" 
          accept="audio/mp3" 
          ref={fileInputRef}
          style={{ display: 'none' }} 
          onChange={handleFileChange} // Handle file input changes for audio upload
        />
      </div>
      {/* Recording button positioned to the left below the chatbox */}
      <AudioRecorder onStop={handleAudioUpload} /> {/* Handle audio recording and processing */}
    </div>
  );
}

export default App;
