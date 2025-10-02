import { useState, useEffect } from "react";
import { Eye, Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchAdminUsers } from "../../redux/features/admin/adminSlice";

export default function AdminUsers() {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [page, setPage] = useState(1);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const {
        users,
        loading,
        userCurrentPage,
        userTotalPages,
        totalUsers,
        error,
    } = useSelector((state) => state.admin);

    useEffect(() => {
        const handler = setTimeout(() => {
            // Pass the status filter to the dispatch
            dispatch(fetchAdminUsers({ page, search: searchTerm, status: statusFilter }));
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [dispatch, page, searchTerm, statusFilter]); // Add statusFilter to dependency array

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setPage(1);
    };

    const handleStatusChange = (e) => {
        setStatusFilter(e.target.value);
        setPage(1); // Reset to page 1 when filter changes
    };

    const handleNextPage = () => {
        if (userCurrentPage < userTotalPages) {
            setPage(userCurrentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (userCurrentPage > 1) {
            setPage(userCurrentPage - 1);
        }
    };

    const getStatusBadgeStyle = (isActive) => {
        const baseClasses = "px-3 py-1 rounded-full text-xs font-medium";
        return isActive
            ? `${baseClasses} bg-green-100 text-green-800 border border-green-200`
            : `${baseClasses} bg-red-100 text-red-800 border border-red-200`;
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <main className="flex-1 p-6">
                <h1 className="text-2xl font-bold mb-6">User Management</h1>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                        {`❌ ${error}`}
                    </div>
                )}

                <div className="mb-6 bg-white p-4 rounded-2xl shadow">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative md:col-span-2">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search by Name, Username or Email"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                            />
                        </div>
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <select
                                value={statusFilter}
                                onChange={handleStatusChange} // Use the new handler
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent appearance-none bg-white"
                            >
                                <option value="all">All Statuses</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto bg-white rounded-2xl shadow">
                    {loading && users.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">Loading users...</div>
                    ) : (
                        <table className="w-full border-collapse">
                            <thead className="bg-gray-100 text-left">
                                <tr>
                                    <th className="p-4 text-sm font-medium text-gray-600">Name</th>
                                    <th className="p-4 text-sm font-medium text-gray-600">Email</th>
                                    <th className="p-4 text-sm font-medium text-gray-600">Role</th>
                                    <th className="p-4 text-sm font-medium text-gray-600">Status</th>
                                    <th className="p-4 text-sm font-medium text-gray-600">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* We no longer need to use filteredUsers, just map over users directly */}
                                {users.map((user) => (
                                    <tr key={user.id} className="border-t hover:bg-gray-50 transition-colors">
                                        <td className="p-4 text-gray-700 font-medium">{`${user.first_name || ''} ${user.last_name || ''}`.trim()}</td>
                                        <td className="p-4 text-gray-500 text-sm">{user.email}</td>
                                        <td className="p-4 text-gray-500 text-sm">{user.role}</td>
                                        <td className="p-4">
                                            <span className={getStatusBadgeStyle(user.is_active)}>
                                                {user.is_active ? "Active" : "Inactive"}
                                            </span>
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
                    )}
                    {!loading && users.length === 0 && (
                        <div className="p-8 text-center text-gray-500">
                            No users matching your criteria.
                        </div>
                    )}
                </div>

                {users.length > 0 && userTotalPages > 1 && (
                    <div className="mt-6 flex items-center justify-between bg-white p-4 rounded-2xl shadow">
                        <div className="text-sm text-gray-700">
                            Page {userCurrentPage} of {userTotalPages} ({totalUsers} users)
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={handlePrevPage}
                                disabled={userCurrentPage <= 1 || loading}
                                className={`flex items-center px-3 py-2 rounded-lg border ${
                                    userCurrentPage > 1 ? "border-gray-300 text-gray-700 hover:bg-gray-50" : "border-gray-200 text-gray-400 cursor-not-allowed"
                                }`}
                            >
                                <ChevronLeft size={16} />
                                <span className="ml-1">Previous</span>
                            </button>
                            <button
                                onClick={handleNextPage}
                                disabled={userCurrentPage >= userTotalPages || loading}
                                className={`flex items-center px-3 py-2 rounded-lg border ${
                                    userCurrentPage < userTotalPages ? "border-gray-300 text-gray-700 hover:bg-gray-50" : "border-gray-200 text-gray-400 cursor-not-allowed"
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