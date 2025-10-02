import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  ListOrdered,
  Users,
  BarChart,
  Settings,
  FileText
} from 'lucide-react';

const Sidebar = () => {
  const navLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: ShoppingBag },
    { name: 'Orders', path: '/admin/orders', icon: ListOrdered },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Analytics', path: '/admin/analytics', icon: BarChart },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
    { name: 'Reports', path: '/admin/reports', icon: FileText },
  ];

  const linkClasses =
    "flex items-center p-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-[#C9A35D] transition-colors";
  const activeLinkClasses = "bg-gray-800 text-[#C9A35D]";

  return (
    <aside className="w-64 bg-[#000000] text-white flex flex-col p-4 h-full relative z-10">
      <div className="flex-1 flex flex-col relative z-10">
        <h2 className="text-xl font-bold mb-6 text-[#C9A35D]">Admin Panel</h2>
        <nav className="flex flex-col space-y-2 flex-1 relative z-20">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `${linkClasses} ${isActive ? activeLinkClasses : ''}`
              }
            >
              <link.icon className="mr-3 h-5 w-5" />
              <span>{link.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;