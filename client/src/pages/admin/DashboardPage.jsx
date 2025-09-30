import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import apiClient from '../../api/axios';

const StatCard = ({ title, value, isCurrency = false }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
    <p className="text-3xl font-bold mt-2">
      {isCurrency ? `Ksh ${Number(value).toLocaleString()}` : value}
    </p>
  </div>
);

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await apiClient.get('/api/analytics/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(response.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    if (token) {
      fetchDashboardData();
    }
  }, [token]);


  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'paid':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
      case 'processing':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading || !stats) {
    return <div>Loading Dashboard...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Sales" value={stats.total_sales} isCurrency />
        <StatCard title="Orders Today" value={stats.orders_today} />
        <StatCard title="Active Customers" value={stats.active_customers} />
        <StatCard title="Top Product" value={stats.top_product} />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="p-2">Order ID</th>
              <th className="p-2">Customer</th>
              <th className="p-2">Status</th>
              <th className="p-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {stats.recent_orders.map(order => (
              <tr key={order.id} className="border-b hover:bg-gray-50">
                <td className="p-2">#{order.id.slice(0, 6)}...</td>
                <td className="p-2">{order.customer_name}</td>
                <td className="p-2">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="p-2 text-right">Ksh {Number(order.total).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DashboardPage;