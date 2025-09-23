import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import DashboardPage from '../../../src/pages/admin/DashboardPage';
import apiClient from '../../../src/api/axios';
import authReducer from '../../../src/redux/features/auth/authSlice';

jest.mock('../../../src/api/axios');

const mockStore = configureStore({
  reducer: { auth: authReducer },
  preloadedState: {
    auth: { token: 'fake-admin-token', user: { role: 'admin' } }
  }
});

describe('DashboardPage', () => {
  test('displays loading state and then renders stats and orders', async () => {
    const mockDashboardData = {
      total_sales: 120000,
      orders_today: 45,
      active_customers: 310,
      top_product: 'Makeup Kit',
      recent_orders: [{ id: '12345', customer_name: 'Jane Doe', status: 'delivered', total: 3500 }],
    };
    apiClient.get.mockResolvedValue({ data: mockDashboardData });

    render(
      <Provider store={mockStore}>
        <DashboardPage />
      </Provider>
    );

    expect(screen.getByText('Loading Dashboard...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Total Sales')).toBeInTheDocument();
      expect(screen.getByText('Ksh 120,000')).toBeInTheDocument();
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });
  });
});