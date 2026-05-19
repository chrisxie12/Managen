import { render, screen } from '@testing-library/react';
import { SadexLogo } from './SadexLogo';

describe('SadexLogo Component', () => {
  test('renders logo text correctly by default', () => {
    render(<SadexLogo />);
    expect(screen.getByText('SADEX')).toBeInTheDocument();
    expect(screen.getByText('Innovations')).toBeInTheDocument();
  });

  test('renders without text when showText is false', () => {
    render(<SadexLogo showText={false} />);
    expect(screen.queryByText('SADEX')).not.toBeInTheDocument();
  });
});
