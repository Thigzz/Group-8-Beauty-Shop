import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import SettingsPage from '../../../src/pages/admin/SettingsPage';
import authReducer from '../../../src/redux/features/auth/authSlice';

const mockUser = {
  first_name: 'Admin',
  last_name: 'User',
  email: 'admin@example.com',
  role: 'admin',
};

// Mock the actions
const mockUpdateUserProfile = jest.fn();
const mockChangePassword = jest.fn();

jest.mock('../../../src/redux/features/auth/authSlice', () => ({
    __esModule: true,
    ...jest.requireActual('../../../src/redux/features/auth/authSlice'),
    updateUserProfile: (payload) => {
        mockUpdateUserProfile(payload);
        return { type: 'auth/updateUserProfile/fulfilled', payload };
    },
    changePassword: (payload) => {
        mockChangePassword(payload)
        return { type: 'auth/changePassword/fulfilled', payload };
    },
}));

const mockStore = configureStore({
  reducer: { auth: authReducer },
  preloadedState: {
    auth: { user: mockUser, token: 'fake-token', isAuthenticated: true, status: 'succeeded' }
  }
});

describe('SettingsPage', () => {
  beforeEach(() => {
    mockUpdateUserProfile.mockClear();
    mockChangePassword.mockClear();
    render(
      <Provider store={mockStore}>
        <SettingsPage />
      </Provider>
    );
  });

  test('renders profile and password forms', () => {
    expect(screen.getByText('Update Profile Information')).toBeInTheDocument();
    expect(screen.getByText('Change Password')).toBeInTheDocument();
  });

  test('profile form is pre-populated with user data', () => {
    expect(screen.getByLabelText(/First Name/i)).toHaveValue('Admin');
    expect(screen.getByLabelText(/Email/i)).toHaveValue('admin@example.com');
  });

  test('submits profile update form with correct data', async () => {
    fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'NewAdmin' } });
    fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));

    await waitFor(() => {
        expect(mockUpdateUserProfile).toHaveBeenCalledWith({
            first_name: 'NewAdmin',
            last_name: 'User',
            email: 'admin@example.com',
        });
    });
  });
});