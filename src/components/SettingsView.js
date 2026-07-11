import React, { useState, useCallback } from 'react';
import { Bell, Palette, Sliders, Plus, Trash2, AlertCircle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import {
  THEMES, getTheme, setTheme, getReducedMotion, setReducedMotion
} from '../utils/themeStorage';
import {
  getReminders, addReminder, updateReminder, deleteReminder,
  requestNotificationPermission, getNotificationStatus, fireTestNotification
} from '../utils/remindersStorage';
import './SettingsView.css';

// ── Constants ────────────────────────────────────────────────────────────────

const WARMTH_KEY = 'nereid_warmth';

const WARMTH_LABELS = [
  { value: 1, label: 'Warm & Casual',      desc: 'Friendly, informal — like a trusted friend' },
  { value: 2, label: 'Warm & Gentle',      desc: 'Caring and approachable, slightly informal' },
  { value: 3, label: 'Calm & Balanced',    desc: 'Warm yet composed — the default' },
  { value: 4, label: 'Measured',           desc: 'Thoughtful, clear, slightly professional' },
  { value: 5, label: 'Calm & Formal',      desc: 'Composed and professional — not cold' },
];

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const TYPE_OPTIONS = [
  { id: 'breathing', label: '🌬️ Breathing Exercise' },
  { id: 'journal',   label: '✍️ Journal Entry' },
  { id: 'custom',    label: '💙 Custom' },
];

// ── Sub-component: Section wrapper ────────────────────────────────────────────

const Section = ({ icon, title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="settings-section">
      <button className="settings-section-header" onClick={() => setOpen(o => !o)}>
        <span className="settings-section-icon">{icon}</span>
        <span className="settings-section-title">{title}</span>
        {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
      </button>
      {open && <div className="settings-section-body">{children}</div>}
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────

const SettingsView = () => {
  const [activeTheme, setActiveTheme] = useState(getTheme);
  const [warmth, setWarmthState] = useState(() => parseInt(localStorage.getItem(WARMTH_KEY) || '3', 10));
  const [reminders, setReminders] = useState(getReminders);
  const [notifStatus, setNotifStatus] = useState(getNotificationStatus);
  const [addingReminder, setAddingReminder] = useState(false);
  const [testFired, setTestFired] = useState(false);
  const [reducedMotion, setReducedMotionState] = useState(getReducedMotion);

  // Draft state for new reminder
  const [draft, setDraft] = useState({ type: 'breathing', label: '', time: '09:00', days: [0,1,2,3,4] });

  // ── Theme ──────────────────────────────────────────────────────────────────

  const handleThemeSelect = (id) => {
    setTheme(id);
    setActiveTheme(id);
  };

  const handleReducedMotionChange = (e) => {
    const checked = e.target.checked;
    setReducedMotionState(checked);
    setReducedMotion(checked);
  };

  // ── Warmth ─────────────────────────────────────────────────────────────────

  const handleWarmthChange = (val) => {
    const n = Number(val);
    setWarmthState(n);
    localStorage.setItem(WARMTH_KEY, String(n));
  };

  // ── Reminders ──────────────────────────────────────────────────────────────

  const handleRequestPermission = useCallback(async () => {
    const result = await requestNotificationPermission();
    setNotifStatus(result);
  }, []);

  const handleAddReminder = () => {
    if (!draft.time || draft.days.length === 0) return;
    const item = addReminder(draft);
    setReminders(r => [...r, item]);
    setDraft({ type: 'breathing', label: '', time: '09:00', days: [0,1,2,3,4] });
    setAddingReminder(false);
  };

  const handleToggleReminder = (id, enabled) => {
    const updated = updateReminder(id, { enabled });
    setReminders(updated);
  };

  const handleDeleteReminder = (id) => {
    const updated = deleteReminder(id);
    setReminders(updated);
  };

  const handleTest = () => {
    const ok = fireTestNotification();
    if (ok) { setTestFired(true); setTimeout(() => setTestFired(false), 3000); }
  };

  const toggleDraftDay = (dayIdx) => {
    setDraft(d => ({
      ...d,
      days: d.days.includes(dayIdx)
        ? d.days.filter(x => x !== dayIdx)
        : [...d.days, dayIdx].sort()
    }));
  };

  const warmthMeta = WARMTH_LABELS.find(w => w.value === warmth) || WARMTH_LABELS[2];

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="settings-view">
      <div className="settings-header">
        <div className="settings-header-title">Settings</div>
        <div className="settings-header-sub">Appearance, reminders & AI personality</div>
      </div>

      {/* ── APPEARANCE ──────────────────────────────────────────────────── */}
      <Section icon={<Palette size={16} />} title="Appearance">
        <p className="settings-desc">Choose a colour theme for the whole app. Changes take effect instantly.</p>
        <div className="theme-grid">
          {THEMES.map(t => (
            <button
              key={t.id}
              className={`theme-card ${activeTheme === t.id ? 'selected' : ''}`}
              onClick={() => handleThemeSelect(t.id)}
              title={t.desc}
            >
              {/* Mini preview swatch */}
              <div className="theme-preview" style={{ background: t.preview.bg }}>
                <div className="theme-preview-surface" style={{ background: t.preview.surface }} />
                <div className="theme-preview-accent" style={{ background: t.preview.accent }} />
              </div>
              <div className="theme-card-info">
                <span className="theme-emoji">{t.emoji}</span>
                <span className="theme-name">{t.name}</span>
              </div>
              {activeTheme === t.id && (
                <div className="theme-check"><CheckCircle size={13} /></div>
              )}
            </button>
          ))}
        </div>
        <div className="settings-motion-toggle-wrap">
          <label className="reminder-toggle">
            <input
              type="checkbox"
              checked={reducedMotion}
              onChange={handleReducedMotionChange}
              aria-label="Toggle Reduced Motion Mode"
            />
            <span className="toggle-track" />
          </label>
          <div className="settings-toggle-info">
            <span className="settings-toggle-label">Reduced Motion Mode</span>
            <span className="settings-toggle-desc">Minimizes UI transitions, box breathing scaling, and decorative animations.</span>
          </div>
        </div>
      </Section>

      {/* ── AI PERSONALITY ──────────────────────────────────────────────── */}
      <Section icon={<Sliders size={16} />} title="AI Personality">
        <p className="settings-desc">
          Adjust how Nereid speaks. This affects warmth, formality, and vocabulary — not the core listening approach.
        </p>
        <div className="warmth-slider-wrap">
          <div className="warmth-labels-row">
            <span className="warmth-pole-label">Casual</span>
            <span className="warmth-pole-label">Formal</span>
          </div>
          <input
            type="range"
            min={1} max={5} step={1}
            value={warmth}
            onChange={e => handleWarmthChange(e.target.value)}
            className="warmth-range"
          />
          <div className="warmth-pips">
            {WARMTH_LABELS.map(w => (
              <div key={w.value} className={`warmth-pip ${warmth === w.value ? 'active' : ''}`} />
            ))}
          </div>
        </div>
        <div className="warmth-description">
          <span className="warmth-level-label">{warmthMeta.label}</span>
          <span className="warmth-level-desc">{warmthMeta.desc}</span>
        </div>
      </Section>

      {/* ── REMINDERS ───────────────────────────────────────────────────── */}
      <Section icon={<Bell size={16} />} title="Reminders">

        {/* Permission banner */}
        {notifStatus === 'unsupported' && (
          <div className="notif-banner notif-warn">
            <AlertCircle size={14} /> Browser notifications are not supported in this browser.
          </div>
        )}
        {notifStatus === 'denied' && (
          <div className="notif-banner notif-warn">
            <AlertCircle size={14} /> Notifications are blocked. Please enable them in your browser settings, then reload.
          </div>
        )}
        {notifStatus === 'default' && (
          <div className="notif-banner notif-info">
            <AlertCircle size={14} />
            Nereid needs notification permission to send reminders.
            <button className="notif-permission-btn" onClick={handleRequestPermission}>Allow Notifications</button>
          </div>
        )}
        {notifStatus === 'granted' && (
          <div className="notif-banner notif-ok">
            <CheckCircle size={14} /> Notifications enabled.
            <button
              className="notif-test-btn"
              onClick={handleTest}
            >
              {testFired ? '✓ Sent!' : 'Send test'}
            </button>
          </div>
        )}

        <p className="settings-desc" style={{ marginTop: 12 }}>
          Reminders fire while the app is open. Set gentle nudges for breathing or journaling.
        </p>

        {/* Reminder list */}
        {reminders.length > 0 && (
          <div className="reminder-list">
            {reminders.map(r => (
              <div key={r.id} className={`reminder-item ${r.enabled ? '' : 'disabled'}`}>
                <div className="reminder-item-left">
                  <label className="reminder-toggle">
                    <input
                      type="checkbox"
                      checked={r.enabled}
                      onChange={e => handleToggleReminder(r.id, e.target.checked)}
                    />
                    <span className="toggle-track" />
                  </label>
                  <div className="reminder-item-info">
                    <div className="reminder-item-label">
                      {TYPE_OPTIONS.find(t => t.id === r.type)?.label || r.type}
                      {r.label && <span className="reminder-custom-label">— {r.label}</span>}
                    </div>
                    <div className="reminder-item-time">
                      {r.time} · {r.days.map(d => DAY_LABELS[d]).join(', ')}
                    </div>
                  </div>
                </div>
                <button className="reminder-delete-btn" onClick={() => handleDeleteReminder(r.id)} title="Delete reminder">
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add reminder form */}
        {addingReminder ? (
          <div className="reminder-form">
            <div className="reminder-form-row">
              <label className="form-label">Type</label>
              <select
                className="form-select"
                value={draft.type}
                onChange={e => setDraft(d => ({ ...d, type: e.target.value }))}
              >
                {TYPE_OPTIONS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </div>
            {draft.type === 'custom' && (
              <div className="reminder-form-row">
                <label className="form-label">Custom label</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="e.g. Take a walk"
                  value={draft.label}
                  onChange={e => setDraft(d => ({ ...d, label: e.target.value }))}
                />
              </div>
            )}
            <div className="reminder-form-row">
              <label className="form-label">Time</label>
              <input
                className="form-input form-input-time"
                type="time"
                value={draft.time}
                onChange={e => setDraft(d => ({ ...d, time: e.target.value }))}
              />
            </div>
            <div className="reminder-form-row reminder-form-days">
              <label className="form-label">Days</label>
              <div className="day-pills">
                {DAY_LABELS.map((label, idx) => (
                  <button
                    key={idx}
                    className={`day-pill ${draft.days.includes(idx) ? 'active' : ''}`}
                    onClick={() => toggleDraftDay(idx)}
                    type="button"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="reminder-form-actions">
              <button className="form-save-btn" onClick={handleAddReminder}>Add Reminder</button>
              <button className="form-cancel-btn" onClick={() => setAddingReminder(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <button
            className="add-reminder-btn"
            onClick={() => setAddingReminder(true)}
            disabled={notifStatus === 'unsupported' || notifStatus === 'denied'}
          >
            <Plus size={13} />
            Add Reminder
          </button>
        )}
      </Section>
    </div>
  );
};

export default SettingsView;
