import React, { useState, useEffect } from 'react';

function Profile({ user }) {
  const [apiKey, setApiKey] = useState('');

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
          setApiKey(data.apiKey || '');
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
      } else {
        console.error('Failed to save API key:', data.error);
      }
    } catch (error) {
      console.error('Error saving API key:', error);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="profile-section">
      <h2>Profile</h2>
      <p>Welcome, {user.name}!</p>
      <form onSubmit={handleApiKeySubmit}>
        <label htmlFor="apiKey">VirusTotal API Key:</label>
        <input
          type="text"
          id="apiKey"
          value={apiKey}
          onChange={handleApiKeyChange}
        />
        <button type="submit">Save API Key</button>
      </form>
    </div>
  );
}

export default Profile;
