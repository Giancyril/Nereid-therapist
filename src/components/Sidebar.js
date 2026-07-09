import React from 'react';
import { MessageSquare, History, BookOpen, BarChart2, ChevronLeft, ChevronRight, Plus, Trash2, Shield } from 'lucide-react';
import './Sidebar.css';

const NereidIcon = () => (
  <svg className="nereid-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Sparkling waves */}
    <path 
      d="M3 11C7 7 9 13 13 9C17 5 17 11 21 7" 
      stroke="white" 
      strokeWidth="2" 
      strokeLinecap="round"
    />
    <path 
      d="M3 16C7 12 9 18 13 14C17 10 17 16 21 12" 
      stroke="rgba(255,255,255,0.4)" 
      strokeWidth="1.5" 
      strokeLinecap="round"
    />
    {/* Sparkle */}
    <path 
      d="M7 4L7.7 5.7L9.4 6.4L7.7 7.1L7 8.8L6.3 7.1L4.6 6.4L6.3 5.7L7 4Z" 
      fill="#5eead4"
    />
    {/* Bubble */}
    <circle cx="17" cy="17" r="1.2" fill="#5eead4" />
  </svg>
);

const Sidebar = ({ 
  collapsed, 
  onToggle, 
  activeTab, 
  onSelectTab, 
  chats = [], 
  currentChatId, 
  onSelectChat, 
  onDeleteChat,
  onNewChat 
}) => {
  
  const navItems = [
    { id: 'chat',        label: 'Chat',        icon: <MessageSquare size={16} /> },
    { id: 'history',     label: 'History',     icon: <History size={16} /> },
    { id: 'safety-plan', label: 'Safety Plan', icon: <Shield size={16} /> },
    { id: 'resources',   label: 'Resources',   icon: <BookOpen size={16} /> },
    { id: 'insights',    label: 'Insights',    icon: <BarChart2 size={16} /> },
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
        <button 
          className="collapse-btn" 
          onClick={onToggle} 
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* ── New Chat ── */}
      <button className="new-chat-btn" onClick={onNewChat}>
        <Plus className="btn-plus" size={16} />
        <span className="btn-label">New Chat</span>
      </button>

      {/* ── Navigation ── */}
      <nav className="sidebar-nav">
        {navItems.map(item => (
          <div 
            key={item.id} 
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => onSelectTab(item.id)}
          >
            <div className="nav-icon-wrap">{item.icon}</div>
            <span className="nav-label">{item.label}</span>
          </div>
        ))}
      </nav>

      {/* ── Recent Chats List (Visible only when expanded) ── */}
      {!collapsed && chats.length > 0 && (
        <div className="recent-chats-container">
          <div className="recent-chats-title">Recent Chats</div>
          <div className="recent-chats-list">
            {chats.map(chat => (
              <div 
                key={chat.id} 
                className={`recent-chat-item ${currentChatId === chat.id && activeTab === 'chat' ? 'active' : ''}`}
                onClick={() => {
                  onSelectChat(chat.id);
                  onSelectTab('chat');
                }}
              >
                <MessageSquare size={13} className="chat-item-icon" />
                <span className="chat-item-title">{chat.title || 'Reflections Chat'}</span>
                <button 
                  className="chat-item-delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteChat(chat.id);
                  }}
                  title="Delete conversation"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

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
