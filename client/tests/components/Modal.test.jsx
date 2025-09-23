import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Modal from '../../src/components/Modal';

describe('Modal Component', () => {
  const handleClose = jest.fn();

  test('does not render when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={handleClose} title="Test Modal">
        <p>Modal Content</p>
      </Modal>
    );
    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
  });

  test('renders correctly when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={handleClose} title="Test Modal">
        <p>Modal Content</p>
      </Modal>
    );
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal Content')).toBeInTheDocument();
  });

  test('calls onClose when the close button is clicked', () => {
    render(
      <Modal isOpen={true} onClose={handleClose} title="Test Modal">
        <p>Modal Content</p>
      </Modal>
    );
    fireEvent.click(screen.getByText('×'));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});