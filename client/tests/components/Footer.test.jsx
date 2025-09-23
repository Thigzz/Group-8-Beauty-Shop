import React from 'react';
import { render, screen } from '@testing-library/react';
import Footer from '../../src/components/Footer';

describe('Footer Component', () => {
  test('renders the copyright text', () => {
    render(<Footer />);
    expect(screen.getByText(/© 2025 Pambo. All rights reserved./i)).toBeInTheDocument();
  });
});