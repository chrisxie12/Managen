import { render, screen } from '@testing-library/react';
import App from './App';

test('renders SchoolOS landing page', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /School operations, billing, and onboarding in one place/i })).toBeInTheDocument();
  expect(screen.getByText(/A lightweight frontend starter for the Supabase-backed SchoolOS API/i)).toBeInTheDocument();
});
