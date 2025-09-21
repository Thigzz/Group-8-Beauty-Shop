import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Header from '../../src/components/Header';

describe('Header Component', () => {
  test('renders the PAMBO logo', () => {
    render(
      <Router>
        <Header />
      </Router>
    );
    const logoElement = screen.getByTestId('pambo-logo');
    expect(logoElement).toBeInTheDocument();
    expect(logoElement.textContent).toBe('PAMBO');
  });
});