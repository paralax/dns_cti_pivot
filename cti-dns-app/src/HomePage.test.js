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
  const mockDnsRecords =  [
                {
                    "expire": 1814400,
                    "minimum": 600,
                    "refresh": 3600,
                    "retry": 300,
                    "rname": "hostmaster.foo-inc.com",
                    "serial": 2020061203,
                    "ttl": 1799,
                    "type": "SOA",
                    "value": "ns1.foo.com"
                },
              	{
                    "ttl": 1162,
                    "type": "A",
                    "value": "91.117.116.8"
                },
                {
                    "ttl": 299,
                    "type": "AAAA",
                    "value": "2430:2fb0:f0b1:ca3b::6f"
                },
              	{
                    "priority": 1,
                    "ttl": 1545,
                    "type": "MX",
                    "value": "mta6.am0.foodns.net"
                },
                {
                    "flag": 0,
                    "tag": "issue",
                    "ttl": 1799,
                    "type": "CAA",
                    "value": "globalsign.com"
                }
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
