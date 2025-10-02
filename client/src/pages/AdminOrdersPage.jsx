import { useState, useEffect, useMemo } from "react";
import { Eye, Search, Filter,ChevronLeft, ChevronRight  } from "lucide-react";
import apiClient from "../api/axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import debounce from "lodash.debounce"; 
import { ORDER_STATUS } from "../redux/features/orders/orderSlice";


export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    has_next: false,
    has_prev: false,
    total_pages: 1
  });
  const navigate = useNavigate();


  const { token } = useSelector((state) => state.auth);

  // Fetch orders
    const fetchOrders = async (page = 1, search = searchTerm, status = statusFilter, date = dateFilter) => {
      try {
        setLoading(true);
        const backendStatus = status === "all" ? "" : status;

        const res = await apiClient.get(`api/orders/?page=${page}&sort=desc&search=${search}&status=${backendStatus}&date=${date}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data && res.data.orders) {
        setOrders(res.data.orders);
        setPagination({
          page: page,
          has_next: res.data.has_next || false,
          has_prev: res.data.has_prev || false,
          total_pages: res.data.total_pages || 1
        });
      } else {
        setMessage(" Invalid response format from server");
        setOrders([]);
      }
      } catch (err) {
        console.error("Failed to fetch orders", err);
      if (err.response) {
        console.error("Response status:", err.response.status);
        console.error("Response data:", err.response.data);
        
        if (err.response.status === 401) {
          setMessage("Unauthorized - Please check your authentication");
        } else if (err.response.status === 404) {
          setMessage("Orders endpoint not found - Check API URL");
        } else if (err.response.status === 500) {
          setMessage("Server error - Please try again later");
        } else {
          setMessage(`Could not load orders (${err.response.status})`);
        }
      } else if (err.request) {
        setMessage("Network error - Could not connect to server");
      } else {
        setMessage("Could not load orders");
      }
      setOrders([]);
      } finally {
        setLoading(false);
      }
    };

const debouncedSearch = useMemo(
  () =>
    debounce((term, status, date) => {
      fetchOrders(1, term, status, date);
    }, 500),
  [token]
);

useEffect(() => {
  if (token) {
    debouncedSearch(searchTerm, statusFilter, dateFilter);
  } 

  return () => {
    debouncedSearch.cancel(); 
  };
}, [searchTerm, statusFilter, dateFilter, token, debouncedSearch]);

  const handleNextPage = () => {
    if (pagination.has_next) {
      fetchOrders(pagination.page + 1, searchTerm, statusFilter, dateFilter);
    }
  };

  const handlePrevPage = () => {
    if (pagination.has_prev) {
      fetchOrders(pagination.page - 1, searchTerm, statusFilter, dateFilter);
    }
  };

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
      setMessage(" Failed to update status");
    }
  };


  const handleViewUpdate = (orderId) => {
    navigate(`/admin/orders/${orderId}`);
  };

  // Get status 
  const getStatusBadgeStyle = (status) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-medium";
    switch (status?.toLowerCase()) {
      case "pending":
        return `${baseClasses} bg-yellow-100 text-yellow-800 border border-yellow-200`;
      case "paid":
        return `${baseClasses} bg-blue-100 text-blue-800 border border-blue-200`;
      case "dispatched":
        return `${baseClasses} bg-purple-100 text-purple-800 border border-purple-200`;
      case "delivered":
        return `${baseClasses} bg-green-100 text-green-800 border border-green-200`;
      case "cancelled":
        return `${baseClasses} bg-red-100 text-red-800 border border-red-200`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800 border border-gray-200`;
    }
  };

  const formatStatus = (status) => {
    if (!status) return "Unknown";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatId = (id) => {
    if (!id) return "N/A";
    return `${id.substring(0, 8)}...`;
  };

  // Get customer name
  const getCustomerName = (order) => {
    if (!order.customer) return "Unknown Customer";
    return `${order.customer.first_name || ''} ${order.customer.last_name || ''}`.trim() || "Unknown Customer";
  };

   // Get customer phone
  const getCustomerPhone = (order) => {
    return order.customer?.primary_phone_no || "N/A";
  };


  if (loading) return <div className="p-6">Loading orders...</div>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">Orders Management</h1>

        {message && (
          <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded-lg">
            {message}
          </div>
        )}
   {/* Search and Filter Section */}
        <div className="mb-6 bg-white p-4 rounded-2xl shadow">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search by Order ID or Name */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by Order ID, Cart ID, Name or Phone"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent "
              />
            </div>
      {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">All Statuses</option>
                {Object.values(ORDER_STATUS).map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
       {/* Date Filter */}
            <div>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
              />
            </div>
         {/* Clear Filters */}
            <div>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setDateFilter("");
                }}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

                {/* Orders Table */}
        <div className="overflow-x-auto bg-white rounded-2xl shadow">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-4 text-sm font-medium text-gray-600">Order ID</th>
                <th className="p-4 text-sm font-medium text-gray-600">Cart ID</th>
                <th className="p-4 text-sm font-medium text-gray-600">Customer Name</th>
                <th className="p-4 text-sm font-medium text-gray-600">Phone Number</th>
                <th className="p-4 text-sm font-medium text-gray-600">Status</th>
                <th className="p-4 text-sm font-medium text-gray-600">Total</th>
                <th className="p-4 text-sm font-medium text-gray-600">Date</th>
                <th className="p-4 text-sm font-medium text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-gray-700 font-medium">{formatId(order.id)}</td>
                  <td className="p-4 text-gray-500 text-sm">{formatId(order.cart_id)}</td>
                  <td className="p-4 text-gray-700 font-medium">{getCustomerName(order)}</td>
                  <td className="p-4 text-gray-500 text-sm">{getCustomerPhone(order)}</td>
                  <td className="p-4">
                    <span className={getStatusBadgeStyle(order.status)}>
                      {formatStatus(order.status)}
                    </span>
                  </td>
                  <td className="p-4 font-semibold">KES {order.total_amount?.toFixed(2)}</td>
                  <td className="p-4 text-gray-500 text-sm">
                    {order.created_at ? new Date(order.created_at).toLocaleDateString() : "N/A"}
                  </td>
                    <td className="p-4">
                    <button
                    onClick={() => {
                        navigate(`/admin/orders/${order.id}`);
                      }}
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg 
            bg-gradient-to-r from-[#C9A35D] to-[#b18e4e] 
            text-white hover:from-[#b18e4e] hover:to-[#9c7b43] 
            transition-all shadow-md min-w-[120px]"

                    >
                      <Eye size={16} /> 
                      <span className="text-sm font-medium">View/Update</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

            {orders.length === 0 && !loading && (
            <div className="p-8 text-center text-gray-500">
              {orders.length === 0 ? "No orders found" : "No orders matching your search criteria"}
            </div>
          )}
        </div>

          {/* Pagination */}
        {orders.length > 0 && (
          <div className="mt-6 flex items-center justify-between bg-white p-4 rounded-2xl shadow">
            <div className="text-sm text-gray-700">
              Page {pagination.page} 
              {pagination.total_pages > 1 && ` of ${pagination.total_pages}`}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrevPage}
                disabled={!pagination.has_prev}
                className={`flex items-center px-3 py-2 rounded-lg border ${
                  pagination.has_prev
                    ? "border-gray-300 text-gray-700 hover:bg-gray-50"
                    : "border-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                <ChevronLeft size={16} />
                <span className="ml-1">Previous</span>
              </button>

              <button
                onClick={handleNextPage}
                disabled={!pagination.has_next}
                className={`flex items-center px-3 py-2 rounded-lg border ${
                  pagination.has_next
                    ? "border-gray-300 text-gray-700 hover:bg-gray-50"
                    : "border-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                <span className="mr-1">Next</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
