import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register'; 
import InventoryList from './components/InventoryList';
import AdminPanel from './components/AdminPanel'; 
import AuditLogs from './components/AuditLogs';
import ResetPassword from './components/ResetPassword';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('access_token'));
  const [isRegistering, setIsRegistering] = useState(false);
  const [view, setView] = useState('inventory');

  const userRole = localStorage.getItem('user_role');
  const isPrivileged = userRole === 'manager' || userRole === 'superuser';

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setView('inventory');
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setView('inventory');
  };

  const MainDashboard = () => (
    <div className="App">
      <header style={{ padding: '20px', borderBottom: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Enterprise Inventory Manager</h1>
        {isLoggedIn && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setView('inventory')} className="nav-btn">Dashboard</button>
            {isPrivileged && (
              <button onClick={() => setView('admin')} className="nav-btn admin-btn" style={{ backgroundColor: view === 'admin' ? '#388E3C' : '#4CAF50' }}>
                User Management
              </button>
            )}
            {isPrivileged && (
              <button onClick={() => setView('audit')} className="nav-btn audit-btn" style={{ backgroundColor: view === 'audit' ? '#1976D2' : '#2196F3', color: 'white' }}>
                Audit Logs
              </button>
            )}
            <button onClick={handleLogout} className="nav-btn logout-btn">Logout</button>
          </div>
        )}
      </header>

      <main style={{ padding: '20px' }}>
        {!isLoggedIn ? (
          <div className="auth-container" style={{ textAlign: 'center' }}>
            {isRegistering ? (
              <Register onRegisterSuccess={() => setIsRegistering(false)} onBackToLogin={() => setIsRegistering(false)} />
            ) : (
              <div style={{ maxWidth: '350px', margin: '0 auto' }}>
                <h2>Please Login</h2>
                <Login onLoginSuccess={handleLoginSuccess} />
                <p style={{ marginTop: '20px' }}>
                  Don't have an account?{' '}
                  <button onClick={() => setIsRegistering(true)} className="link-btn">Create one here</button>
                </p>
                
              </div>
            )}
          </div>
        ) : (
          <div className="dashboard-container">
            {view === 'inventory' && <><InventoryList /></>}
            {view === 'admin' && isPrivileged && <><AdminPanel /></>}
            {view === 'audit' && isPrivileged && <><AuditLogs /></>}
          </div>
        )}
      </main>
    </div>
  );

  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainDashboard />} />
        <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;