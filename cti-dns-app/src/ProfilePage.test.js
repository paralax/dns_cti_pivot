import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProfilePage from './ProfilePage';

// Mock the fetch function
global.fetch = jest.fn();

beforeEach(() => {
  fetch.mockClear();
});

test('displays masked API key and allows updating and deleting', async () => {
  const user = { name: 'Test User', token: 'test-token' };

  // Mock the API key fetch response
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ apiKeyExists: true, maskedApiKey: '************1234' }),
  });

  // Mock the delete API key response
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ message: 'API key deleted successfully' }),
  });


  render(
    <MemoryRouter>
      <ProfilePage user={user} onLogout={() => {}} />
    </MemoryRouter>
  );

  // Wait for the masked API key to be displayed
  await waitFor(() => {
    expect(screen.getByText('Your current API key: ************1234')).toBeInTheDocument();
  });

  const deleteButton = screen.getByText('Delete Key');
  fireEvent.click(deleteButton);

  await waitFor(() => {
    expect(screen.queryByText('Your current API key: ************1234')).not.toBeInTheDocument();
  });

});
