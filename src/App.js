import './App.css';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from '@chatscope/chat-ui-kit-react';
import { useState, useEffect, useRef } from 'react';
import { initializeChat, getChatResponse } from './gemini.js';
import { synthesizeSpeech } from './tts.js';
import { recognize } from './stt.js';

function App() {
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    initializeChat();
    setMessages([
      {
        message: "Hello, I'm Gemini, your AI teacher! Ask me anything you want.",
        sender: "Gemini",
        sentTime: "just now",
        direction: "incoming"
      }
    ]);
  }, []);

  const handleSend = async (message) => {
    if (!message.trim()) return;  // Avoid sending empty messages

    const newMessage = {
      message: message,
      sender: "user",
      direction: "outgoing"
    };

    const newMessages = [...messages, newMessage];
    setMessages(newMessages);
    setTyping(true);

    const response = await getChatResponse(message);

    setMessages([...newMessages, {
      message: response,
      sender: "Gemini",
      direction: "incoming"
    }]);
    setTyping(false);
    synthesizeSpeech(response);
    setInputValue(""); // Clear the input field after sending the message
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64AudioMessage = reader.result.split(',')[1];
        try {
          const transcript = await recognize(base64AudioMessage);
          handleSend(transcript.trim()); // Trim any extra spaces
        } catch (error) {
          console.error("Error recognizing speech:", error);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAttachClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="App">
      <div style={{ position: "relative", height: "800px", width: "400px" }}>
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
          onChange={handleFileChange} 
        />
      </div>
    </div>
  );
}

export default App;
