import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { googleLogout } from '@react-oauth/google';

function HomePage({ user, onLogout }) {
  const [results, setResults] = useState([]);
  const [whois, setWhois] = useState('');
  const [whoisDate, setWhoisDate] = useState(null);
  const [subdomains, setSubdomains] = useState([]);
  const [resolutions, setResolutions] = useState([]);
  const [searchType, setSearchType] = useState('');

  const handleSearch = async (query) => {
    if (!user) {
      alert('Please log in to perform a search.');
      return;
    }

    // Simple IP address regex
    const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
    const isIpAddress = ipRegex.test(query);
    setSearchType(isIpAddress ? 'ip' : 'domain');

    try {
      let url = '';
      if (isIpAddress) {
        url = `http://localhost:3001/api/virustotal/ip/${query}`;
      } else {
        url = `http://localhost:3001/api/virustotal/domain/${query}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        if (isIpAddress) {
          setResolutions(data.resolutions);
          setResults([]);
          setWhois('');
          setWhoisDate(null);
          setSubdomains([]);
        } else {
          setResults(data.dnsRecords);
          setWhois(data.whois);
          setWhoisDate(data.whoisDate);
          setSubdomains(data.subdomains);
          setResolutions([]);
        }
      } else {
        console.error('Failed to fetch info:', data.error);
        setResults([]);
        setWhois('');
        setWhoisDate(null);
        setSubdomains([]);
        setResolutions([]);
      }
    } catch (error) {
      console.error('Error fetching info:', error);
      setResults([]);
      setWhois('');
      setWhoisDate(null);
      setSubdomains([]);
      setResolutions([]);
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
            placeholder="Enter domain or IP address..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch(e.target.value);
              }
            }}
          />
        </div>
      </header>
      <main className="App-main">
        <div className="results-container">
          {searchType === 'domain' && whois && (
            <div className="whois-section">
              <h2>WHOIS Information</h2>
              <p>Last updated: {new Date(whoisDate).toLocaleString()}</p>
              <pre>{whois}</pre>
            </div>
          )}
          {searchType === 'domain' && subdomains.length > 0 && (
            <div className="subdomains-section">
              <h2>Subdomains</h2>
              <ul>
                {subdomains.map((subdomain, index) => (
                  <li key={index}>{subdomain}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="results-pane">
            <h2>{searchType === 'ip' ? 'Resolutions' : 'DNS Records'}</h2>
            <table>
            <thead>
              {searchType === 'ip' ? (
                <tr>
                  <th>Hostname</th>
                  <th>Last Resolved</th>
                </tr>
              ) : (
                <tr>
                  <th>Timestamp</th>
                  <th>IP Address</th>
                  <th>DNS Record Type</th>
                  <th>Value</th>
                </tr>
              )}
            </thead>
            <tbody>
              {searchType === 'ip' ? (
                resolutions.map((resolution, index) => (
                  <tr key={index}>
                    <td>{resolution.hostname}</td>
                    <td>{resolution.last_resolved}</td>
                  </tr>
                ))
              ) : (
                results.map((result, index) => (
                  <tr key={index}>
                    <td>{result.timestamp}</td>
                    <td>{result.ip}</td>
                    <td>{result.type}</td>
                    <td><a href={`https://www.virustotal.com/gui/${result.type === 'A' || result.type === 'AAAA' ? 'ip-address' : 'domain'}/${result.value}`} target="_blank" rel="noopener noreferrer">{result.value}</a></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        </div>
      </main>
    </div>
  );
}

export default HomePage;
