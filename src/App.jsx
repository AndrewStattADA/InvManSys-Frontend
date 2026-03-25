import React, { useState } from 'react';
import Login from './components/Login';
import InventoryList from './components/InventoryList'; 
import './App.css';

function App() {
  // Checks if there is a token in storage to keep the user logged in
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('access_token'));

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
      <header style={{ padding: '20px', borderBottom: '1px solid #ccc' }}>
        <h1>Enterprise Inventory Manager</h1>
        {isLoggedIn && <button onClick={handleLogout}>Logout</button>}
      </header>
      
      <main style={{ padding: '20px' }}>
        {!isLoggedIn ? (
          <div className="auth-container">
            <h2>Please Login</h2>
            <Login onLoginSuccess={handleLoginSuccess} />
          </div>
        ) : (
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