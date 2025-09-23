import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/admin/Sidebar';
import Header from '../components/Header';
import Footer from '../components/Footer';

const AdminLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1 bg-[#000000] relative z-10">
        <Sidebar />
        <main className="flex-1 bg-gray-100 p-8">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default AdminLayout;