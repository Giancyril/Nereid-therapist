import React, { useState } from 'react';
import { User, Trash2, Plus, Brain, Lightbulb, XCircle, FileText, RotateCcw, Info } from 'lucide-react';
import { getUserProfile, saveUserProfile, deleteProfileItem, clearUserProfile } from '../utils/profileStorage';
import './ProfileView.css';

const CATEGORIES = [
  {
    key: 'recurringStressors',
    label: 'Recurring Stressors',
    icon: <Brain size={16} />,
    placeholder: 'e.g. work deadlines, sleep difficulties',
    color: 'anxious',
    desc: 'Patterns Nereid has noticed may be weighing on you across sessions.'
  },
  {
    key: 'copingStrategiesThatWorked',
    label: 'Coping Strategies That Helped',
    icon: <Lightbulb size={16} />,
    placeholder: 'e.g. short walks, journaling',
    color: 'happy',
    desc: 'Approaches that came up in conversation and seemed to resonate.'
  },
  {
    key: 'copingStrategiesThatDidntWork',
    label: 'Approaches That Didn\'t Help',
    icon: <XCircle size={16} />,
    placeholder: 'e.g. forcing sleep, avoiding the topic',
    color: 'overwhelmed',
    desc: 'Noted so Nereid avoids suggesting these in future sessions.'
  },
  {
    key: 'notableContext',
    label: 'Ongoing Context',
    icon: <FileText size={16} />,
    placeholder: 'e.g. going through a difficult period at home',
    color: 'sad',
    desc: 'Broader situations worth keeping in mind across conversations.'
  },
];

const STYLE_OPTIONS = [
  { id: 'reflective', label: '🌱 Reflective Listening', desc: 'Validates feelings, avoids advising' },
  { id: 'cbt', label: '🔍 CBT Reframing', desc: 'Gently reframes cognitive distortions' },
  { id: 'venting', label: '💨 Venting / No Advice', desc: 'Just hears you out' },
];

const ProfileView = () => {
  const [profile, setProfile] = useState(() => getUserProfile());
  const [addingTo, setAddingTo] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [firstTimeBanner, setFirstTimeBanner] = useState(() => {
    return !localStorage.getItem('nereid_profile_banner_dismissed');
  });

  const reload = () => setProfile(getUserProfile());

  const handleDeleteItem = (category, id) => {
    deleteProfileItem(category, id);
    reload();
  };

  const handleAddItem = (category) => {
    if (!inputValue.trim()) return;
    const current = getUserProfile();
    const now = new Date().toISOString();
    const newItem = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2),
      text: inputValue.trim(),
      firstNotedAt: now,
      lastReinforcedAt: now,
      mentionCount: 1,
      sourceSessionIds: [],
    };
    const updated = { ...current, [category]: [...(current[category] || []), newItem] };
    saveUserProfile(updated);
    setInputValue('');
    setAddingTo(null);
    reload();
  };

  const handleStyleChange = (styleId) => {
    const current = getUserProfile();
    saveUserProfile({ ...current, preferredStyle: styleId });
    localStorage.setItem('nereid_preferred_style', styleId);
    reload();
  };

  const handleClearAll = () => {
    clearUserProfile();
    setShowClearConfirm(false);
    reload();
  };

  const formatDate = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getMoodColor = (color) => {
    switch (color) {
      case 'anxious': return 'var(--mood-anxious)';
      case 'happy': return 'var(--mood-happy)';
      case 'overwhelmed': return 'var(--mood-overwhelmed)';
      case 'sad': return 'var(--mood-sad)';
      default: return 'var(--current)';
    }
  };

  const totalItems = CATEGORIES.reduce((sum, cat) => sum + (profile[cat.key] || []).length, 0);

  return (
    <div className="profile-view-container">
      {/* ── Header ── */}
      <div className="profile-header">
        <div className="profile-title-wrap">
          <div>
            <div className="profile-title">Memory Profile</div>
            <div className="profile-subtitle">What Nereid remembers about you</div>
          </div>
        </div>
        <div className="profile-header-actions">
          {totalItems > 0 && (
            <button
              className="clear-all-btn"
              onClick={() => setShowClearConfirm(true)}
            >
              <RotateCcw size={13} />
              <span>Clear All Memory</span>
            </button>
          )}
        </div>
      </div>

      <div className="profile-body">
        {/* ── First-time privacy banner ── */}
        {firstTimeBanner && (
          <div className="profile-privacy-banner">
            <Info size={16} className="banner-icon" />
            <div className="banner-text">
              <strong>Your memory profile is 100% private.</strong> Nereid builds this from your conversations to provide more personalised support. All data stays on this device — it's never sent to any server or shared.
            </div>
            <button
              className="banner-dismiss"
              onClick={() => {
                setFirstTimeBanner(false);
                localStorage.setItem('nereid_profile_banner_dismissed', 'true');
              }}
            >
              Got it
            </button>
          </div>
        )}

        {/* ── Default Listening Style ── */}
        <div className="profile-section">
          <div className="section-heading">
            <span className="section-title">Default Listening Style</span>
            <span className="section-desc">Applied to new conversations unless changed in chat</span>
          </div>
          <div className="style-radio-group">
            {STYLE_OPTIONS.map(opt => (
              <button
                key={opt.id}
                className={`style-radio-btn ${profile.preferredStyle === opt.id ? 'selected' : ''}`}
                onClick={() => handleStyleChange(opt.id)}
              >
                <span className="style-radio-label">{opt.label}</span>
                <span className="style-radio-desc">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Memory Categories ── */}
        {CATEGORIES.map(cat => {
          const items = profile[cat.key] || [];
          const accentColor = getMoodColor(cat.color);

          return (
            <div key={cat.key} className="profile-section">
              <div className="section-heading">
                <div className="section-title-row">
                  <span className="section-icon" style={{ color: accentColor }}>{cat.icon}</span>
                  <span className="section-title">{cat.label}</span>
                  <span className="section-count">{items.length}</span>
                </div>
                <span className="section-desc">{cat.desc}</span>
              </div>

              <div className="profile-items-list">
                {items.length > 0 ? (
                  items.map(item => (
                    <div key={item.id} className="profile-item">
                      <div className="item-body">
                        <span className="item-dot" style={{ backgroundColor: accentColor }} />
                        <span className="item-text">{item.text}</span>
                        {item.mentionCount > 1 && (
                          <span className="item-count-badge" title={`Mentioned ${item.mentionCount} times`}>
                            ×{item.mentionCount}
                          </span>
                        )}
                      </div>
                      <div className="item-meta">
                        <span className="item-date">First noted {formatDate(item.firstNotedAt)}</span>
                        <button
                          className="item-delete-btn"
                          onClick={() => handleDeleteItem(cat.key, item.id)}
                          title="Forget this item"
                        >
                          <Trash2 size={12} />
                          <span>Forget</span>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="profile-empty-category">
                    <span>Nothing noted yet. Nereid will add items here as patterns emerge in your conversations.</span>
                  </div>
                )}

                {/* Add item form */}
                {addingTo === cat.key ? (
                  <div className="add-item-form">
                    <input
                      type="text"
                      className="add-item-input"
                      placeholder={cat.placeholder}
                      value={inputValue}
                      autoFocus
                      onChange={e => setInputValue(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleAddItem(cat.key);
                        if (e.key === 'Escape') { setAddingTo(null); setInputValue(''); }
                      }}
                    />
                    <div className="add-item-actions">
                      <button className="add-confirm-btn" onClick={() => handleAddItem(cat.key)}>Add</button>
                      <button className="add-cancel-btn" onClick={() => { setAddingTo(null); setInputValue(''); }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button className="add-item-trigger" onClick={() => { setAddingTo(cat.key); setInputValue(''); }}>
                    <Plus size={12} />
                    <span>Add manually</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* ── Metadata ── */}
        {profile.updatedAt && (
          <div className="profile-footer-note">
            Profile last updated {formatDate(profile.updatedAt)}
          </div>
        )}
      </div>

      {/* ── Clear Confirmation Modal ── */}
      {showClearConfirm && (
        <div className="confirm-overlay">
          <div className="confirm-dialog">
            <h4>Clear All Memory?</h4>
            <p>This will permanently delete all remembered stressors, coping strategies, and context. Nereid will start fresh from your next conversation.</p>
            <div className="confirm-actions">
              <button className="confirm-cancel" onClick={() => setShowClearConfirm(false)}>Cancel</button>
              <button className="confirm-delete" onClick={handleClearAll}>Yes, clear everything</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileView;
