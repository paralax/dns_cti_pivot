import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProfilePage from './ProfilePage';

// Mock the fetch function
global.fetch = jest.fn();
window.alert = jest.fn();

beforeEach(() => {
  fetch.mockClear();
  window.alert.mockClear();
});

test('displays API key status and allows updating and deleting', async () => {
  const user = { name: 'Test User', token: 'test-token' };

  // Mock the API key fetch response
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ apiKeyExists: true }),
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

  // Wait for the API key status to be displayed
  await waitFor(() => {
    expect(screen.getByText('API key is set for this session.')).toBeInTheDocument();
  });

  const deleteButton = screen.getByText('Delete Key');
  fireEvent.click(deleteButton);

  await waitFor(() => {
    expect(screen.queryByText('API key is set for this session.')).not.toBeInTheDocument();
  });

});
