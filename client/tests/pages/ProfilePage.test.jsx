import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ProfilePage from '../../src/pages/ProfilePage';
import authReducer from '../../src/redux/features/auth/authSlice';
import apiClient from '../../src/api/axios';

jest.mock('../../src/api/axios');

const mockUser = {
  first_name: 'John',
  last_name: 'Doe',
  email: 'john.doe@example.com',
  primary_phone_no: '123-456-7890',
  role: 'customer',
};

const mockStore = configureStore({
  reducer: { auth: authReducer },
  preloadedState: {
    auth: { user: mockUser, token: 'fake-token', isAuthenticated: true, status: 'succeeded' }
  }
});

describe('ProfilePage', () => {
  beforeEach(async () => {
    apiClient.get.mockResolvedValue({ data: mockUser });
    render(
      <Provider store={mockStore}>
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>
      </Provider>
    );
    await screen.findByText('John Doe');
  });

  test('renders user profile information', () => {
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
  });

  test('opens the edit profile modal when button is clicked', async () => {
    fireEvent.click(screen.getByText('Edit Profile'));
    expect(await screen.findByText('Edit profile form will go here.')).toBeInTheDocument();
  });
});