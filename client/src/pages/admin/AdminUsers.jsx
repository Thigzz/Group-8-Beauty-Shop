import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import apiClient from "../../api/axios";

const AdminUsers = () => {
  const { token } = useSelector((state) => state.auth);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [action, setAction] = useState(null); // "activate" | "deactivate"
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await apiClient.get("/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data);
      } catch (err) {
        console.error("Failed to fetch users", err);
      }
    };
    if (token) fetchUsers();
  }, [token]);

  // Confirm modal open
  const handleActionClick = (user, type) => {
    setSelectedUser(user);
    setAction(type);
  };

  // Perform activate/deactivate
  const confirmAction = async () => {
    if (!selectedUser || !action) return;

    try {
      const endpoint =
        action === "activate"
          ? `/api/users/${selectedUser.id}/activate`
          : `/api/users/${selectedUser.id}/deactivate`;

      await apiClient.patch(
        endpoint,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id
            ? { ...u, is_active: action === "activate" }
            : u
        )
      );

      setSuccessMsg(
        `User ${selectedUser.name} has been ${
          action === "activate" ? "activated" : "deactivated"
        } successfully`
      );
      setErrorMsg("");
    } catch (err) {
      console.error("Action failed", err);
      setErrorMsg("Failed to update user status.");
    } finally {
      setSelectedUser(null);
      setAction(null);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Account Management</h1>

      {/* Success / Error Messages */}
      {successMsg && (
        <div className="bg-green-100 text-green-800 px-4 py-2 rounded mb-4">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="bg-red-100 text-red-800 px-4 py-2 rounded mb-4">
          {errorMsg}
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b hover:bg-gray-50">
                <td className="p-3">{user.name}</td>
                <td className="p-3">{user.email}</td>
                <td className="p-3">
                  {user.is_active ? (
                    <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800">
                      Active
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-800">
                      Inactive
                    </span>
                  )}
                </td>
                <td className="p-3">
                  {user.is_active ? (
                    <button
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      onClick={() => handleActionClick(user, "deactivate")}
                    >
                      Deactivate
                    </button>
                  ) : (
                    <button
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                      onClick={() => handleActionClick(user, "activate")}
                    >
                      Activate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Confirmation Modal */}
      {selectedUser && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <h2
              className={`text-lg font-bold mb-2 ${
                action === "activate" ? "text-green-600" : "text-red-600"
              }`}
            >
              {action === "activate" ? "Activate User" : "Deactivate User"}
            </h2>
            <p className="mb-4">
              User: <strong>{selectedUser.name}</strong> <br />
              Email: {selectedUser.email} <br />
              Current Status:{" "}
              {selectedUser.is_active ? "Active" : "Inactive"} <br />
              Are you sure you want to{" "}
              {action === "activate" ? "activate" : "deactivate"} this user?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className={`px-4 py-2 rounded text-white ${
                  action === "activate"
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-red-500 hover:bg-red-600"
                }`}
              >
                {action === "activate" ? "Activate" : "Deactivate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
