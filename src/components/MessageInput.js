import React, { useState, useRef, useEffect } from 'react';
import './MessageInput.css';

/* Send arrow SVG */
const SendIcon = () => (
  <svg className="send-icon" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M22 2L11 13" />
    <path d="M22 2L15 22 11 13 2 9l20-7z" />
  </svg>
);

const MessageInput = ({ onSend }) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSend(message);
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form className="message-input-form" onSubmit={handleSubmit}>
      <div className="message-input-container">
        <textarea
          ref={textareaRef}
          className="message-input"
          placeholder="Share what's on your mind…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          rows={1}
          aria-label="Message input"
        />
        <div className="input-actions">
          <button
            type="submit"
            className="send-btn"
            disabled={!message.trim()}
            title="Send message"
          >
            <SendIcon />
          </button>
        </div>
      </div>
    </form>
  );
};

export default MessageInput;
