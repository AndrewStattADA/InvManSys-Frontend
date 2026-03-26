import React, { useState } from 'react';
import Login from './components/Login';
import Register from './components/Register'; 
import InventoryList from './components/InventoryList';
import AdminPanel from './components/AdminPanel'; 
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('access_token'));
  const [isRegistering, setIsRegistering] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false); 

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_role'); 
    setIsLoggedIn(false);
    setShowAdmin(false);
  };

  const userRole = localStorage.getItem('user_role');

  return (
    <div className="App">
      <header style={{ padding: '20px', borderBottom: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Enterprise Inventory Manager</h1>
        {isLoggedIn && (
          <div>
            {/* Only show this button to Managers */}
            {userRole === 'manager' && (
              <button 
                onClick={() => setShowAdmin(!showAdmin)} 
                style={{ marginRight: '10px', padding: '5px 15px', cursor: 'pointer', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px' }}
              >
                {showAdmin ? "View Inventory" : "Admin Panel"}
              </button>
            )}
            <button onClick={handleLogout} style={{ padding: '5px 15px', cursor: 'pointer' }}>Logout</button>
          </div>
        )}
      </header>

      <main style={{ padding: '20px' }}>
        {!isLoggedIn ? (
          <div className="auth-container" style={{ textAlign: 'center' }}>
            {isRegistering ? (
              <Register 
                onRegisterSuccess={() => setIsRegistering(false)} 
                onBackToLogin={() => setIsRegistering(false)} 
              />
            ) : (
              <div style={{ maxWidth: '350px', margin: '0 auto' }}>
                <h2>Please Login</h2>
                <Login onLoginSuccess={handleLoginSuccess} />
                <p style={{ marginTop: '20px' }}>
                  Don't have an account?{' '}
                  <button 
                    onClick={() => setIsRegistering(true)}
                    style={{ background: 'none', border: 'none', color: 'blue', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                  >
                    Create one here
                  </button>
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="dashboard-container">
            {/* Toggles between Admin Panel and Inventory List */}
            {showAdmin ? (
              <AdminPanel />
            ) : (
              <>
                <h2>Dashboard</h2>
                <InventoryList />
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;