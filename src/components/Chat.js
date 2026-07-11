import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Volume2, VolumeX, Settings } from 'lucide-react';
import MessageInput from './MessageInput';
import SafetyPlanDrawer from './SafetyPlanDrawer';
import CrisisResourceCard from './CrisisResourceCard';
import { getSafetyPlan, logEscalationEvent, dismissLastEscalationEvent } from '../utils/safetyStorage';
import { getUserProfile, buildProfileContext, mergeProfileDiff } from '../utils/profileStorage';
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

const STYLE_OPTIONS = [
  { id: 'reflective', label: 'Reflective', emoji: '🌱', desc: 'Validates & listens without advising' },
  { id: 'cbt', label: 'CBT Reframing', emoji: '🔍', desc: 'Gently reframes cognitive distortions' },
  { id: 'venting', label: 'Venting', emoji: '💨', desc: 'A quiet, non-advising sounding board' }
];

const Chat = ({ chatId = 'default', messages = [], onUpdateMessages, onSelectTab }) => {
  const [isTyping, setIsTyping] = useState(false);
  const [safetyPlanDrawerOpen, setSafetyPlanDrawerOpen] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState(() => {
    return localStorage.getItem('nereid_preferred_style') || 'reflective';
  });
  const [showStyleOnboarding, setShowStyleOnboarding] = useState(() => {
    return !localStorage.getItem('nereid_style_onboarding_seen');
  });

  // ── Voice Output (TTS) state ──
  const [ttsEnabled, setTtsEnabled] = useState(() => {
    return localStorage.getItem('nereid_tts_enabled') === 'true';
  });
  const [ttsSettingsOpen, setTtsSettingsOpen] = useState(false);
  const [ttsRate, setTtsRate] = useState(() => {
    return parseFloat(localStorage.getItem('nereid_tts_rate') || '1.0');
  });
  const [ttsVoiceName, setTtsVoiceName] = useState(() => {
    return localStorage.getItem('nereid_tts_voice') || '';
  });
  const [ttsVoices, setTtsVoices] = useState([]);
  const lastSpokenMsgIdRef = useRef(null);

  const messagesEndRef = useRef(null);
  const messagesRef = useRef(messages);
  const nudgeTimerRef = useRef(null);

  // Load TTS voices (they load asynchronously on some browsers)
  useEffect(() => {
    const loadVoices = () => {
      const v = window.speechSynthesis?.getVoices() || [];
      setTtsVoices(v);
    };
    loadVoices();
    window.speechSynthesis?.addEventListener('voiceschanged', loadVoices);
    return () => window.speechSynthesis?.removeEventListener('voiceschanged', loadVoices);
  }, []);

  // Speak latest Nereid message when TTS is enabled
  useEffect(() => {
    if (!ttsEnabled || !window.speechSynthesis) return;
    const nereidMsgs = messages.filter(m => m.sender === 'nereid' && m.text && m.type !== 'crisis-card');
    if (nereidMsgs.length === 0) return;
    const lastMsg = nereidMsgs[nereidMsgs.length - 1];
    if (lastMsg.id === lastSpokenMsgIdRef.current) return;
    lastSpokenMsgIdRef.current = lastMsg.id;
    const utter = new SpeechSynthesisUtterance(lastMsg.text);
    utter.rate = ttsRate;
    if (ttsVoiceName) {
      const matchedVoice = ttsVoices.find(v => v.name === ttsVoiceName);
      if (matchedVoice) utter.voice = matchedVoice;
    }
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  }, [messages, ttsEnabled, ttsRate, ttsVoiceName, ttsVoices]);

  // Stop speech on unmount
  useEffect(() => {
    return () => window.speechSynthesis?.cancel();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    messagesRef.current = messages;
    scrollToBottom();
  }, [messages]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (nudgeTimerRef.current) {
        clearTimeout(nudgeTimerRef.current);
      }
    };
  }, []);

  // Summarize session and update profile on tab/window close
  useEffect(() => {
    const triggerSummarize = () => {
      const profile = getUserProfile();
      const historyForApi = messagesRef.current
        .filter(m => m.sender && m.text && m.type !== 'crisis-card')
        .map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text }));
      if (historyForApi.length < 4) return; // skip trivially short sessions
      // Use sendBeacon for fire-and-forget on close
      const payload = JSON.stringify({ session_id: chatId, messages: historyForApi, current_profile: profile });
      navigator.sendBeacon(`http://localhost:8000/api/sessions/${chatId}/summarize`, new Blob([payload], { type: 'application/json' }));
    };
    window.addEventListener('beforeunload', triggerSummarize);
    return () => window.removeEventListener('beforeunload', triggerSummarize);
  }, [chatId]);

  // Poll for profile diff after a short delay when component mounts
  useEffect(() => {
    const pollDiff = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/api/sessions/${chatId}/profile-diff`);
        if (res.data?.ready && res.data?.diff) {
          mergeProfileDiff(res.data.diff);
        }
      } catch (e) { /* silently ignore */ }
    };
    const timer = setTimeout(pollDiff, 3000);
    return () => clearTimeout(timer);
  }, [chatId]);

  const clearNudgeTimer = () => {
    if (nudgeTimerRef.current) {
      clearTimeout(nudgeTimerRef.current);
      nudgeTimerRef.current = null;
    }
  };

  const scheduleNudge = (plan) => {
    clearNudgeTimer();
    if (!plan.checkInSettings?.enabled) return;

    const thresholdMs = plan.checkInSettings.quietThresholdMinutes * 60 * 1000;
    nudgeTimerRef.current = setTimeout(() => {
      const nudgeMsg = {
        id: Date.now(),
        sender: 'nereid',
        type: 'nudge-card',
        text: plan.checkInSettings.message || "Still there? No pressure to respond.",
        timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      };
      onUpdateMessages([...messagesRef.current, nudgeMsg]);
      nudgeTimerRef.current = null;
    }, thresholdMs);
  };

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    // Reset nudge timer on new user input
    clearNudgeTimer();

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
      const profileContext = buildProfileContext(getUserProfile());
      const warmth = parseInt(localStorage.getItem('nereid_warmth') || '3', 10);
      const response = await axios.post('http://localhost:8000/api/chat', {
        message: text.trim(),
        style: selectedStyle,
        profile_context: profileContext,
        warmth,
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

      const finalHistory = [...currentHistory, nereidMessage];

      // Inline crisis check
      const urgency = response.data.analysis?.urgency;
      const plan = getSafetyPlan();

      if (urgency === 'high' || urgency === 'immediate') {
        // Spike check: Only show card if the previous assistant message wasn't also high/immediate
        const prevNereidMsg = messages.slice().reverse().find(m => m.sender === 'nereid' && m.analysis);
        const prevUrgency = prevNereidMsg?.analysis?.urgency;
        const isSpike = !prevUrgency || (prevUrgency !== 'high' && prevUrgency !== 'immediate');

        if (isSpike) {
          logEscalationEvent(chatId, urgency, nereidMessage.id);

          const crisisCard = {
            id: Date.now() + 2,
            sender: 'nereid',
            type: 'crisis-card',
            timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
          };
          finalHistory.push(crisisCard);
        }

        // Schedule check-in nudge
        scheduleNudge(plan);
      }

      onUpdateMessages(finalHistory);
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

  const handleDismissCrisisCard = (msgId) => {
    dismissLastEscalationEvent(chatId);
    onUpdateMessages(messages.filter(m => m.id !== msgId));
  };

  const handleDismissNudge = (msgId) => {
    onUpdateMessages(messages.filter(m => m.id !== msgId));
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

          {messages.map((message) => {
            if (message.type === 'crisis-card') {
              return (
                <div key={message.id} className="message nereid-message crisis-card-wrapper">
                  <div className="message-avatar"><NereidAvatar /></div>
                  <div className="message-content">
                    <CrisisResourceCard
                      onOpenSafetyPlan={() => setSafetyPlanDrawerOpen(true)}
                      onDismiss={() => handleDismissCrisisCard(message.id)}
                    />
                    <div className="message-timestamp">{message.timestamp}</div>
                  </div>
                </div>
              );
            }

            if (message.type === 'nudge-card') {
              return (
                <div key={message.id} className="message nereid-message nudge-card-wrapper">
                  <div className="message-avatar"><NereidAvatar /></div>
                  <div className="message-content">
                    <div className="nudge-bubble">
                      <p className="nudge-text">{message.text}</p>
                      <div className="nudge-actions">
                        <button className="nudge-action-btn ok" onClick={() => handleDismissNudge(message.id)}>
                          I'm okay
                        </button>
                        <button className="nudge-action-btn talk" onClick={() => handleDismissNudge(message.id)}>
                          Keep talking
                        </button>
                      </div>
                    </div>
                    <div className="message-timestamp">{message.timestamp}</div>
                  </div>
                </div>
              );
            }

            return (
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
            );
          })}

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
        {/* Style Selector */}
        <div className="style-selector-container">
          <span className="style-selector-label">Listening style:</span>
          <div className="style-pills">
            {STYLE_OPTIONS.map(opt => (
              <button
                key={opt.id}
                className={`style-pill ${selectedStyle === opt.id ? 'active' : ''}`}
                onClick={() => {
                  setSelectedStyle(opt.id);
                  localStorage.setItem('nereid_preferred_style', opt.id);
                }}
                title={opt.desc}
              >
                <span className="style-pill-label">{opt.label}</span>
              </button>
            ))}
          </div>

          {/* TTS Toggle */}
          <div className="tts-controls">
            <button
              className={`tts-toggle-btn ${ttsEnabled ? 'active' : ''}`}
              title={ttsEnabled ? 'Read aloud is ON — click to disable' : 'Click to read replies aloud'}
              onClick={() => {
                const next = !ttsEnabled;
                setTtsEnabled(next);
                localStorage.setItem('nereid_tts_enabled', String(next));
                if (!next) window.speechSynthesis?.cancel();
              }}
            >
              {ttsEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
            </button>
            <button
              className={`tts-settings-btn ${ttsSettingsOpen ? 'active' : ''}`}
              title="Voice output settings"
              onClick={() => setTtsSettingsOpen(prev => !prev)}
            >
              <Settings size={14} />
            </button>
          </div>

          {/* TTS Settings Popover */}
          {ttsSettingsOpen && (
            <div className="tts-settings-popover">
              <div className="tts-setting-row">
                <label className="tts-label">Read replies aloud</label>
                <button
                  className={`tts-toggle-chip ${ttsEnabled ? 'on' : 'off'}`}
                  onClick={() => {
                    const next = !ttsEnabled;
                    setTtsEnabled(next);
                    localStorage.setItem('nereid_tts_enabled', String(next));
                    if (!next) window.speechSynthesis?.cancel();
                  }}
                >
                  {ttsEnabled ? 'On' : 'Off'}
                </button>
              </div>
              <div className="tts-setting-row">
                <label className="tts-label">Speed: {ttsRate.toFixed(1)}×</label>
                <input
                  type="range"
                  min="0.6"
                  max="1.5"
                  step="0.1"
                  value={ttsRate}
                  className="tts-rate-slider"
                  onChange={e => {
                    const v = parseFloat(e.target.value);
                    setTtsRate(v);
                    localStorage.setItem('nereid_tts_rate', String(v));
                  }}
                />
              </div>
              {ttsVoices.length > 0 && (
                <div className="tts-setting-row column">
                  <label className="tts-label">Voice</label>
                  <select
                    className="tts-voice-select"
                    value={ttsVoiceName}
                    onChange={e => {
                      setTtsVoiceName(e.target.value);
                      localStorage.setItem('nereid_tts_voice', e.target.value);
                    }}
                  >
                    <option value="">System Default</option>
                    {ttsVoices.map(v => (
                      <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {showStyleOnboarding && (
            <div className="style-onboarding-tooltip">
              <div className="tooltip-content">
                <strong>Choose how Nereid listens:</strong> Reflective listens, CBT reframes, Venting just hears you out.
              </div>
              <button
                className="tooltip-close"
                onClick={() => {
                  setShowStyleOnboarding(false);
                  localStorage.setItem('nereid_style_onboarding_seen', 'true');
                }}
              >
                Got it
              </button>
            </div>
          )}
        </div>

        <MessageInput onSend={sendMessage} />
        <div className="footer-disclaimer">
          Nereid is an AI and can make mistakes. For emergencies, please contact a professional.
        </div>
      </div>

      {/* ── Safety Plan Drawer Overlay ── */}
      <SafetyPlanDrawer
        isOpen={safetyPlanDrawerOpen}
        onClose={() => setSafetyPlanDrawerOpen(false)}
        onNavigateToPlan={onSelectTab}
      />
    </div>
  );
};

export default Chat;
