import React, { useState } from 'react';
import { MessageSquare, Calendar, Trash2, ArrowRight, BookOpen } from 'lucide-react';
import './HistoryView.css';

const HistoryView = ({ chats = [], onSelectChat, onDeleteChat }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChats = chats.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.messages.some(msg => msg.text.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Extract date formatted label
  const getChatDate = (chat) => {
    if (chat.messages.length > 0) {
      // Use timestamp of last message, or generic
      return 'Recent Reflection';
    }
    return 'Timeline entry';
  };

  // Get mood tags from a chat
  const getMoodTags = (chat) => {
    const moods = new Set();
    chat.messages.forEach(msg => {
      if (msg.sender === 'user' && msg.analysis && msg.analysis.emotional_state) {
        moods.add(msg.analysis.emotional_state);
      }
    });
    return Array.from(moods).slice(0, 3); // Max 3 tags
  };

  return (
    <div className="history-page-container">
      {/* ── Header ── */}
      <div className="history-header">
        <div>
          <div className="header-title">Reflection History</div>
          <div className="header-subtitle">Review, search, and resume your emotional journey sessions</div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="history-page-content">
        <div className="history-search-wrap">
          <input
            type="text"
            placeholder="Search within past reflections and conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="history-search-input"
          />
        </div>

        {filteredChats.length > 0 ? (
          <div className="history-cards-grid">
            {filteredChats.map((chat) => {
              const lastMsg = chat.messages[chat.messages.length - 1];
              const moodTags = getMoodTags(chat);

              return (
                <div key={chat.id} className="history-session-card">
                  <div className="session-card-header">
                    <div className="session-title-wrap">
                      <MessageSquare className="text-teal" size={16} />
                      <h3>{chat.title || 'Untitled reflection'}</h3>
                    </div>
                    <button
                      className="session-delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteChat(chat.id);
                      }}
                      title="Delete conversation"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <div className="session-card-body">
                    <p className="session-msg-preview">
                      {lastMsg ? lastMsg.text : 'Empty conversation.'}
                    </p>

                    {moodTags.length > 0 && (
                      <div className="session-mood-tags">
                        {moodTags.map(mood => (
                          <span key={mood} className={`mood-pill pill-${mood}`}>
                            {mood.charAt(0).toUpperCase() + mood.slice(1)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="session-card-footer">
                    <div className="session-date">
                      <Calendar size={12} />
                      <span>{getChatDate(chat)}</span>
                    </div>
                    <button
                      className="session-resume-btn"
                      onClick={() => onSelectChat(chat.id)}
                    >
                      <span>Resume</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="history-empty-state">
            <BookOpen size={36} className="text-muted" />
            <h2>No Reflections Found</h2>
            <p>
              {searchQuery
                ? 'No past conversations match your search terms.'
                : 'Start chatting with Nereid to build up your reflection history!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryView;
