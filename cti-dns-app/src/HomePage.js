import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { googleLogout } from '@react-oauth/google';

// Helper function to find and link IPs and domain names in text
const linkifyWhois = (text) => {
  if (!text) {
    return text;
  }
  const regex = /(\b(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}\b|\b(?:\d{1,3}\.){3}\d{1,3}\b)/g;
  const parts = text.split(regex);
  return parts.map((part, i) => {
    if (part && (part.match(regex))) {
      return <Link key={i} to={`/search/${part}`}>{part}</Link>;
    }
    return part;
  });
};

function HomePage({ user, onLogout }) {
  const [results, setResults] = useState([]);
  const [whois, setWhois] = useState('');
  const [whoisDate, setWhoisDate] = useState(null);
  const [subdomains, setSubdomains] = useState([]);
  const [resolutions, setResolutions] = useState([]);
  const [searchType, setSearchType] = useState('');
  const [query, setQuery] = useState('');

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
        credentials: 'include',
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
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch(query);
              }
            }}
          />
          <button onClick={() => handleSearch(query)}>Search</button>
        </div>
      </header>
      <main className="App-main">
        <div className="results-container">
          <div className="left-panel">
            {searchType === 'domain' && whois && (
              <div className="whois-panel">
                <div className="whois-header">
                  <h2>WHOIS Information</h2>
                  <span>Last updated: {new Date(whoisDate).toLocaleString()}</span>
                </div>
                <pre className="whois-data">{linkifyWhois(whois)}</pre>
              </div>
            )}
          </div>
          <div className="right-panel">
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
                        <td><Link to={`/search/${resolution.hostname}`}>{resolution.hostname}</Link></td>
                        <td>{resolution.last_resolved}</td>
                      </tr>
                    ))
                  ) : (
                    results.map((result, index) => (
                      <tr key={index}>
                        <td>{result.timestamp}</td>
                        <td><Link to={`/search/${result.ip}`}>{result.ip}</Link></td>
                        <td>{result.type}</td>
                        <td><Link to={`/search/${result.value}`}>{result.value}</Link></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {searchType === 'domain' && subdomains.length > 0 && (
              <div className="subdomains-section">
                <h2>Subdomains</h2>
                <ul>
                  {subdomains.map((subdomain, index) => (
                    <li key={index}><Link to={`/search/${subdomain}`}>{subdomain}</Link></li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default HomePage;
