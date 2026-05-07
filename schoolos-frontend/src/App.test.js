import { render, screen } from '@testing-library/react';
import App from './App';

test('renders SchoolOS landing page', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /Run Your Entire School\./i })).toBeInTheDocument();
  expect(screen.getByText(/SchoolOS helps schools run academics, finance, and communication in one operating system\./i)).toBeInTheDocument();
});
