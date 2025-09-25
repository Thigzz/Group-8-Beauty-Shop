import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ChangePasswordModal from '../../../src/components/admin/ChangePasswordModal';
import authReducer from '../../../src/redux/features/auth/authSlice';

const mockChangePassword = jest.fn();

jest.mock('../../../src/redux/features/auth/authSlice', () => ({
    __esModule: true,
    ...jest.requireActual('../../../src/redux/features/auth/authSlice'),
    changePassword: (payload) => {
        mockChangePassword(payload);
        return { type: 'auth/changePassword/fulfilled', payload };
    }
}));

const store = configureStore({
  reducer: { auth: authReducer },
  preloadedState: {
      auth: { status: 'idle', error: null }
  }
});

describe('ChangePasswordModal', () => {
  beforeEach(() => {
    mockChangePassword.mockClear();
    render(
      <Provider store={store}>
        <ChangePasswordModal onClose={() => {}} />
      </Provider>
    );
  });

  test('renders all password fields', () => {
    expect(screen.getByLabelText(/^Current Password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^New Password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Confirm New Password$/i)).toBeInTheDocument();
  });

  test('password visibility can be toggled', () => {
    const newPasswordInput = screen.getByLabelText(/^New Password$/i);
    expect(newPasswordInput).toHaveAttribute('type', 'password');

    const toggleButton = newPasswordInput.nextSibling;
    fireEvent.click(toggleButton);

    expect(newPasswordInput).toHaveAttribute('type', 'text');
  });

  test('shows validation error if passwords do not match', async () => {
    fireEvent.change(screen.getByLabelText(/^New Password$/i), { target: { value: 'newpassword123' } });
    fireEvent.change(screen.getByLabelText(/Confirm New Password/i), { target: { value: 'mismatch' } });
    fireEvent.click(screen.getByRole('button', { name: /Update Password/i }));

    await waitFor(() => {
      expect(screen.getByText('Passwords must match')).toBeInTheDocument();
    });
  });
});