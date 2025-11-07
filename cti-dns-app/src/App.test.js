import { render, screen } from '@testing-library/react';
import App from './App';

test('renders CTI DNS Investigator heading', () => {
  render(<App />);
  const headingElement = screen.getByText(/CTI DNS Investigator/i);
  expect(headingElement).toBeInTheDocument();
});
