import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { googleLogout } from '@react-oauth/google';

function HomePage({ user, onLogout }) {
  const [results, setResults] = useState([]);

  const handleSearch = async (query) => {
    if (!user) {
      alert('Please log in to perform a search.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/virustotal/domain/${query}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setResults(data);
      } else {
        console.error('Failed to fetch domain info:', data.error);
        setResults([]);
      }
    } catch (error) {
      console.error('Error fetching domain info:', error);
      setResults([]);
    }
  };

  const handleLogout = () => {
    googleLogout();
    onLogout();
  };


  return (
    <div className="home-page">
      <nav>
        <Link to="/profile">Profile</Link>
        <button onClick={handleLogout}>Logout</button>
      </nav>
      <header className="App-header">
        <h1>CTI DNS Investigator</h1>
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

export default HomePage;
