import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { googleLogout } from '@react-oauth/google';

function ProfilePage({ user, onLogout }) {
  const [apiKey, setApiKey] = useState('');
  const [displayedApiKey, setDisplayedApiKey] = useState('');
  const [apiKeyExists, setApiKeyExists] = useState(false);

  useEffect(() => {
    const fetchApiKeyStatus = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/user/apikey', {
          headers: { 'Authorization': `Bearer ${user.token}` },
        });
        const data = await response.json();
        setApiKeyExists(data.apiKeyExists);
      } catch (error) {
        console.error('Error fetching API key status:', error);
      }
    };
    fetchApiKeyStatus();
  }, [user.token]);

  const handleLogout = () => {
    googleLogout();
    onLogout();
  };

  const handleApiKeyChange = (e) => {
    setApiKey(e.target.value);
  };

  const handleApiKeySubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/api/user/apikey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({ apiKey }),
      });
      if (response.ok) {
        alert('API key saved successfully');
        setApiKeyExists(true);
        setApiKey('');
        setDisplayedApiKey('');
      } else {
        const data = await response.json();
        console.error('Failed to save API key:', data.error);
      }
    } catch (error) {
      console.error('Error saving API key:', error);
    }
  };

  const handleApiKeyDelete = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/user/apikey', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.token}` },
      });
      if (response.ok) {
        alert('API key deleted successfully');
        setApiKeyExists(false);
        setDisplayedApiKey('');
      } else {
        const data = await response.json();
        console.error('Failed to delete API key:', data.error);
      }
    } catch (error) {
      console.error('Error deleting API key:', error);
    }
  };

  const handleShowApiKey = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/user/apikey/full', {
        headers: { 'Authorization': `Bearer ${user.token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setDisplayedApiKey(data.apiKey);
      } else {
        console.error('Failed to fetch API key');
      }
    } catch (error) {
      console.error('Error fetching API key:', error);
    }
  };

  return (
    <div className="profile-page">
      <nav>
        <Link to="/">Home</Link>
        <button onClick={handleLogout}>Logout</button>
      </nav>
      <div className="profile-section">
        <h2>Profile</h2>
        <p>Welcome, {user.name}!</p>
        {apiKeyExists && (
          <div className="api-key-display">
            <p>API key is set for this session.</p>
            <button onClick={handleShowApiKey}>Show Key</button>
            <button onClick={handleApiKeyDelete}>Delete Key</button>
            {displayedApiKey && <p>Your API Key: <code>{displayedApiKey}</code></p>}
          </div>
        )}
        <form onSubmit={handleApiKeySubmit}>
          <label htmlFor="apiKey">
            {apiKeyExists ? 'Update VirusTotal API Key:' : 'Enter VirusTotal API Key:'}
          </label>
          <input
            type="password"
            id="apiKey"
            value={apiKey}
            onChange={handleApiKeyChange}
            placeholder="Enter new API key"
          />
          <button type="submit">{apiKeyExists ? 'Update API Key' : 'Save API Key'}</button>
        </form>
      </div>
    </div>
  );
}

export default ProfilePage;
