import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import apiClient from "../../api/axios";

const StatCard = ({ title, value, isCurrency = false }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
    <p className="text-3xl font-bold mt-2">
      {isCurrency ? `Ksh ${Number(value).toLocaleString()}` : value}
    </p>
  </div>
);

const AnalyticsPage = () => {
  const { token } = useSelector((state) => state.auth);

  const [dashboard, setDashboard] = useState(null);
  const [financial, setFinancial] = useState(null);
  const [sales, setSales] = useState(null);
  const [products, setProducts] = useState(null);
  const [customers, setCustomers] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        const [d, f, s, p, c] = await Promise.all([
          apiClient.get("/api/analytics/dashboard", { headers }),
          apiClient.get("/api/analytics/financial", { headers }),
          apiClient.get("/api/analytics/sales?days=30", { headers }),
          apiClient.get("/api/analytics/products?limit=5", { headers }),
          apiClient.get("/api/analytics/customers?days=30", { headers }),
        ]);

        setDashboard(d.data);
        setFinancial(f.data);
        setSales(s.data);
        setProducts(p.data);
        setCustomers(c.data);
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchAnalytics();
  }, [token]);

  if (loading) return <div>Loading Analytics...</div>;

  return (
    <div className="space-y-10">
      <h1 className="text-3xl font-bold">Analytics</h1>

      {/* ===== Dashboard Overview ===== */}
      {dashboard && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Dashboard Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatCard title="Total Sales" value={dashboard.total_sales} isCurrency />
            <StatCard title="Orders Today" value={dashboard.orders_today} />
            <StatCard title="Active Customers" value={dashboard.active_customers} />
            <StatCard title="Top Product" value={dashboard.top_product} />
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-3">Recent Orders</h3>
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
                {dashboard.recent_orders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">#{order.id.slice(0, 6)}...</td>
                    <td className="p-2">{order.customer_name}</td>
                    <td className="p-2 capitalize">{order.status}</td>
                    <td className="p-2 text-right">
                      Ksh {Number(order.total).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===== Financial Analytics ===== */}
      {financial && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Financial Analytics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {financial.payment_status_breakdown.map((item, idx) => (
              <StatCard
                key={idx}
                title={`Status: ${item.status}`}
                value={item.total_amount}
                isCurrency
              />
            ))}
          </div>
          <p className="mt-4 text-sm text-gray-600">
            Outstanding Invoices: Ksh {Number(financial.outstanding_invoices_amount).toLocaleString()}
          </p>
        </div>
      )}

      {/* ===== Sales Analytics ===== */}
      {sales && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Sales Analytics (Last {sales.period_days} Days)</h2>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="p-2">Date</th>
                <th className="p-2">Orders</th>
                <th className="p-2">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {sales.daily_sales.map((day, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="p-2">{day.date}</td>
                  <td className="p-2">{day.order_count}</td>
                  <td className="p-2">Ksh {Number(day.revenue).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ===== Product Analytics ===== */}
      {products && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Top Products</h2>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="p-2">Product</th>
                <th className="p-2">Units Sold</th>
                <th className="p-2">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {products.best_sellers_by_quantity.map((prod, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="p-2">{prod.product_name}</td>
                  <td className="p-2">{prod.total_quantity}</td>
                  <td className="p-2">Ksh {Number(prod.total_revenue).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ===== Customer Analytics ===== */}
      {customers && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Customer Analytics</h2>
          <p className="mb-2">New Customers: {customers.new_customers}</p>
          <p className="mb-4">Active Customers: {customers.active_customers}</p>

          <h3 className="text-lg font-semibold mb-2">Top Customers</h3>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="p-2">Name</th>
                <th className="p-2">Email</th>
                <th className="p-2">Orders</th>
                <th className="p-2">Spent</th>
              </tr>
            </thead>
            <tbody>
              {customers.top_customers.map((cust, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="p-2">{cust.name}</td>
                  <td className="p-2">{cust.email}</td>
                  <td className="p-2">{cust.order_count}</td>
                  <td className="p-2">Ksh {Number(cust.total_spent).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;
