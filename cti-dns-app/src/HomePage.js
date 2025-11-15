import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { googleLogout } from '@react-oauth/google';

function HomePage({ user, onLogout }) {
  const [results, setResults] = useState([]);
  const [whois, setWhois] = useState('');
  const [whoisDate, setWhoisDate] = useState(null);
  const [subdomains, setSubdomains] = useState([]);
  const [resolutions, setResolutions] = useState([]);
  const [searchType, setSearchType] = useState('');
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('dns');
  const [sortConfig, setSortConfig] = useState({ key: 'timestamp', direction: 'descending' });
  const { value } = useParams();
  const navigate = useNavigate();

  const handleSearch = async (searchQuery) => {
    if (!user) {
      alert('Please log in to perform a search.');
      return;
    }

    if (!searchQuery) return;

    navigate(`/search/${searchQuery}`);

    // Simple IP address regex
    const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
    const isIpAddress = ipRegex.test(searchQuery);
    setSearchType(isIpAddress ? 'ip' : 'domain');

    try {
      let url = '';
      if (isIpAddress) {
        url = `http://localhost:3001/api/virustotal/ip/${searchQuery}`;
      } else {
        url = `http://localhost:3001/api/virustotal/domain/${searchQuery}`;
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

  useEffect(() => {
    if (value) {
      setQuery(value);
      handleSearch(value);
    }
  }, [value]);

  const sortedResults = React.useMemo(() => {
    let sortableItems = [...results];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [results, sortConfig]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const linkify = (text) => {
    const ipRegex = /(\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b)/g;
    const domainRegex = /(\b(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}\b)/g;

    const parts = text.split(ipRegex).map((part, i) =>
      i % 2 === 1 ? (
        <Link key={i} to={`/search/${part}`}>{part}</Link>
      ) : (
        part
      )
    );

    return parts.flatMap((part) =>
      typeof part === 'string'
        ? part.split(domainRegex).map((subPart, i) =>
            i % 2 === 1 ? (
              <Link key={i} to={`/search/${subPart}`}>{subPart}</Link>
            ) : (
              subPart
            )
          )
        : part
    );
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
          <div className="tabs">
            <button className={activeTab === 'dns' ? 'active' : ''} onClick={() => setActiveTab('dns')}>DNS</button>
            {searchType === 'domain' && <button className={activeTab === 'whois' ? 'active' : ''} onClick={() => setActiveTab('whois')}>WHOIS</button>}
          </div>
          {activeTab === 'dns' && (
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
                      <th onClick={() => requestSort('timestamp')}>Timestamp</th>
                      <th onClick={() => requestSort('ip')}>IP Address</th>
                      <th onClick={() => requestSort('type')}>DNS Record Type</th>
                      <th onClick={() => requestSort('value')}>Value</th>
                    </tr>
                  )}
                </thead>
                <tbody>
                  {searchType === 'ip' ? (
                    resolutions.map((resolution, index) => (
                      <tr key={index}>
                        <td>{linkify(resolution.hostname)}</td>
                        <td>{resolution.last_resolved}</td>
                      </tr>
                    ))
                  ) : (
                    sortedResults.map((result, index) => (
                      <tr key={index}>
                        <td>{result.timestamp}</td>
                        <td>{linkify(result.ip)}</td>
                        <td>{result.type}</td>
                        <td>{linkify(result.value)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              {searchType === 'domain' && subdomains.length > 0 && (
                <div className="subdomains-section">
                  <h2>Subdomains</h2>
                  <ul>
                    {subdomains.map((subdomain, index) => (
                      <li key={index}>{linkify(subdomain)}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          {activeTab === 'whois' && searchType === 'domain' && whois && (
            <div className="whois-panel">
              <div className="whois-header">
                <h2>WHOIS Information</h2>
                <span>Last updated: {new Date(whoisDate).toLocaleString()}</span>
              </div>
              <pre className="whois-data">{linkify(whois)}</pre>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default HomePage;
