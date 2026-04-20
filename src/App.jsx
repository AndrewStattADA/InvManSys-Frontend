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
    <div className="app-wrapper">
      <header className="main-header">
        <h1>Enterprise Inventory Manager</h1>
      </header>

      <div className={isLoggedIn ? "dashboard-layout" : "auth-layout"}>
        {isLoggedIn && (
          <aside className="sidebar">
            <nav className="nav-menu">
              <button 
                onClick={() => setView('inventory')} 
                className={`nav-btn ${view === 'inventory' ? 'active' : ''}`}
              >
                Dashboard
              </button>
              
              {isPrivileged && (
                <>
                  <button 
                    onClick={() => setView('admin')} 
                    className={`nav-btn admin-btn ${view === 'admin' ? 'active' : ''}`}
                  >
                    User Management
                  </button>
                  <button 
                    onClick={() => setView('audit')} 
                    className={`nav-btn audit-btn ${view === 'audit' ? 'active' : ''}`}
                  >
                    Audit Logs
                  </button>
                </>
              )}
            </nav>
            <button onClick={handleLogout} className="nav-btn logout-btn">
              Logout
            </button>
          </aside>
        )}

        <main className="main-content">
          {!isLoggedIn ? (
            <div className="auth-container">
              {isRegistering ? (
                <Register onRegisterSuccess={() => setIsRegistering(false)} onBackToLogin={() => setIsRegistering(false)} />
              ) : (
                <div className="login-box">
                  <h2>Please Login</h2>
                  <Login onLoginSuccess={handleLoginSuccess} />
                  <p className="auth-footer">
                    Don't have an account?{' '}
                    <button onClick={() => setIsRegistering(true)} className="link-btn">Create one here</button>
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="view-container">
              {view === 'inventory' && <InventoryList />}
              {view === 'admin' && isPrivileged && <AdminPanel />}
              {view === 'audit' && isPrivileged && <AuditLogs />}
            </div>
          )}
        </main>
      </div>
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