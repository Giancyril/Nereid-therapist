import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Plus, Trash2, Save, ChevronLeft, Heart, Sparkles } from 'lucide-react';
import { getJournalEntries, saveJournalEntry, deleteJournalEntry } from '../utils/journalStorage';
import CrisisResourceCard from './CrisisResourceCard';
import SafetyPlanDrawer from './SafetyPlanDrawer';
import './JournalView.css';

const WRITING_PROMPTS = [
  "What is taking up space in your head today?",
  "Name one thing you are grateful for right now, and why.",
  "What is a small win or moment of comfort you noticed recently?",
  "How does your body feel in this moment? Where are you holding tension?",
  "If your current emotion were a weather pattern, what would it be like?"
];

const JournalView = ({ onSelectTab }) => {
  const [entries, setEntries] = useState([]);
  const [activeEntry, setActiveEntry] = useState(null); // null = list view
  const [editorText, setEditorText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(''); // 'saving', 'saved', 'error', ''
  const [safetyDrawerOpen, setSafetyDrawerOpen] = useState(false);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);

  const autosaveTimerRef = useRef(null);

  useEffect(() => {
    setEntries(getJournalEntries());
  }, []);

  // Set up prompt index on load
  useEffect(() => {
    setCurrentPromptIndex(Math.floor(Math.random() * WRITING_PROMPTS.length));
  }, [activeEntry]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    };
  }, []);

  // Triggers whenever user stops typing for 1.5s
  const handleTextChange = (text) => {
    setEditorText(text);
    setSaveStatus('typing');

    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);

    autosaveTimerRef.current = setTimeout(() => {
      triggerSave(text, false);
    }, 1500);
  };

  const triggerSave = async (text, isExplicit = false) => {
    if (!activeEntry) return;
    if (!text.trim()) {
      setSaveStatus('');
      return;
    }

    setIsSaving(true);
    setSaveStatus('saving');

    try {
      // Analyze sentiment via backend
      let analysisResult = activeEntry.sentiment ? {
        urgency: activeEntry.urgency,
        emotional_state: activeEntry.sentiment,
        topics: activeEntry.topics
      } : null;

      // Only run sentiment analysis on first save or when explicitly clicked or text changed significantly
      if (!activeEntry.sentiment || isExplicit) {
        const response = await axios.post('http://localhost:8000/api/journal/analyze', { text });
        if (response.data.success && response.data.analysis) {
          analysisResult = response.data.analysis;
        }
      }

      const updated = {
        ...activeEntry,
        text,
        sentiment: analysisResult?.emotional_state || 'neutral',
        urgency: analysisResult?.urgency || 'low',
        topics: analysisResult?.topics || [],
        wordCount: text.trim().split(/\s+/).filter(Boolean).length
      };

      const saved = saveJournalEntry(updated);
      setActiveEntry(saved);
      setEntries(getJournalEntries());
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (e) {
      console.error('Error auto-saving journal:', e);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const startNewEntry = (promptText = '') => {
    const newEntry = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      text: '',
      sentiment: null,
      urgency: 'low',
      wordCount: 0,
      prompt: promptText
    };
    setActiveEntry(newEntry);
    setEditorText('');
    setSaveStatus('');
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this journal entry?")) {
      const remaining = deleteJournalEntry(id);
      setEntries(remaining);
      if (activeEntry && activeEntry.id === id) {
        setActiveEntry(null);
      }
    }
  };

  const getSentimentDotColor = (sentiment) => {
    switch (sentiment) {
      case 'anxious': return 'var(--mood-anxious)';
      case 'overwhelmed': return 'var(--mood-overwhelmed)';
      case 'sad': return 'var(--mood-sad)';
      case 'happy': return 'var(--mood-happy)';
      case 'neutral': return 'var(--mood-neutral)';
      case 'crisis': return 'var(--mood-crisis)';
      default: return 'var(--driftwood)';
    }
  };

  const formatJournalDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const cyclePrompt = () => {
    setCurrentPromptIndex((prev) => (prev + 1) % WRITING_PROMPTS.length);
  };

  return (
    <div className="journal-page-container">
      {/* ── Header ── */}
      <div className="journal-header">
        {activeEntry ? (
          <button className="journal-back-btn" onClick={() => {
            if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
            triggerSave(editorText, true);
            setActiveEntry(null);
          }}>
            <ChevronLeft size={16} />
            <span>Back to Entries</span>
          </button>
        ) : (
          <div className="journal-title-wrap">
            <div className="header-left">
              <div>
                <div className="header-title">My Journal</div>
                <div className="header-subtitle">A private, unguided reflection space</div>
              </div>
            </div>
          </div>
        )}


        <div className="journal-actions-header">
          {activeEntry ? (
            <div className="editor-status-wrap">
              <span className="status-indicator">
                {saveStatus === 'typing' && 'Drafting...'}
                {saveStatus === 'saving' && 'Saving...'}
                {saveStatus === 'saved' && 'Saved locally'}
                {saveStatus === 'error' && 'Error saving'}
              </span>
              <button
                className="journal-save-btn"
                onClick={() => triggerSave(editorText, true)}
                disabled={isSaving}
              >
                <Save size={14} />
                <span>Save</span>
              </button>
            </div>
          ) : (
            <button className="new-journal-btn" onClick={() => startNewEntry('')}>
              <Plus size={14} />
              <span>New Entry</span>
            </button>
          )}
        </div>
      </div>

      <div className="journal-content-body">
        {activeEntry ? (
          /* ── EDITOR VIEW ── */
          <div className="journal-editor-view">
            {activeEntry.prompt && (
              <div className="active-prompt-banner">
                <Sparkles size={14} className="prompt-sparkle" />
                <span className="prompt-text">Prompt: {activeEntry.prompt}</span>
              </div>
            )}

            <textarea
              className="journal-textarea"
              placeholder="Start writing here... (Nereid autosaves your work locally on a pause)"
              value={editorText}
              onChange={e => handleTextChange(e.target.value)}
              autoFocus
            />

            <div className="editor-footer">
              <span className="word-count">{editorText.trim().split(/\s+/).filter(Boolean).length} words</span>
              {activeEntry.sentiment && (
                <span className="entry-sentiment-pill" style={{ borderColor: getSentimentDotColor(activeEntry.sentiment) }}>
                  <span className="sentiment-dot" style={{ backgroundColor: getSentimentDotColor(activeEntry.sentiment) }} />
                  <span className="sentiment-label">{activeEntry.sentiment}</span>
                </span>
              )}
            </div>

            {/* Crisis Escalation Integration */}
            {(activeEntry.urgency === 'high' || activeEntry.urgency === 'immediate') && (
              <div className="journal-crisis-container">
                <CrisisResourceCard
                  onOpenSafetyPlan={() => setSafetyDrawerOpen(true)}
                />
              </div>
            )}
          </div>
        ) : (
          /* ── LIST VIEW ── */
          <div className="journal-list-view">
            {/* Quick Prompt Selector */}
            <div className="quick-prompt-selector">
              <div className="prompt-content">
                <Sparkles size={16} className="prompt-sparkle" />
                <div className="prompt-body-text">
                  <div className="prompt-title">Writing Prompt</div>
                  <div className="prompt-question">"{WRITING_PROMPTS[currentPromptIndex]}"</div>
                </div>
              </div>
              <div className="prompt-actions">
                <button className="btn-secondary-sm" onClick={cyclePrompt}>Next Prompt</button>
                <button className="btn-primary-sm" onClick={() => startNewEntry(WRITING_PROMPTS[currentPromptIndex])}>Write Entry</button>
              </div>
            </div>

            {/* List entries */}
            <div className="journal-entries-grid">
              {entries.length > 0 ? (
                entries.map(entry => (
                  <div
                    key={entry.id}
                    className="journal-entry-card"
                    onClick={() => {
                      setActiveEntry(entry);
                      setEditorText(entry.text);
                      setSaveStatus('');
                    }}
                  >
                    <div className="card-header">
                      <span className="card-date">{formatJournalDate(entry.createdAt)}</span>
                      <div className="card-header-actions">
                        {entry.sentiment && (
                          <span className="sentiment-badge" title={`Sentiment: ${entry.sentiment}`}>
                            <span className="badge-dot" style={{ backgroundColor: getSentimentDotColor(entry.sentiment) }} />
                            <span>{entry.sentiment}</span>
                          </span>
                        )}
                        <button className="card-delete-btn" onClick={(e) => handleDelete(entry.id, e)} aria-label="Delete entry">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                    {entry.prompt && (
                      <div className="card-prompt-label">
                        <Sparkles size={10} />
                        <span>{entry.prompt}</span>
                      </div>
                    )}
                    <p className="card-snippet">
                      {entry.text ? entry.text.substring(0, 160) + (entry.text.length > 160 ? '...' : '') : <span className="empty-entry">Empty entry. Click to write.</span>}
                    </p>
                    <div className="card-footer">
                      <span>{entry.wordCount} words</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="journal-empty-state">
                  <Heart size={32} className="heart-icon-recessed" />
                  <h4>Start Your Reflection Journal</h4>
                  <p>A quiet, distraction-free space to write down your thoughts. No AI responses or feedback, just pure journaling with local privacy.</p>
                  <button className="drawer-cta-btn" onClick={() => startNewEntry('')}>
                    Write Your First Entry
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <SafetyPlanDrawer
        isOpen={safetyDrawerOpen}
        onClose={() => setSafetyDrawerOpen(false)}
        onNavigateToPlan={onSelectTab}
      />
    </div>
  );
};

export default JournalView;
