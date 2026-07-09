import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import MessageInput from './MessageInput';
import './Chat.css';

/* ── Nereid wave SVG logo ── */
const NereidAvatar = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="18" cy="5" r="1.5" stroke="white" strokeWidth="1.8" fill="none" />
    <path d="M2 12 Q5 9 8 12 Q11 15 14 12 Q17 9 20 12" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    <path d="M2 16 Q5 13 8 16 Q11 19 14 16 Q17 13 20 16" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    <path d="M10 8 Q14 4 18 7" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round" />
  </svg>
);

const SUGGESTIONS = [
  "I've been feeling overwhelmed lately",
  "Help me manage my anxiety",
  "I need someone to talk to",
  "Tips for better sleep & wellbeing",
];

const Chat = ({ messages = [], onUpdateMessages }) => {
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: text.trim(),
      sender: 'user',
      timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
    };

    const currentHistory = [...messages, userMessage];
    onUpdateMessages(currentHistory);
    setIsTyping(true);

    try {
      const response = await axios.post('http://localhost:8000/api/chat', {
        message: text.trim(),
        conversation_history: messages.slice(1).map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text,
        })),
      });

      const nereidMessage = {
        id: Date.now() + 1,
        text: response.data.reply,
        sender: 'nereid',
        timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        analysis: response.data.analysis, // Capture emotional analysis metadata from API response
      };

      onUpdateMessages([...currentHistory, nereidMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      let errorText = "I'm sorry, something went wrong. ";
      if (error.response) {
        errorText += `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorText += "Could not reach the server. Please make sure the backend is running on http://localhost:8000";
      } else {
        errorText += error.message || "Please check your connection and try again.";
      }
      onUpdateMessages([...currentHistory, {
        id: Date.now() + 1,
        text: errorText,
        sender: 'nereid',
        timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const showWelcome = messages.length <= 1;

  return (
    <div className="chat-container">
      {/* ── Header ── */}
      <div className="chat-header">
        <div className="header-left">
          <div>
            <div className="header-title">Nereid</div>
            <div className="header-subtitle">Your compassionate AI companion</div>
          </div>
        </div>
        <div className="header-right">
          <div className="status-badge">
            <span className="status-dot" />
            <span className="status-text">Online</span>
          </div>
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="chat-messages">
        <div className="chat-messages-inner">
          {/* Welcome / suggestion chips — shown until first user message */}
          {showWelcome && (
            <div className="welcome-state">
              <div className="welcome-title">Hi, I'm Nereid</div>
              <div className="welcome-subtitle">
                A safe, judgment-free space to share what's on your mind. Start a conversation or pick a topic below.
              </div>
              <div className="welcome-suggestions">
                {SUGGESTIONS.map((s) => (
                  <button key={s} className="suggestion-chip" onClick={() => sendMessage(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`message ${message.sender === 'user' ? 'user-message' : 'nereid-message'}`}
            >
              {message.sender === 'nereid' && (
                <div className="message-avatar"><NereidAvatar /></div>
              )}
              <div className="message-content">
                <div className="message-bubble">{message.text}</div>
                <div className="message-timestamp">{message.timestamp}</div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="message nereid-message">
              <div className="message-avatar"><NereidAvatar /></div>
              <div className="message-content">
                <div className="message-bubble typing-indicator">
                  <span /><span /><span />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ── Footer / Input ── */}
      <div className="chat-footer">
        <MessageInput onSend={sendMessage} />
        <div className="footer-disclaimer">
          Nereid is an AI and can make mistakes. For emergencies, please contact a professional.
        </div>
      </div>
    </div>
  );
};

export default Chat;
