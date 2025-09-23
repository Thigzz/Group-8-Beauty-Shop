import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import AdminLayout from '../../src/layouts/AdminLayout';
jest.mock('../../src/components/Header', () => () => <div>Header Mock</div>);
jest.mock('../../src/components/Footer', () => () => <div>Footer Mock</div>);
jest.mock('../../src/components/admin/Sidebar', () => () => <div>Sidebar Mock</div>);

describe('AdminLayout', () => {
  test('renders header, sidebar, footer, and outlet content', () => {
    const TestContent = () => <div>Main Content Area</div>;

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<TestContent />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Header Mock')).toBeInTheDocument();
    expect(screen.getByText('Sidebar Mock')).toBeInTheDocument();
    expect(screen.getByText('Footer Mock')).toBeInTheDocument();
    expect(screen.getByText('Main Content Area')).toBeInTheDocument();
  });
});