import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomePage from './HomePage';

// Mock the fetch function
global.fetch = jest.fn();

beforeEach(() => {
  fetch.mockClear();
});

test('fetches and displays DNS records on search', async () => {
  const user = { name: 'Test User', token: 'test-token' };

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
    <MemoryRouter>
      <HomePage user={user} onLogout={() => {}} />
    </MemoryRouter>
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
