import React, { useState, useEffect } from 'react';
import { Shield, Plus, Trash2, Save, Info, AlertTriangle, Eye, Settings } from 'lucide-react';
import { getSafetyPlan, saveSafetyPlan } from '../utils/safetyStorage';
import './SafetyPlanView.css';

const SafetyPlanView = () => {
  const [plan, setPlan] = useState({
    warningSigns: [],
    copingSteps: [],
    distractions: [],
    trustedContacts: [],
    safeEnvironmentSteps: [],
    professionalContacts: [],
    checkInSettings: {
      enabled: true,
      quietThresholdMinutes: 5,
      message: "Still there? No pressure to respond."
    }
  });

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');

  // Temporary state for adding items
  const [newWarningSign, setNewWarningSign] = useState('');
  const [newCopingStep, setNewCopingStep] = useState('');
  const [newDistraction, setNewDistraction] = useState('');
  const [newSafeStep, setNewSafeStep] = useState('');

  // Contact form state
  const [newContact, setNewContact] = useState({ name: '', relationship: '', phone: '', notes: '' });
  const [newProfContact, setNewProfContact] = useState({ name: '', relationship: 'Therapist', phone: '', notes: '' });

  useEffect(() => {
    const saved = getSafetyPlan();
    setPlan(saved);
  }, []);

  const showNotification = (text, type = 'success') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(''), 4000);
  };

  const handleSave = () => {
    saveSafetyPlan(plan);
    showNotification('Safety plan and settings saved successfully.');
  };

  // Generic List item adder/remover
  const addListItem = (field, value, setValue) => {
    if (!value.trim()) return;
    setPlan(prev => ({
      ...prev,
      [field]: [...prev[field], value.trim()]
    }));
    setValue('');
  };

  const removeListItem = (field, index) => {
    setPlan(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  // Contact list helpers
  const addContact = (field, contactState, setContactState) => {
    if (!contactState.name.trim()) {
      showNotification('Contact name is required', 'error');
      return;
    }
    const contactToAdd = {
      id: Date.now().toString(),
      name: contactState.name.trim(),
      relationship: contactState.relationship.trim(),
      phone: contactState.phone.trim(),
      notes: contactState.notes.trim()
    };
    setPlan(prev => ({
      ...prev,
      [field]: [...prev[field], contactToAdd]
    }));
    setContactState({ name: '', relationship: field === 'professionalContacts' ? 'Therapist' : '', phone: '', notes: '' });
  };

  const removeContact = (field, id) => {
    setPlan(prev => ({
      ...prev,
      [field]: prev[field].filter(c => c.id !== id)
    }));
  };

  const updateNudgeSetting = (settingKey, value) => {
    setPlan(prev => ({
      ...prev,
      checkInSettings: {
        ...prev.checkInSettings,
        [settingKey]: value
      }
    }));
  };

  return (
    <div className="safety-plan-container">
      {/* ── Header ── */}
      <div className="safety-header-bar">
        <div className="header-left">
          <div className="header-title">My Safety Plan</div>
          <div className="header-subtitle">A personalized guide for challenging emotional moments</div>
        </div>
        <div className="header-right">
          <button className="save-plan-btn" onClick={handleSave}>
            <Save size={16} />
            <span>Save Plan</span>
          </button>
        </div>
      </div>

      <div className="safety-content-wrapper">
        {/* Status notification */}
        {message && (
          <div className={`safety-alert ${messageType === 'error' ? 'alert-danger' : 'alert-success'}`}>
            <Info size={16} />
            <span>{message}</span>
          </div>
        )}

        {/* ── Privacy Info Callout ── */}
        <div className="privacy-callout">
          <Shield size={18} className="shield-icon" />
          <div className="callout-text">
            <strong>Privacy Note:</strong> All information in this safety plan (including names, phone numbers, and coping steps) is stored 100% locally on your browser. No data is ever sent to external cloud servers or used for model training.
          </div>
        </div>

        <div className="safety-grid-layout">
          {/* LEFT SIDE: Safety Plan Sections */}
          <div className="safety-plan-sections">
            
            {/* Section 1: Warning Signs */}
            <div className="safety-section-card">
              <div className="section-card-header">
                <AlertTriangle size={18} className="icon-warning" />
                <h3>1. Warning Signs</h3>
              </div>
              <p className="section-instruction">What does it look or feel like when you are beginning to struggle or feel overwhelmed?</p>
              
              <div className="input-row">
                <input
                  type="text"
                  placeholder="e.g. Heart racing, isolating myself, repetitive negative thoughts..."
                  value={newWarningSign}
                  onChange={e => setNewWarningSign(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addListItem('warningSigns', newWarningSign, setNewWarningSign)}
                />
                <button className="add-item-btn" onClick={() => addListItem('warningSigns', newWarningSign, setNewWarningSign)}>
                  <Plus size={16} />
                </button>
              </div>

              <ul className="item-pills-list">
                {plan.warningSigns.map((item, index) => (
                  <li key={index} className="item-pill">
                    <span>{item}</span>
                    <button className="remove-pill-btn" onClick={() => removeListItem('warningSigns', index)}>
                      <Trash2 size={13} />
                    </button>
                  </li>
                ))}
                {plan.warningSigns.length === 0 && (
                  <span className="empty-section-placeholder">No warning signs added yet.</span>
                )}
              </ul>
            </div>

            {/* Section 2: Coping Steps */}
            <div className="safety-section-card">
              <div className="section-card-header">
                <Shield size={18} className="icon-coping" />
                <h3>2. Coping Strategies</h3>
              </div>
              <p className="section-instruction">Things you can do on your own to take your mind off things or calm down.</p>
              
              <div className="input-row">
                <input
                  type="text"
                  placeholder="e.g. 5-minute box breathing, listening to my favorite playlist, going for a walk..."
                  value={newCopingStep}
                  onChange={e => setNewCopingStep(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addListItem('copingSteps', newCopingStep, setNewCopingStep)}
                />
                <button className="add-item-btn" onClick={() => addListItem('copingSteps', newCopingStep, setNewCopingStep)}>
                  <Plus size={16} />
                </button>
              </div>

              <ul className="item-pills-list">
                {plan.copingSteps.map((item, index) => (
                  <li key={index} className="item-pill">
                    <span>{item}</span>
                    <button className="remove-pill-btn" onClick={() => removeListItem('copingSteps', index)}>
                      <Trash2 size={13} />
                    </button>
                  </li>
                ))}
                {plan.copingSteps.length === 0 && (
                  <span className="empty-section-placeholder">No coping steps added yet.</span>
                )}
              </ul>
            </div>

            {/* Section 3: Safe Environments / Distractions */}
            <div className="safety-section-card">
              <div className="section-card-header">
                <Eye size={18} className="icon-distract" />
                <h3>3. Positive Distractions & Environments</h3>
              </div>
              <p className="section-instruction">People, places, or social settings that can help take your mind off distress.</p>
              
              <div className="input-row">
                <input
                  type="text"
                  placeholder="e.g. Going to a local coffee shop, visiting the park, watching comedy..."
                  value={newDistraction}
                  onChange={e => setNewDistraction(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addListItem('distractions', newDistraction, setNewDistraction)}
                />
                <button className="add-item-btn" onClick={() => addListItem('distractions', newDistraction, setNewDistraction)}>
                  <Plus size={16} />
                </button>
              </div>

              <ul className="item-pills-list">
                {plan.distractions.map((item, index) => (
                  <li key={index} className="item-pill">
                    <span>{item}</span>
                    <button className="remove-pill-btn" onClick={() => removeListItem('distractions', index)}>
                      <Trash2 size={13} />
                    </button>
                  </li>
                ))}
                {plan.distractions.length === 0 && (
                  <span className="empty-section-placeholder">No distractions added yet.</span>
                )}
              </ul>
            </div>

            {/* Section 4: Trusted Contacts */}
            <div className="safety-section-card">
              <div className="section-card-header">
                <Info size={18} className="icon-contacts" />
                <h3>4. Trusted Friends & Family</h3>
              </div>
              <p className="section-instruction">People you can call or text for support or just to connect with during a hard time.</p>
              
              <div className="contact-form">
                <div className="form-fields">
                  <input
                    type="text"
                    placeholder="Name"
                    value={newContact.name}
                    onChange={e => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                  />
                  <input
                    type="text"
                    placeholder="Relationship (e.g. Sister, Friend)"
                    value={newContact.relationship}
                    onChange={e => setNewContact(prev => ({ ...prev, relationship: e.target.value }))}
                  />
                  <input
                    type="text"
                    placeholder="Phone number"
                    value={newContact.phone}
                    onChange={e => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
                  />
                  <input
                    type="text"
                    placeholder="Short note"
                    value={newContact.notes}
                    onChange={e => setNewContact(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </div>
                <button className="add-contact-btn" onClick={() => addContact('trustedContacts', newContact, setNewContact)}>
                  <Plus size={15} /> Add Contact
                </button>
              </div>

              <div className="contacts-display-list">
                {plan.trustedContacts.map((contact) => (
                  <div key={contact.id} className="contact-card">
                    <div className="contact-info">
                      <span className="contact-name">{contact.name}</span>
                      {contact.relationship && <span className="contact-relationship">({contact.relationship})</span>}
                      {contact.phone && <a href={`tel:${contact.phone}`} className="contact-phone">{contact.phone}</a>}
                      {contact.notes && <p className="contact-notes">{contact.notes}</p>}
                    </div>
                    <button className="remove-contact-btn" onClick={() => removeContact('trustedContacts', contact.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {plan.trustedContacts.length === 0 && (
                  <span className="empty-section-placeholder">No trusted contacts added yet.</span>
                )}
              </div>
            </div>

            {/* Section 5: Safe Environment Steps */}
            <div className="safety-section-card">
              <div className="section-card-header">
                <Shield size={18} className="icon-env" />
                <h3>5. Making Your Environment Safe</h3>
              </div>
              <p className="section-instruction">Steps you can take to make your immediate surroundings feel safer (e.g., removing triggering items).</p>
              
              <div className="input-row">
                <input
                  type="text"
                  placeholder="e.g. Locking away medication, turning off my phone, asking a friend to hold X..."
                  value={newSafeStep}
                  onChange={e => setNewSafeStep(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addListItem('safeEnvironmentSteps', newSafeStep, setNewSafeStep)}
                />
                <button className="add-item-btn" onClick={() => addListItem('safeEnvironmentSteps', newSafeStep, setNewSafeStep)}>
                  <Plus size={16} />
                </button>
              </div>

              <ul className="item-pills-list">
                {plan.safeEnvironmentSteps.map((item, index) => (
                  <li key={index} className="item-pill">
                    <span>{item}</span>
                    <button className="remove-pill-btn" onClick={() => removeListItem('safeEnvironmentSteps', index)}>
                      <Trash2 size={13} />
                    </button>
                  </li>
                ))}
                {plan.safeEnvironmentSteps.length === 0 && (
                  <span className="empty-section-placeholder">No safety steps added yet.</span>
                )}
              </ul>
            </div>

            {/* Section 6: Professional Help */}
            <div className="safety-section-card">
              <div className="section-card-header">
                <Shield size={18} className="icon-professional" />
                <h3>6. Professional Support Contacts</h3>
              </div>
              <p className="section-instruction">Clinicians, doctors, counselors, or local support lines you can reach out to.</p>
              
              <div className="contact-form">
                <div className="form-fields">
                  <input
                    type="text"
                    placeholder="Clinician / Facility Name"
                    value={newProfContact.name}
                    onChange={e => setNewProfContact(prev => ({ ...prev, name: e.target.value }))}
                  />
                  <input
                    type="text"
                    placeholder="Role (e.g. Therapist, Psychiatrist, Clinic)"
                    value={newProfContact.relationship}
                    onChange={e => setNewProfContact(prev => ({ ...prev, relationship: e.target.value }))}
                  />
                  <input
                    type="text"
                    placeholder="Phone number"
                    value={newProfContact.phone}
                    onChange={e => setNewProfContact(prev => ({ ...prev, phone: e.target.value }))}
                  />
                  <input
                    type="text"
                    placeholder="Notes (e.g. Office hours, location)"
                    value={newProfContact.notes}
                    onChange={e => setNewProfContact(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </div>
                <button className="add-contact-btn" onClick={() => addContact('professionalContacts', newProfContact, setNewProfContact)}>
                  <Plus size={15} /> Add Professional Contact
                </button>
              </div>

              <div className="contacts-display-list">
                {plan.professionalContacts.map((contact) => (
                  <div key={contact.id} className="contact-card">
                    <div className="contact-info">
                      <span className="contact-name">{contact.name}</span>
                      {contact.relationship && <span className="contact-relationship">({contact.relationship})</span>}
                      {contact.phone && <a href={`tel:${contact.phone}`} className="contact-phone">{contact.phone}</a>}
                      {contact.notes && <p className="contact-notes">{contact.notes}</p>}
                    </div>
                    <button className="remove-contact-btn" onClick={() => removeContact('professionalContacts', contact.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {plan.professionalContacts.length === 0 && (
                  <span className="empty-section-placeholder">No professional support contacts added yet.</span>
                )}
              </div>
            </div>

          </div>

          {/* RIGHT SIDE: Settings / Configurations */}
          <div className="safety-settings-panel">
            <div className="safety-section-card settings-card">
              <div className="section-card-header">
                <Settings size={18} className="icon-settings" />
                <h3>Safety Settings</h3>
              </div>
              <p className="section-instruction">Configure nudge behavior for high-distress moments.</p>

              <div className="settings-field-group">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={plan.checkInSettings.enabled}
                    onChange={e => updateNudgeSetting('enabled', e.target.checked)}
                  />
                  <span className="toggle-text">Enable Check-in Nudge</span>
                </label>
                <p className="field-desc">If enabled, Nereid will send a low-pressure check-in nudge message in the chat if you go quiet after a distress spike.</p>
              </div>

              {plan.checkInSettings.enabled && (
                <>
                  <div className="settings-field-group">
                    <label className="field-label">Quiet Threshold (Minutes): {plan.checkInSettings.quietThresholdMinutes}m</label>
                    <input
                      type="range"
                      min="1"
                      max="30"
                      value={plan.checkInSettings.quietThresholdMinutes}
                      onChange={e => updateNudgeSetting('quietThresholdMinutes', parseInt(e.target.value, 10))}
                    />
                    <div className="range-labels">
                      <span>1 min</span>
                      <span>15 min</span>
                      <span>30 min</span>
                    </div>
                  </div>

                  <div className="settings-field-group">
                    <label className="field-label">Check-in Message</label>
                    <textarea
                      placeholder="e.g. Still there? No pressure to respond."
                      value={plan.checkInSettings.message}
                      onChange={e => updateNudgeSetting('message', e.target.value)}
                      maxLength={180}
                      rows={3}
                    />
                    <span className="char-count">{plan.checkInSettings.message.length}/180</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SafetyPlanView;
