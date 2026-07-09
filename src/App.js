import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Chat from './components/Chat';
import HistoryView from './components/HistoryView';
import Resources from './components/Resources';
import Insights from './components/Insights';
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

  const handleUpdateMessages = (chatId, nextMessages) => {
    setChats(prevChats => 
      prevChats.map(c => {
        if (c.id === chatId) {
          // If title is generic and a user message is sent, generate a topic title
          let updatedTitle = c.title;
          if (c.title === 'New Reflection' || c.title === 'Warm Welcome') {
            const firstUserMsg = nextMessages.find(m => m.sender === 'user');
            if (firstUserMsg) {
              const text = firstUserMsg.text;
              updatedTitle = text.length > 25 ? text.substring(0, 22) + '...' : text;
            }
          }
          return {
            ...c,
            title: updatedTitle,
            messages: nextMessages
          };
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

  // Find active chat object
  const activeChat = chats.find(c => c.id === currentChatId) || chats[0];

  // Render view depending on active tab
  const renderMainContent = () => {
    switch (activeTab) {
      case 'chat':
        return (
          <Chat 
            messages={activeChat?.messages} 
            onUpdateMessages={(msgs) => handleUpdateMessages(currentChatId, msgs)} 
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
