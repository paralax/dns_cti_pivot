import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';

// Mock the fetch function
global.fetch = jest.fn();

beforeEach(() => {
  fetch.mockClear();
  localStorage.clear();
});

test('renders CTI DNS Investigator heading', () => {
  render(
    <GoogleOAuthProvider clientId="test">
      <App />
    </GoogleOAuthProvider>
  );
  const headingElement = screen.getByText(/CTI DNS Investigator/i);
  expect(headingElement).toBeInTheDocument();
});

test('fetches and displays DNS records on search', async () => {
  // Mock the user data in localStorage
  const user = { name: 'Test User', token: 'test-token' };
  localStorage.setItem('user', JSON.stringify(user));

  // Mock the API key fetch response from Profile component
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ apiKey: 'test-vt-api-key' }),
  });

  // Mock the successful domain search fetch response
  const mockDnsRecords = [
    { timestamp: '2023-01-01T12:34:56.000Z', ip: '1.1.1.1', type: 'A', value: '1.1.1.1' },
    { timestamp: '2023-01-01T12:34:57.000Z', ip: '2606:4700:4700::1111', type: 'AAAA', value: '2606:4700:4700::1111' },
  ];
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => mockDnsRecords,
  });

  render(
    <GoogleOAuthProvider clientId="test">
      <App />
    </GoogleOAuthProvider>
  );

  const searchInput = screen.getByPlaceholderText(/Enter domain, IP, netblock, or regex.../i);

  // Simulate typing a domain and pressing Enter
  fireEvent.change(searchInput, { target: { value: 'example.com' } });
  fireEvent.keyDown(searchInput, { key: 'Enter', code: 'Enter' });

  // Wait for the results to be displayed
  await waitFor(() => {
    expect(screen.getAllByText('1.1.1.1')[0]).toBeInTheDocument();
    expect(screen.getAllByText('2606:4700:4700::1111')[0]).toBeInTheDocument();
  });
});
