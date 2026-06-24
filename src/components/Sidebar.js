import React from 'react';
import './Sidebar.css';

const NereidIcon = () => (
  <svg className="nereid-icon" viewBox="0 0 24 24" aria-hidden="true">
    {/* Swimmer figure */}
    <circle cx="18" cy="5" r="1.5" stroke="white" strokeWidth="1.8" fill="none"/>
    {/* Body/wave motion */}
    <path d="M2 12 Q5 9 8 12 Q11 15 14 12 Q17 9 20 12" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
    {/* Second wave */}
    <path d="M2 16 Q5 13 8 16 Q11 19 14 16 Q17 13 20 16" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    {/* Arm stroke */}
    <path d="M10 8 Q14 4 18 7" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
  </svg>
);

const Sidebar = ({ collapsed, onToggle }) => {
  const navItems = [
    { id: 'chat',        label: 'Chat',        icon: '💬', active: true  },
    { id: 'history',     label: 'History',     icon: '🕐', active: false },
    { id: 'knowledge',   label: 'Resources',   icon: '📖', active: false },
    { id: 'automations', label: 'Insights',    icon: '📊', active: false },
  ];

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* ── Brand Header ── */}
      <div className="sidebar-header">
        <div className="logo-container">
          <div className="logo-icon-wrap">
            <NereidIcon />
          </div>
          <span className="logo-text">Nereid</span>
        </div>
        <button className="collapse-btn" onClick={onToggle} title={collapsed ? 'Expand' : 'Collapse'}>
          ‹
        </button>
      </div>

      {/* ── New Chat ── */}
      <button className="new-chat-btn">
        <span className="btn-plus">+</span>
        <span className="btn-label">New Chat</span>
      </button>

      {/* ── Navigation ── */}
      <nav className="sidebar-nav">
        {navItems.map(item => (
          <div key={item.id} className={`nav-item ${item.active ? 'active' : ''}`}>
            <div className="nav-icon-wrap">{item.icon}</div>
            <span className="nav-label">{item.label}</span>
          </div>
        ))}
      </nav>

      {/* ── Footer / User ── */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="user-avatar">N</div>
          <div className="user-info">
            <div className="user-name">Guest User</div>
            <div className="user-role">Free plan</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
