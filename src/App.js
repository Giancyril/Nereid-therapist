import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Chat from './components/Chat';
import HistoryView from './components/HistoryView';
import Resources from './components/Resources';
import Insights from './components/Insights';
import Home from './components/Home';
import SafetyPlanView from './components/SafetyPlanView';
import { getSafetyPlan, getEscalationEvents, saveEscalationEvents } from './utils/safetyStorage';
import './App.css';

const getInitialChats = () => {
  const saved = localStorage.getItem('nereid_chats');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Error parsing saved chats from localStorage:', e);
    }
  }
  return [
    {
      id: 'default',
      title: 'Warm Welcome',
      messages: [
        {
          id: 1,
          text: "Hello! I'm Nereid, your compassionate AI companion. I'm here to listen, support, and help you navigate whatever you're going through. How are you feeling today?",
          sender: 'nereid',
          timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        }
      ]
    }
  ];
};

const getInitialChatId = (chatsList) => {
  const saved = localStorage.getItem('nereid_current_chat_id');
  if (saved && chatsList.some(c => c.id === saved)) {
    return saved;
  }
  return chatsList[0]?.id || 'default';
};

function App() {
  // 'landing' = full-page home (no sidebar), 'dashboard' = sidebar + content
  const [view, setView] = useState('landing');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // chat, history, resources, insights
  const [chats, setChats] = useState(getInitialChats);
  const [currentChatId, setCurrentChatId] = useState(() => getInitialChatId(getInitialChats()));

  // Persist chats and current chat ID
  useEffect(() => {
    localStorage.setItem('nereid_chats', JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    localStorage.setItem('nereid_current_chat_id', currentChatId);
  }, [currentChatId]);

  // Foreground check for safety plan check-in nudges
  useEffect(() => {
    const handleForegroundCheck = () => {
      const plan = getSafetyPlan();
      if (!plan.checkInSettings?.enabled) return;

      const thresholdMs = plan.checkInSettings.quietThresholdMinutes * 60 * 1000;
      const now = Date.now();
      const events = getEscalationEvents();
      let updated = false;

      const nextEvents = events.map(event => {
        if (!event.checkInSent && !event.userDismissed && (now - event.triggeredAt) >= thresholdMs) {
          setChats(prevChats => {
            const chatToUpdate = prevChats.find(c => c.id === event.sessionId);
            if (chatToUpdate) {
              const alreadyHasNudge = chatToUpdate.messages?.some(m => m.type === 'nudge-card');
              if (!alreadyHasNudge) {
                const nudgeMsg = {
                  id: Date.now(),
                  sender: 'nereid',
                  type: 'nudge-card',
                  text: plan.checkInSettings.message || "Still there? No pressure to respond.",
                  timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
                };
                return prevChats.map(c => {
                  if (c.id === event.sessionId) {
                    return {
                      ...c,
                      messages: [...(c.messages || []), nudgeMsg]
                    };
                  }
                  return c;
                });
              }
            }
            return prevChats;
          });

          updated = true;
          return { ...event, checkInSent: true };
        }
        return event;
      });

      if (updated) {
        saveEscalationEvents(nextEvents);
      }
    };

    handleForegroundCheck();

    window.addEventListener('focus', handleForegroundCheck);
    return () => {
      window.removeEventListener('focus', handleForegroundCheck);
    };
  }, []);

  const handleUpdateMessages = (chatId, nextMessages) => {
    setChats(prevChats =>
      prevChats.map(c => {
        if (c.id === chatId) {
          let updatedTitle = c.title;
          if (c.title === 'New Reflection' || c.title === 'Warm Welcome') {
            const firstUserMsg = nextMessages.find(m => m.sender === 'user');
            if (firstUserMsg) {
              const text = firstUserMsg.text;
              updatedTitle = text.length > 25 ? text.substring(0, 22) + '...' : text;
            }
          }
          return { ...c, title: updatedTitle, messages: nextMessages };
        }
        return c;
      })
    );
  };

  const handleNewChat = () => {
    const newId = Date.now().toString();
    const newChat = {
      id: newId,
      title: 'New Reflection',
      messages: [
        {
          id: Date.now() + 1,
          text: "Hello! I'm Nereid, your compassionate AI companion. I'm here to listen, support, and help you navigate whatever you're going through. How are you feeling today?",
          sender: 'nereid',
          timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        }
      ]
    };
    setChats(prev => [newChat, ...prev]);
    setCurrentChatId(newId);
    setActiveTab('chat');
    setView('dashboard');
  };

  const handleDeleteChat = (chatId) => {
    setChats(prev => {
      const filtered = prev.filter(c => c.id !== chatId);
      if (filtered.length === 0) {
        const defaultChat = {
          id: 'default',
          title: 'Warm Welcome',
          messages: [
            {
              id: 1,
              text: "Hello! I'm Nereid, your compassionate AI companion. I'm here to listen, support, and help you navigate whatever you're going through. How are you feeling today?",
              sender: 'nereid',
              timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
            }
          ]
        };
        setCurrentChatId('default');
        return [defaultChat];
      }
      if (chatId === currentChatId) {
        setCurrentChatId(filtered[0].id);
      }
      return filtered;
    });
  };

  // Enter dashboard (preserves current tab, defaults to 'chat')
  const handleEnterDashboard = () => {
    setView('dashboard');
  };

  // Find active chat object
  const activeChat = chats.find(c => c.id === currentChatId) || chats[0];

  // ── LANDING VIEW (no sidebar) ──────────────────────────────────────────
  if (view === 'landing') {
    return (
      <div className="app-landing">
        <Home
          onEnterDashboard={handleEnterDashboard}
          onStartChat={handleNewChat}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            setView('dashboard');
          }}
        />
      </div>
    );
  }

  // ── DASHBOARD VIEW (sidebar + content) ────────────────────────────────
  const renderMainContent = () => {
    switch (activeTab) {
      case 'chat':
        return (
          <Chat
            chatId={currentChatId}
            messages={activeChat?.messages}
            onUpdateMessages={(msgs) => handleUpdateMessages(currentChatId, msgs)}
            onSelectTab={setActiveTab}
          />
        );
      case 'history':
        return (
          <HistoryView
            chats={chats}
            onSelectChat={(id) => {
              setCurrentChatId(id);
              setActiveTab('chat');
            }}
            onDeleteChat={handleDeleteChat}
          />
        );
      case 'resources':
        return <Resources />;
      case 'safety-plan':
        return <SafetyPlanView />;
      case 'insights':
        return <Insights chats={chats} />;
      default:
        return (
          <Chat
            messages={activeChat?.messages}
            onUpdateMessages={(msgs) => handleUpdateMessages(currentChatId, msgs)}
          />
        );
    }
  };

  return (
    <div className="app">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        chats={chats}
        currentChatId={currentChatId}
        onSelectChat={setCurrentChatId}
        onDeleteChat={handleDeleteChat}
        onNewChat={handleNewChat}
      />
      <div className="main-content">
        {renderMainContent()}
      </div>
    </div>
  );
}

export default App;
