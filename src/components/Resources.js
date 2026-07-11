import React, { useState, useEffect } from 'react';
import { Phone, MessageSquare, AlertCircle, Wind, BookOpen, ShieldAlert } from 'lucide-react';
import './Resources.css';

const SELF_CARE_TIPS = [
  {
    id: 'grounding',
    title: 'The 5-4-3-2-1 Grounding Method',
    category: 'Anxiety relief',
    description: 'A technique to bring you back to the present moment when feeling overwhelmed.',
    steps: [
      ' Look at 5 things around you.',
      ' Touch 4 things nearby.',
      ' Listen for 3 distinct sounds.',
      ' Identify 2 scents in the air.',
      ' Notice 1 taste in your mouth.'
    ]
  },
  {
    id: 'sleep',
    title: 'Better Sleep Hygiene Tips',
    category: 'Wellbeing',
    description: 'Calming habits to prepare your mind and body for restorative rest.',
    steps: [
      ' Shut off screens 45 minutes before bed.',
      ' Avoid caffeine after 2:00 PM.',
      ' Keep your sleeping area cool and dark.',
      ' Do a 5-minute wind-down stretch.',
      ' Sleep and wake at consistent times.'
    ]
  },
  {
    id: 'journaling',
    title: 'Mindful Journaling Prompts',
    category: 'Self-Reflection',
    description: 'Prompts to help clarify your thoughts and process emotional blocks.',
    steps: [
      ' "What is one thing that felt heavy today, and why?"',
      ' "List three small moments of comfort you noticed recently."',
      ' "If my anxiety were a character, what would it be trying to protect me from?"',
      ' "What is a promise I want to make to myself for tomorrow?"'
    ]
  }
];

const Resources = () => {
  const [breathingState, setBreathingState] = useState('idle'); // idle, inhale, hold, exhale, hold_empty
  const [breathingActive, setBreathingActive] = useState(false);
  const [countdown, setCountdown] = useState(4);
  const [searchQuery, setSearchQuery] = useState('');

  // Breathing loop logic (Box Breathing: 4s inhale, 4s hold, 4s exhale, 4s hold)
  useEffect(() => {
    let timer;
    if (breathingActive) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            // State transition
            setBreathingState((currState) => {
              switch (currState) {
                case 'idle':
                case 'hold_empty':
                  return 'inhale';
                case 'inhale':
                  return 'hold';
                case 'hold':
                  return 'exhale';
                case 'exhale':
                  return 'hold_empty';
                default:
                  return 'inhale';
              }
            });
            return 4; // Reset to 4 seconds
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setBreathingState('idle');
      setCountdown(4);
    }

    return () => clearInterval(timer);
  }, [breathingActive]);

  const toggleBreathing = () => {
    setBreathingActive(!breathingActive);
    if (!breathingActive) {
      setBreathingState('inhale');
      setCountdown(4);
    }
  };

  const getBreathingInstruction = () => {
    switch (breathingState) {
      case 'inhale':
        return 'Breathe In...';
      case 'hold':
        return 'Hold Breath...';
      case 'exhale':
        return 'Breathe Out...';
      case 'hold_empty':
        return 'Hold Empty...';
      default:
        return 'Click to Begin';
    }
  };

  const filteredTips = SELF_CARE_TIPS.filter(tip =>
    tip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tip.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tip.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="resources-container">
      {/* ── Header ── */}
      <div className="resources-header">
        <div>
          <h1 className="resources-title">Wellness Resources</h1>
          <p className="resources-subtitle">Self-care tools, grounding guides, and crisis support</p>
        </div>
      </div>

      <div className="resources-content">
        {/* Left Column: Breathing and Crisis */}
        <div className="resources-left">

          {/* Breathing Exercise Card */}
          <div className="resource-card breathing-card">
            <div className="card-header-icon">
              <Wind className="text-teal" size={20} />
              <h2>Guided Calming Breath</h2>
            </div>
            <p className="card-desc">Practice box breathing to quiet your nervous system and reduce acute anxiety.</p>

            <div className="breathing-exercise-wrap">
              <div
                className={`breathing-circle ${breathingState}`}
                onClick={toggleBreathing}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleBreathing();
                  }
                }}
                aria-label={`Guided box breathing bubble. Current state: ${getBreathingInstruction()}. ${breathingActive ? `Time remaining: ${countdown} seconds.` : 'Click to start box breathing.'}`}
              >
                <div className="breathing-inner-circle" aria-live="polite">
                  <span className="breathing-instruction">{getBreathingInstruction()}</span>
                  {breathingActive && <span className="breathing-timer">{countdown}s</span>}
                </div>
              </div>
              <button
                className={`breathing-btn ${breathingActive ? 'active' : ''}`}
                onClick={toggleBreathing}
                aria-label={breathingActive ? 'Pause box breathing exercise' : 'Start guided box breathing exercise'}
              >
                {breathingActive ? 'Pause Exercise' : 'Start Box Breathing'}
              </button>
            </div>
          </div>

          {/* Crisis Hotline Card */}
          <div className="resource-card crisis-card">
            <div className="card-header-icon text-red">
              <ShieldAlert size={20} />
              <h2>Emergency & Crisis Support</h2>
            </div>
            <p className="card-desc">If you are in distress or experiencing thoughts of self-harm, please reach out. You are not alone.</p>

            <div className="crisis-channels">
              <div className="crisis-item">
                <div className="crisis-icon-wrap">
                  <Phone size={16} />
                </div>
                <div className="crisis-details">
                  <h3>Suicide & Crisis Lifeline</h3>
                  <p className="crisis-meta">Call or text 24/7 (English & Spanish)</p>
                  <a href="tel:988" className="crisis-link">Dial 988</a>
                </div>
              </div>

              <div className="crisis-item">
                <div className="crisis-icon-wrap">
                  <MessageSquare size={16} />
                </div>
                <div className="crisis-details">
                  <h3>Crisis Text Line</h3>
                  <p className="crisis-meta">Free, confidential support via text</p>
                  <a href="sms:741741?&body=HOME" className="crisis-link">Text HOME to 741741</a>
                </div>
              </div>

              <div className="crisis-item">
                <div className="crisis-icon-wrap">
                  <AlertCircle size={16} />
                </div>
                <div className="crisis-details">
                  <h3>International Support</h3>
                  <p className="crisis-meta">Find a local crisis hotline worldwide</p>
                  <a href="https://findahelpline.com" target="_blank" rel="noopener noreferrer" className="crisis-link">Find local helpline</a>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Guides and Articles */}
        <div className="resources-right">

          <div className="resource-card search-tips-card">
            <div className="search-wrap">
              <input
                type="text"
                placeholder="Search self-care exercises..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="resources-search-input"
              />
            </div>

            <div className="tips-list">
              {filteredTips.map((tip) => (
                <div key={tip.id} className="tip-item">
                  <div className="tip-header">
                    <span className="tip-category">{tip.category}</span>
                    <h3 className="tip-title">{tip.title}</h3>
                  </div>
                  <p className="tip-desc">{tip.description}</p>
                  <ul className="tip-steps">
                    {tip.steps.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ul>
                </div>
              ))}
              {filteredTips.length === 0 && (
                <div className="no-results">
                  <BookOpen size={24} />
                  <p>No resources match your search.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Resources;
