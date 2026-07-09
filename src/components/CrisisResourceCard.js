import React from 'react';
    import { AlertTriangle, Shield } from 'lucide-react';
    import './CrisisResourceCard.css';

    const CrisisResourceCard = ({ onOpenSafetyPlan, onDismiss }) => {
      return (
        <div className="crisis-resource-card">
          <div className="crisis-card-header">
            <AlertTriangle className="crisis-warn-icon" size={18} />
            <h4>It sounds like things are heavy right now.</h4>
          </div>
          <p className="crisis-card-intro">
            Please know that you're not alone. Here is verified support if you'd like to reach out:
          </p>
          
          <div className="crisis-contacts-grid">
            <div className="crisis-contact-box">
              <a href="tel:988" className="crisis-call-link">Call 988 (Lifeline)</a>
              <span className="crisis-desc">Free, confidential, 24/7 support line</span>
            </div>
            <div className="crisis-contact-box">
              <a href="sms:741741?&body=HOME" className="crisis-call-link">Text HOME to 741741</a>
              <span className="crisis-desc">Connect with Crisis Text Line</span>
            </div>
          </div>

          <div className="crisis-card-footer">
            <button 
              className="view-plan-btn"
              onClick={onOpenSafetyPlan}
            >
              <Shield size={14} />
              <span>View My Safety Plan</span>
            </button>
            {onDismiss && (
              <button 
                className="dismiss-crisis-btn"
                onClick={onDismiss}
              >
                I'm safe / Dismiss
              </button>
            )}
          </div>
        </div>
      );
    };

    export default CrisisResourceCard;
