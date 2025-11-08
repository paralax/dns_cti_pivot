import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';

// Mock the fetch function
global.fetch = jest.fn();

beforeEach(() => {
  fetch.mockClear();
  localStorage.clear();
});

test('renders login page for unauthenticated users', () => {
  render(
    <GoogleOAuthProvider clientId="test">
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    </GoogleOAuthProvider>
  );
  expect(screen.getByText(/Please log in with your Google account to continue./i)).toBeInTheDocument();
});

test('redirects authenticated users to the home page', async () => {
  // Mock the user data in localStorage
  const user = { name: 'Test User', token: 'test-token' };
  localStorage.setItem('user', JSON.stringify(user));

  // Mock the API key fetch response from Profile component
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ apiKeyExists: false, maskedApiKey: '' }),
  });

  render(
    <GoogleOAuthProvider clientId="test">
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>
    </GoogleOAuthProvider>
  );

  await waitFor(() => {
    expect(screen.getByText(/CTI DNS Investigator/i)).toBeInTheDocument();
  });
});
