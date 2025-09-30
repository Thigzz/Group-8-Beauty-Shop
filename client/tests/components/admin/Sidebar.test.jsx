import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Sidebar from '../../../src/components/admin/Sidebar';
import authReducer from '../../../src/redux/features/auth/authSlice';


jest.mock('../../../src/redux/features/auth/authSlice', () => ({
    __esModule: true,
    ...jest.requireActual('../../../src/redux/features/auth/authSlice'),
}));

const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
        auth: { user: null, isAuthenticated: false, token: null, status: 'idle', error: null }
    }
});


const LocationDisplay = () => {
    const location = useLocation();
    return <div data-testid="location-display">{location.pathname}</div>;
};


describe('Sidebar', () => {
    const renderWithRouter = (ui, { route = '/' } = {}) => {
        window.history.pushState({}, 'Test page', route);
        return render(
            <Provider store={store}>
                <MemoryRouter initialEntries={[route]}>
                    <Routes>
                        <Route path="/*" element={
                            <>
                                {ui}
                                <LocationDisplay/>
                            </>
                        }/>
                    </Routes>
                </MemoryRouter>
            </Provider>
        );
    };

    test('navigates to the correct routes on link click', () => {
        renderWithRouter(<Sidebar />);

        fireEvent.click(screen.getByText(/Dashboard/i));
        expect(screen.getByTestId('location-display')).toHaveTextContent('/admin/dashboard');

        fireEvent.click(screen.getByText(/Settings/i));
        expect(screen.getByTestId('location-display')).toHaveTextContent('/admin/settings');
    });

    test('calls logout and navigates to home on logout click', () => {
        renderWithRouter(<Sidebar />, { route: '/admin' });
        const logoutButton = screen.getByText(/Log Out/i);
        fireEvent.click(logoutButton);
        expect(screen.getByTestId('location-display')).toHaveTextContent('/');
    });
});