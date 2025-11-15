import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import HomePage from './HomePage';
import ProfilePage from './ProfilePage';
import LoginPage from './LoginPage';

function App() {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const handleLoginSuccess = async (credentialResponse) => {
    const { credential: token } = credentialResponse;
    try {
      const response = await fetch('http://localhost:3001/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('user', JSON.stringify({ ...data, token }));
        setUser({ ...data, token });
      } else {
        console.error('Google login failed:', data.error);
      }
    } catch (error) {
      console.error('Error during Google login:', error);
    }
  };

  const handleLoginError = () => {
    console.log('Login Failed');
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };


  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            path="/login"
            element={
              user ? (
                <Navigate to="/" />
              ) : (
                <LoginPage onLoginSuccess={handleLoginSuccess} onLoginError={handleLoginError} />
              )
            }
          />
          <Route
            path="/profile"
            element={
              user ? (
                <ProfilePage user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/search/:value"
            element={
              user ? (
                <HomePage user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/"
            element={
              user ? (
                <HomePage user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
