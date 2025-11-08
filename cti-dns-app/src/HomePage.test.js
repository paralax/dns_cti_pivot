import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomePage from './HomePage';

// Mock the fetch function
global.fetch = jest.fn();

beforeEach(() => {
  fetch.mockClear();
});

test('fetches and displays domain info on domain search', async () => {
  const user = { name: 'Test User', token: 'test-token' };

  const mockResponse = {
    dnsRecords: [
      { timestamp: '2023-01-01T12:34:56.000Z', ip: '1.1.1.1', type: 'A', value: '1.1.1.1' },
    ],
    whois: 'This is a test WHOIS record.',
    whoisDate: '2023-01-01T00:00:00.000Z',
    subdomains: ['sub1.example.com', 'sub2.example.com'],
  };
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => mockResponse,
  });

  render(
    <MemoryRouter>
      <HomePage user={user} onLogout={() => {}} />
    </MemoryRouter>
  );

  const searchInput = screen.getByPlaceholderText(/Enter domain or IP address.../i);

  fireEvent.change(searchInput, { target: { value: 'example.com' } });
  fireEvent.keyDown(searchInput, { key: 'Enter', code: 'Enter' });

  await waitFor(() => {
    expect(screen.getByText('WHOIS Information')).toBeInTheDocument();
    expect(screen.getByText('Subdomains')).toBeInTheDocument();
    expect(screen.getByText('sub1.example.com')).toBeInTheDocument();
    expect(screen.getByText('DNS Records')).toBeInTheDocument();
    expect(screen.getAllByText('1.1.1.1')[0]).toBeInTheDocument();
  });
});

test('fetches and displays IP resolutions on IP search', async () => {
  const user = { name: 'Test User', token: 'test-token' };

  const mockResponse = {
    resolutions: [
      { hostname: 'example.com', last_resolved: '2023-01-01T12:34:56.000Z' },
    ],
  };
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => mockResponse,
  });

  render(
    <MemoryRouter>
      <HomePage user={user} onLogout={() => {}} />
    </MemoryRouter>
  );

  const searchInput = screen.getByPlaceholderText(/Enter domain or IP address.../i);

  fireEvent.change(searchInput, { target: { value: '1.1.1.1' } });
  fireEvent.keyDown(searchInput, { key: 'Enter', code: 'Enter' });

  await waitFor(() => {
    expect(screen.getByText('Resolutions')).toBeInTheDocument();
    expect(screen.getByText('example.com')).toBeInTheDocument();
  });
});
