import { useState, useEffect } from "react";
import { Eye } from "lucide-react";
import apiClient from "../api/axios";
import { useSelector } from "react-redux";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // ✅ Get token from Redux
  const { token } = useSelector((state) => state.auth);

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await apiClient.get("/api/orders/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(res.data);
      } catch (err) {
        console.error("Failed to fetch orders", err);
        setMessage("❌ Could not load orders");
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchOrders();
  }, [token]);

  // Update order status
  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const res = await apiClient.put(
        `/api/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(`✅ ${res.data.message}`);

      // Update local state instantly
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status: res.data.status } : o
        )
      );
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to update status");
    }
  };

  if (loading) return <div className="p-6">Loading orders...</div>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* ✅ Global Header */}
      <Header />

      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">Orders Management</h1>

        {message && (
          <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded-lg">
            {message}
          </div>
        )}

        <div className="overflow-x-auto bg-white rounded-2xl shadow">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-4 text-sm font-medium text-gray-600">Order ID</th>
                <th className="p-4 text-sm font-medium text-gray-600">Cart ID</th>
                <th className="p-4 text-sm font-medium text-gray-600">Status</th>
                <th className="p-4 text-sm font-medium text-gray-600">Total</th>
                <th className="p-4 text-sm font-medium text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t">
                  <td className="p-4 text-gray-700">{order.id}</td>
                  <td className="p-4 text-gray-500 text-sm">{order.cart_id}</td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        order.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : order.status === "shipped"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4 font-semibold">KES {order.total_amount}</td>
                  <td className="p-4 flex gap-2">
                    <button className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition">
                      <Eye size={18} /> View
                    </button>

                    {order.status !== "fulfilled" && (
                      <button
                        onClick={() => handleStatusUpdate(order.id, "fulfilled")}
                        className="px-3 py-1 rounded-lg bg-green-600 text-white hover:bg-green-700"
                      >
                        Mark Fulfilled
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* ✅ Global Footer */}
      <Footer />
    </div>
  );
}
