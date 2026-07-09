import React, { useState, useEffect } from 'react';
import { X, Shield, Phone, AlertTriangle, MessageSquare, Heart } from 'lucide-react';
import { getSafetyPlan } from '../utils/safetyStorage';
import './SafetyPlanDrawer.css';

const SafetyPlanDrawer = ({ isOpen, onClose, onNavigateToPlan }) => {
  const [plan, setPlan] = useState(null);

  useEffect(() => {
    if (isOpen) {
      const savedPlan = getSafetyPlan();
      setPlan(savedPlan);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isPlanEmpty = 
    !plan || 
    ((plan.warningSigns?.length || 0) === 0 &&
     (plan.copingSteps?.length || 0) === 0 &&
     (plan.distractions?.length || 0) === 0 &&
     (plan.trustedContacts?.length || 0) === 0 &&
     (plan.safeEnvironmentSteps?.length || 0) === 0 &&
     (plan.professionalContacts?.length || 0) === 0);

  return (
    <div className={`safety-drawer-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}>
      <div className="safety-drawer-content" onClick={e => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="drawer-header">
          <div className="drawer-title-wrap">
            <Shield size={18} className="icon-shield" />
            <h3>My Safety Plan</h3>
          </div>
          <button className="drawer-close-btn" onClick={onClose} aria-label="Close safety plan">
            <X size={18} />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="drawer-body">
          {isPlanEmpty ? (
            <div className="drawer-empty-state">
              <Heart size={32} className="heart-pulse-icon" />
              <h4>No safety plan found</h4>
              <p>Creating a personal safety plan when you feel calm provides a valuable guide for difficult emotional moments.</p>
              <button 
                className="drawer-cta-btn" 
                onClick={() => {
                  onClose();
                  onNavigateToPlan('safety-plan');
                }}
              >
                Create a Safety Plan
              </button>
            </div>
          ) : (
            <div className="drawer-plan-content">
              {/* Warning Signs */}
              {plan.warningSigns && plan.warningSigns.length > 0 && (
                <div className="drawer-section">
                  <div className="drawer-section-title">
                    <AlertTriangle size={14} className="icon-warn" />
                    <span>My Warning Signs</span>
                  </div>
                  <ul className="drawer-list">
                    {plan.warningSigns.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Coping Strategies */}
              {plan.copingSteps && plan.copingSteps.length > 0 && (
                <div className="drawer-section">
                  <div className="drawer-section-title">
                    <Shield size={14} className="icon-coping" />
                    <span>Coping Strategies</span>
                  </div>
                  <ul className="drawer-list list-ordered">
                    {plan.copingSteps.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Positive Distractions */}
              {plan.distractions && plan.distractions.length > 0 && (
                <div className="drawer-section">
                  <div className="drawer-section-title">
                    <Heart size={14} className="icon-distract" />
                    <span>Environments & Distractions</span>
                  </div>
                  <ul className="drawer-list">
                    {plan.distractions.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Trusted Contacts */}
              {plan.trustedContacts && plan.trustedContacts.length > 0 && (
                <div className="drawer-section">
                  <div className="drawer-section-title">
                    <MessageSquare size={14} className="icon-contacts" />
                    <span>People I Can Reach Out To</span>
                  </div>
                  <div className="drawer-contacts-list">
                    {plan.trustedContacts.map((contact) => (
                      <div key={contact.id} className="drawer-contact-card">
                        <div className="contact-main">
                          <span className="contact-name">{contact.name}</span>
                          {contact.relationship && <span className="contact-rel">({contact.relationship})</span>}
                        </div>
                        {contact.phone && (
                          <a href={`tel:${contact.phone}`} className="contact-call-btn">
                            <Phone size={12} />
                            <span>{contact.phone}</span>
                          </a>
                        )}
                        {contact.notes && <p className="contact-note">{contact.notes}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Safe Environment */}
              {plan.safeEnvironmentSteps && plan.safeEnvironmentSteps.length > 0 && (
                <div className="drawer-section">
                  <div className="drawer-section-title">
                    <Shield size={14} className="icon-env" />
                    <span>Keeping My Environment Safe</span>
                  </div>
                  <ul className="drawer-list">
                    {plan.safeEnvironmentSteps.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Professional Contacts */}
              {plan.professionalContacts && plan.professionalContacts.length > 0 && (
                <div className="drawer-section">
                  <div className="drawer-section-title">
                    <Shield size={14} className="icon-prof" />
                    <span>Professional Support</span>
                  </div>
                  <div className="drawer-contacts-list">
                    {plan.professionalContacts.map((contact) => (
                      <div key={contact.id} className="drawer-contact-card prof-card">
                        <div className="contact-main">
                          <span className="contact-name">{contact.name}</span>
                          {contact.relationship && <span className="contact-rel">({contact.relationship})</span>}
                        </div>
                        {contact.phone && (
                          <a href={`tel:${contact.phone}`} className="contact-call-btn call-prof">
                            <Phone size={12} />
                            <span>{contact.phone}</span>
                          </a>
                        )}
                        {contact.notes && <p className="contact-note">{contact.notes}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SafetyPlanDrawer;
