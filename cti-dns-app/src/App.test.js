import { render, screen } from '@testing-library/react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';

test('renders CTI DNS Investigator heading', () => {
  render(
    <GoogleOAuthProvider clientId="test">
      <App />
    </GoogleOAuthProvider>
  );
  const headingElement = screen.getByText(/CTI DNS Investigator/i);
  expect(headingElement).toBeInTheDocument();
});
