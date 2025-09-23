import { useState } from "react";
import { Eye } from "lucide-react";

export default function AdminOrdersPage() {
  // ✅ Temporary sample orders (replace with backend data later)
  const [orders] = useState([
    { id: "ORD123", customer: "Jane Doe", date: "2025-09-15", status: "Pending", total: "KES 3,500" },
    { id: "ORD124", customer: "John Smith", date: "2025-09-14", status: "Shipped", total: "KES 7,200" },
    { id: "ORD125", customer: "Mary Ann", date: "2025-09-13", status: "Delivered", total: "KES 5,800" },
  ]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <h1 className="text-2xl font-bold mb-6">Orders Management</h1>

      {/* Orders Table */}
      <div className="overflow-x-auto bg-white rounded-2xl shadow">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-4 text-sm font-medium text-gray-600">Order ID</th>
              <th className="p-4 text-sm font-medium text-gray-600">Customer</th>
              <th className="p-4 text-sm font-medium text-gray-600">Date</th>
              <th className="p-4 text-sm font-medium text-gray-600">Status</th>
              <th className="p-4 text-sm font-medium text-gray-600">Total</th>
              <th className="p-4 text-sm font-medium text-gray-600">Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, i) => (
              <tr key={order.id} className="border-t">
                <td className="p-4 text-gray-700">{order.id}</td>
                <td className="p-4 text-gray-700">{order.customer}</td>
                <td className="p-4 text-gray-500 text-sm">{order.date}</td>
                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      order.status === "Pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : order.status === "Shipped"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="p-4 font-semibold">{order.total}</td>
                <td className="p-4">
                  <button className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition">
                    <Eye size={18} /> View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
