import React, { useState, useEffect } from 'react';
import { GoogleLogin, googleLogout } from '@react-oauth/google';
import './App.css';
import Profile from './Profile';

function App() {
  const [user, setUser] = useState(null);
  const [results, setResults] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleSearch = (query) => {
    // In a real application, you would make an API call here.
    // For this example, we'll just return some mock data.
    const mockResults = [
      { timestamp: '2023-01-01 12:34:56', ip: '192.168.1.1', type: 'A', value: 'example.com' },
      { timestamp: '2023-01-01 12:34:57', ip: '192.168.1.2', type: 'AAAA', value: 'example.com' },
    ];
    setResults(mockResults);
  };

  const handleGoogleLoginSuccess = async (credentialResponse) => {
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

  const handleGoogleLoginError = () => {
    console.log('Login Failed');
  };

  const handleLogout = () => {
    googleLogout();
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>CTI DNS Investigator</h1>
        <div className="auth-buttons">
          {user ? (
            <button onClick={handleLogout}>Logout</button>
          ) : (
            <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={handleGoogleLoginError}
            />
          )}
        </div>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Enter domain, IP, netblock, or regex..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch(e.target.value);
              }
            }}
          />
        </div>
      </header>
      <main className="App-main">
        {user && <Profile user={user} />}
        <div className="results-pane">
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>IP Address</th>
                <th>DNS Record Type</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, index) => (
                <tr key={index}>
                  <td>{result.timestamp}</td>
                  <td>{result.ip}</td>
                  <td>{result.type}</td>
                  <td>{result.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default App;
