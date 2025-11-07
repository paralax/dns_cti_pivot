import React, { useState } from 'react';
import './App.css';

function App() {
  const [results, setResults] = useState([]);

  const handleSearch = (query) => {
    // In a real application, you would make an API call here.
    // For this example, we'll just return some mock data.
    const mockResults = [
      { timestamp: '2023-01-01 12:34:56', ip: '192.168.1.1', type: 'A', value: 'example.com' },
      { timestamp: '2023-01-01 12:34:57', ip: '192.168.1.2', type: 'AAAA', value: 'example.com' },
    ];
    setResults(mockResults);
  };

  return (
    <div className="App">
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

export default App;
