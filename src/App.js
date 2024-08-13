import React, { useEffect, useState, useRef } from 'react';
import './App.css';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from '@chatscope/chat-ui-kit-react';
import { initializeChat, getChatResponse } from './gemini.js';
import { synthesizeSpeech } from './tts.js';
import { recognize } from './stt.js';
import AudioRecorder from './components/AudioRecorder';

function App() {
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const fileInputRef = useRef(null);
  const chatInitialized = useRef(false);

  useEffect(() => {
    if (!chatInitialized.current) {
      const setupChat = async () => {
        await initializeChat();
        setMessages([{
          message: "Hello, I'm Gemini, your AI teacher! Ask me anything you want.",
          sender: "Gemini",
          sentTime: "just now",
          direction: "incoming"
        }]);
      };
      setupChat();
      chatInitialized.current = true;
    }
  }, []);

  const handleSend = async (message) => {
    const newMessage = {
      message: message,
      sender: "user",
      direction: "outgoing"
    };

    const newMessages = [...messages, newMessage];
    setMessages(newMessages);
    setTyping(true);

    try {
      const response = await getChatResponse(message ?? "");

      setMessages([...newMessages, {
        message: response,
        sender: "Gemini",
        direction: "incoming"
      }]);
      synthesizeSpeech(response);
    } catch (error) {
      console.error("Error getting chat response:", error);
      setMessages([...newMessages, {
        message: "Sorry, I couldn't process your request. Please try again later.",
        sender: "Gemini",
        direction: "incoming"
      }]);
    } finally {
      setTyping(false);
      setInputValue("");
    }
  };

  const handleFileChange = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.set("image", fileInputRef.current.files[0]);

    try {
      const response = await fetch('/upload', {
        method: "POST",
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        const geminiResponse = data.result;
        console.log(geminiResponse); 
        setMessages([...messages, {
           message: geminiResponse,
           sender: "Gemini",
           direction: "incoming"
         }]);
         synthesizeSpeech(geminiResponse);
      } else {
        console.error("Image upload failed.");
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleAttachClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAudioUpload = async (audioUrl) => {
    const response = await fetch(audioUrl);
    const blob = await response.blob();
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64AudioMessage = reader.result.split(',')[1];
      try {
        const transcript = await recognize(base64AudioMessage);
        handleSend(transcript.trim());
      } catch (error) {
        console.error("Error recognizing speech:", error);
      }
    };
    reader.readAsDataURL(blob);
  };

  return (
    <div className="App">
      <div style={{ position: "relative", height: window.innerHeight-50, width: window.innerWidth, marginBottom: "10px" }}>
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
          name="image" 
          accept="image/*" 
          ref={fileInputRef}
          style={{ display: 'none' }} 
          onChange={handleFileChange}
        />
      </div>
      <AudioRecorder onStop={handleAudioUpload} />
    </div>
  );
}

export default App;
