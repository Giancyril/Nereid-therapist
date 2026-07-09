import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
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
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);

  // Feature detect Web Speech Recognition API
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const isSpeechSupported = !!SpeechRecognition;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  useEffect(() => {
    // Cleanup recognition on unmount
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
    }
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

  const toggleListening = () => {
    if (!isSpeechSupported) return;

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    } else {
      try {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = false;
        rec.lang = 'en-US';

        rec.onstart = () => {
          setIsListening(true);
        };

        rec.onend = () => {
          setIsListening(false);
        };

        rec.onresult = (event) => {
          const resultIndex = event.resultIndex;
          const transcript = event.results[resultIndex][0].transcript;
          if (transcript) {
            setMessage(prev => {
              const prevTrimmed = prev.trim();
              return prevTrimmed ? prevTrimmed + ' ' + transcript.trim() : transcript.trim();
            });
          }
        };

        rec.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognitionRef.current = rec;
        rec.start();
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
        setIsListening(false);
      }
    }
  };

  return (
    <form className="message-input-form" onSubmit={handleSubmit}>
      <div className="message-input-container">
        <textarea
          ref={textareaRef}
          className="message-input"
          placeholder={isListening ? "Listening... speak now." : "Share what's on your mind…"}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          rows={1}
          aria-label="Message input"
        />
        <div className="input-actions">
          {isSpeechSupported ? (
            <button
              type="button"
              className={`mic-btn ${isListening ? 'listening' : ''}`}
              onClick={toggleListening}
              title={isListening ? "Stop voice transcription" : "Voice input (transcribe speech)"}
            >
              {isListening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
          ) : (
            <button
              type="button"
              className="mic-btn disabled"
              disabled
              title="Voice transcription is not supported in this browser."
            >
              <Mic size={16} />
            </button>
          )}
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
