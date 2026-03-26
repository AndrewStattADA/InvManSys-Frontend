import React, { useState } from 'react';
import Login from './components/Login';
import Register from './components/Register'; 
import InventoryList from './components/InventoryList';
import './App.css';

function App() {
  // Checks if there is a token in storage to keep the user logged in
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('access_token'));
  
  //toggle between Login and Register forms
  const [isRegistering, setIsRegistering] = useState(false);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setIsLoggedIn(false);
  };

  return (
    <div className="App">
      <header style={{ padding: '20px', borderBottom: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Enterprise Inventory Manager</h1>
        {isLoggedIn && <button onClick={handleLogout} style={{ padding: '5px 15px', cursor: 'pointer' }}>Logout</button>}
      </header>

      <main style={{ padding: '20px' }}>
        {!isLoggedIn ? (
          <div className="auth-container" style={{ textAlign: 'center' }}>
            {isRegistering ? (
            // SHOW REGISTRATION FORM
              <Register 
                onRegisterSuccess={() => setIsRegistering(false)} 
                onBackToLogin={() => setIsRegistering(false)} 
              />
            ) : (
              // SHOW LOGIN FORM
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
          // SHOW DASHBOARD 
          <div className="dashboard-container">
            <h2>Dashboard</h2>
            <InventoryList />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;