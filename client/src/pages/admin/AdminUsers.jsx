import { useState, useEffect } from "react";
import { Eye, Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import apiClient from "../../api/axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pagination, setPagination] = useState({
    page: 1,
    has_next: false,
    has_prev: false,
    total_pages: 1,
  });
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);

  // Fetch users
  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/admin/users?page=${page}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Check if response is an array
      if (Array.isArray(res.data)) {
        setUsers(res.data);
        setPagination({ page: 1, has_next: false, has_prev: false, total_pages: 1 });
      } else if (res.data && res.data.users) {
         setUsers(res.data.users);
         setPagination({
           page: page,
           has_next: res.data.has_next || false,
           has_prev: res.data.has_prev || false,
           total_pages: res.data.total_pages || 1
         });
      } else {
        setMessage("❌ Invalid response format from server");
        setUsers([]);
      }
    } catch (err) {
      console.error("Failed to fetch users", err);
      setMessage("❌ Could not load users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUsers(1);
    }
  }, [token]);

  const handleNextPage = () => {
    if (pagination.has_next) {
      fetchUsers(pagination.page + 1);
    }
  };

  const handlePrevPage = () => {
    if (pagination.has_prev) {
      fetchUsers(pagination.page - 1);
    }
  };

  // Filter users based on search and filters
  const filteredUsers = users.filter((user) => {
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
    
    const matchesSearch =
      fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const userStatus = user.is_active ? 'active' : 'inactive';
    const matchesStatus = statusFilter === "all" || userStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Get status badge styling
  const getStatusBadgeStyle = (isActive) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-medium";
    if (isActive) {
      return `${baseClasses} bg-green-100 text-green-800 border border-green-200`;
    }
    return `${baseClasses} bg-red-100 text-red-800 border border-red-200`;
  };

  if (loading) return <div className="p-6">Loading users...</div>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">User Management</h1>

        {message && (
          <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded-lg">
            {message}
          </div>
        )}

        {/* Search and Filter Section */}
        <div className="mb-6 bg-white p-4 rounded-2xl shadow">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search by Name or Email */}
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by Name or Email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
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
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto bg-white rounded-2xl shadow">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-4 text-sm font-medium text-gray-600">Name</th>
                <th className="p-4 text-sm font-medium text-gray-600">Email</th>
                <th className="p-4 text-sm font-medium text-gray-600">Role</th>
                <th className="p-4 text-sm font-medium text-gray-600">Status</th>
                <th className="p-4 text-sm font-medium text-gray-600">Joined</th>
                <th className="p-4 text-sm font-medium text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-t hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-gray-700 font-medium">{`${user.first_name || ''} ${user.last_name || ''}`.trim()}</td>
                  <td className="p-4 text-gray-500 text-sm">{user.email}</td>
                  <td className="p-4 text-gray-500 text-sm">{user.is_admin ? 'Admin' : 'Customer'}</td>
                  <td className="p-4">
                    <span className={getStatusBadgeStyle(user.is_active)}>
                      {user.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500 text-sm">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => navigate(`/admin/users/${user.id}`)}
                      className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#C9A35D] to-[#b18e4e] text-white hover:from-[#b18e4e] hover:to-[#9c7b43] transition-all shadow-md min-w-[120px]"
                    >
                      <Eye size={16} />
                      <span className="text-sm font-medium">View/Update</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && !loading && (
            <div className="p-8 text-center text-gray-500">
              {users.length === 0 ? "No users found" : "No users matching your search criteria"}
            </div>
          )}
        </div>

        {/* Pagination */}
        {users.length > 0 && pagination.total_pages > 1 && (
          <div className="mt-6 flex items-center justify-between bg-white p-4 rounded-2xl shadow">
            <div className="text-sm text-gray-700">
              Page {pagination.page} of {pagination.total_pages}
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