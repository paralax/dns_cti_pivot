import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { googleLogout } from '@react-oauth/google';

function ProfilePage({ user, onLogout }) {
  const [apiKey, setApiKey] = useState('');
  const [maskedApiKey, setMaskedApiKey] = useState('');
  const [apiKeyExists, setApiKeyExists] = useState(false);

  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/user/apikey', {
          headers: {
            'Authorization': `Bearer ${user.token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setMaskedApiKey(data.maskedApiKey || '');
          setApiKeyExists(data.apiKeyExists);
        } else {
          console.error('Failed to fetch API key:', data.error);
        }
      } catch (error) {
        console.error('Error fetching API key:', error);
      }
    };

    if (user) {
      fetchApiKey();
    }
  }, [user]);

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
      const data = await response.json();
      if (response.ok) {
        alert('API key saved successfully');
        // Refresh the API key
        const newResponse = await fetch('http://localhost:3001/api/user/apikey', {
          headers: {
            'Authorization': `Bearer ${user.token}`,
          },
        });
        const newData = await newResponse.json();
        if (newResponse.ok) {
          setMaskedApiKey(newData.maskedApiKey || '');
          setApiKeyExists(newData.apiKeyExists);
        }
        setApiKey('');
      } else {
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
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        alert('API key deleted successfully');
        setMaskedApiKey('');
        setApiKeyExists(false);
      } else {
        console.error('Failed to delete API key:', data.error);
      }
    } catch (error) {
      console.error('Error deleting API key:', error);
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
            <p>Your current API key: {maskedApiKey}</p>
            <button onClick={handleApiKeyDelete}>Delete Key</button>
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
