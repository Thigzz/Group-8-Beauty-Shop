import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserOrders, fetchUserInvoices } from '../redux/features/dashboard/dashboardSlice';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { orders, invoices, status, error } = useSelector((state) => state.dashboard);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      dispatch(fetchUserOrders());
      dispatch(fetchUserInvoices());
    }
  }, [dispatch, user]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto space-y-8">
          <h2 className="text-2xl font-bold">Welcome, {user?.username}</h2>

          {/* Orders Section */}
          <section className="bg-white shadow rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">My Orders</h3>
            {status === 'loading' ? (
              <p>Loading orders...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : orders.length === 0 ? (
              <p>No orders found.</p>
            ) : (
              <table className="w-full border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="border p-2">Order ID</th>
                    <th className="border p-2">Total Amount</th>
                    <th className="border p-2">Status</th>
                    <th className="border p-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="border p-2">{order.id}</td>
                      <td className="border p-2">Ksh {order.total_amount}</td>
                      <td className="border p-2">{order.status}</td>
                      <td className="border p-2">{new Date(order.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          {/* Invoices Section */}
          <section className="bg-white shadow rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">My Invoices</h3>
            {status === 'loading' ? (
              <p>Loading invoices...</p>
            ) : invoices.length === 0 ? (
              <p>No invoices found.</p>
            ) : (
              <table className="w-full border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="border p-2">Invoice #</th>
                    <th className="border p-2">Order ID</th>
                    <th className="border p-2">Amount</th>
                    <th className="border p-2">Status</th>
                    <th className="border p-2">Paid At</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="border p-2">{invoice.invoice_number}</td>
                      <td className="border p-2">{invoice.order_id}</td>
                      <td className="border p-2">Ksh {invoice.amount}</td>
                      <td className="border p-2">{invoice.payment_status}</td>
                      <td className="border p-2">
                        {invoice.paid_at ? new Date(invoice.paid_at).toLocaleDateString() : 'Not Paid'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
