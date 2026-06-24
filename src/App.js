import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Chat from './components/Chat';
import './App.css';

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="app">
      <Sidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <Chat />
    </div>
  );
}

export default App;

