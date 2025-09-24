// pages/ProfilePage.js
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchUserProfile, logout } from '../redux/features/auth/authSlice';
import apiClient from '../api/axios';
import Footer from '../components/Footer';
import { UserCircle2 } from 'lucide-react';
import EditProfileModal from '../components/EditProfileModal';
import Toast from '../components/Toast';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token, status } = useSelector((state) => state.auth);
  const [orders, setOrders] = useState([]);
  
  const [isEditProfileOpen, setEditProfileOpen] = useState(false);
  const [isChangePasswordOpen, setChangePasswordOpen] = useState(false);
  const [isAddressesOpen, setAddressesOpen] = useState(false);
  const [isSecurityOpen, setSecurityOpen] = useState(false);
  
  // Toast state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    if (token) {
      dispatch(fetchUserProfile());
    } else {
      navigate('/login');
    }
  }, [token, dispatch, navigate]);

  useEffect(() => {
    const fetchOrders = async () => {
        if(token) {
            try {
                const response = await apiClient.get('/api/orders/history', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setOrders(response.data);
            } catch (error) {
                console.error("Failed to fetch orders:", error);
            }
        }
    };
    fetchOrders();
  }, [token]);


  useEffect(() => {
  }, [user]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast({ show: false, message: '', type: 'success' });
  };

  const handleEditProfileSuccess = (message) => {
    showToast(message, 'success');
    
    setTimeout(() => {
      dispatch(fetchUserProfile());
    }, 500);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'paid':
        return 'bg-blue-100 text-blue-800';
      case 'dispatched':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (status === 'loading' || !user) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <main className="container mx-auto py-12 px-4 flex-grow flex items-center justify-center">
          <div className="text-lg">Loading profile...</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Toast Component - Moved outside main content */}
      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={hideToast} 
        />
      )}
      
      <main className="container mx-auto py-12 px-4 flex-grow">
        <section className="bg-white p-6 rounded-lg shadow-md mb-8 flex items-center space-x-6">
          <UserCircle2 size={64} className="text-gray-400" />
          <div>
            <h1 className="text-2xl font-bold">{user.first_name} {user.last_name}</h1>
            <p className="text-gray-600">{user.email}</p>
            <p className="text-gray-600">{user.primary_phone_no}</p>
            {user.secondary_phone_no && (
              <p className="text-gray-600">Secondary: {user.secondary_phone_no}</p>
            )}
          </div>
        </section>

        <section className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-bold mb-4">Order History</h2>
          <div className="space-y-4">
            {orders.length > 0 ? orders.map(order => (
              <div key={order.id} className="flex justify-between items-center border-b pb-2">
                <p>Order #{order.id.slice(0, 6)}...</p>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${getStatusColor(order.status)}`}>
                    {order.status}
                </span>
              </div>
            )) : <p>You have no past orders.</p>}
          </div>
        </section>

        <section className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-bold mb-4">Account Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              onClick={() => setEditProfileOpen(true)} 
              className="text-left text-gray-700 hover:text-[#C9A35D] transition-colors p-3 rounded-lg hover:bg-gray-50"
            >
              Edit Profile
            </button>
            <button 
              onClick={() => setChangePasswordOpen(true)} 
              className="text-left text-gray-700 hover:text-[#C9A35D] transition-colors p-3 rounded-lg hover:bg-gray-50"
            >
              Change Password
            </button>
            <button 
              onClick={() => setAddressesOpen(true)} 
              className="text-left text-gray-700 hover:text-[#C9A35D] transition-colors p-3 rounded-lg hover:bg-gray-50"
            >
              Saved Addresses
            </button>
            <button 
              onClick={() => setSecurityOpen(true)} 
              className="text-left text-gray-700 hover:text-[#C9A35D] transition-colors p-3 rounded-lg hover:bg-gray-50"
            >
              Security Questions
            </button>
          </div>
        </section>

        <div className="text-center">
          <button
            onClick={handleLogout}
            className="bg-[#C9A35D] text-black font-bold py-3 px-12 rounded-md hover:opacity-90 transition-opacity"
          >
            Log Out
          </button>
        </div>
      </main>
      <Footer />

      {/* Edit Profile Modal */}
      <EditProfileModal 
        isOpen={isEditProfileOpen}
        onClose={() => setEditProfileOpen(false)}
        onSuccess={handleEditProfileSuccess}
      />

      {/* Change Password Modal */}
      {isChangePasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={() => setChangePasswordOpen(false)}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-semibold border-b pb-3 mb-4">Change Password</h3>
            <div className="mt-4">
              <p>Change password form will go here.</p>
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setChangePasswordOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button className="flex-1 px-4 py-2 bg-[#C9A35D] text-black font-bold rounded-lg hover:opacity-90">
                  Update Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;