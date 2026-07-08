import React from 'react';
import { MessageSquare, History, BookOpen, BarChart2, ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import './Sidebar.css';

const NereidIcon = () => (
  <svg className="nereid-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Sparkling waves */}
    <path d="M2 13C6.8 8.2 9.2 13.8 14 9C18.8 4.2 18.2 9.8 22 5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <path d="M2 17C6.8 12.2 9.2 17.8 14 13C18.8 8.2 18.2 13.8 22 9" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="18" cy="14" r="1" fill="#2dd4bf"/>
    <path d="M7 6L7.8 7.5L9.5 8L7.8 8.5L7 10L6.2 8.5L4.5 8L6.2 7.5L7 6Z" fill="#5eead4"/>
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
    { id: 'resources',   label: 'Resources',   icon: <BookOpen size={16} /> },
    { id: 'insights',    label: 'Insights',    icon: <BarChart2 size={16} /> },
  ];

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* ── Brand Header ── */}
      <div className="sidebar-header">
        <div className="logo-container">
          <div className="logo-icon-wrap animate-glow">
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
