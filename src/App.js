import './App.css';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from '@chatscope/chat-ui-kit-react';
import { useState, useEffect } from 'react';
import { initializeChat, getChatResponse } from './genAi.js';
import { synthesizeSpeech } from './speech.js'

function App() {
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
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
    const newMessage = {
      message: message,
      sender: "user",
      direction: "outgoing"
    };

    const newMessages = [...messages, newMessage]; // stores the array of all the old messages + newest message and feeds it to Gemini
    setMessages(newMessages);
    setTyping(true);

    const response = await getChatResponse(message);

    setMessages([...newMessages, {
      message: response,
      sender: "Gemini",
      direction: "incoming"
    }]);
    setTyping(false);
    synthesizeSpeech(response)
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
            <MessageInput placeholder="Type message here" onSend={handleSend} attachButton={false} />
          </ChatContainer>
        </MainContainer>
      </div>
    </div>

  );
}

export default App;
