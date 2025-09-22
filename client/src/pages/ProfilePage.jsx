import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchUserProfile, logout } from '../redux/features/auth/authSlice';
import apiClient from '../api/axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Modal from '../components/Modal';
import { UserCircle2 } from 'lucide-react';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token, status } = useSelector((state) => state.auth);
  const [orders, setOrders] = useState([]);
  
  // State for modals
  const [isEditProfileOpen, setEditProfileOpen] = useState(false);
  const [isChangePasswordOpen, setChangePasswordOpen] = useState(false);
  const [isAddressesOpen, setAddressesOpen] = useState(false);
  const [isSecurityOpen, setSecurityOpen] = useState(false);

  useEffect(() => {
    if (token) {
      dispatch(fetchUserProfile());
    } else {
      navigate('/login'); // Redirect to login if no token
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

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  if (status === 'loading' || !user) {
    return <div>Loading profile...</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      <main className="container mx-auto py-12 px-4">
        {/* User Info Card */}
        <section className="bg-white p-6 rounded-lg shadow-md mb-8 flex items-center space-x-6">
          <UserCircle2 size={64} className="text-gray-400" />
          <div>
            <h1 className="text-2xl font-bold">{user.first_name} {user.last_name}</h1>
            <p className="text-gray-600">{user.email}</p>
            <p className="text-gray-600">{user.primary_phone_no}</p>
          </div>
        </section>

        {/* Order History */}
        <section className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-bold mb-4">Order History</h2>
          <div className="space-y-4">
            {orders.length > 0 ? orders.map(order => (
              <div key={order.id} className="flex justify-between items-center border-b pb-2">
                <p>Order #{order.id.slice(0, 6)}...</p>
                <span className={`px-2 py-1 text-sm rounded-full ${
                    order.status === 'delivered' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'
                }`}>{order.status}</span>
              </div>
            )) : <p>You have no past orders.</p>}
          </div>
        </section>

        {/* Account Settings */}
        <section className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-bold mb-4">Account Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button onClick={() => setEditProfileOpen(true)} className="text-left text-gray-700 hover:text-[#C9A35D]">Edit Profile</button>
            <button onClick={() => setChangePasswordOpen(true)} className="text-left text-gray-700 hover:text-[#C9A35D]">Change Password</button>
            <button onClick={() => setAddressesOpen(true)} className="text-left text-gray-700 hover:text-[#C9A35D]">Saved Addresses</button>
            <button onClick={() => setSecurityOpen(true)} className="text-left text-gray-700 hover:text-[#C9A35D]">Security Questions</button>
          </div>
        </section>

        <div className="text-center">
          <button
            onClick={handleLogout}
            className="bg-[#C9A35D] text-black font-bold py-3 px-12 rounded-md hover:opacity-90"
          >
            Log Out
          </button>
        </div>
      </main>
      <Footer />

      {/* Modals */}
      <Modal isOpen={isEditProfileOpen} onClose={() => setEditProfileOpen(false)} title="Edit Profile">
        <p>Edit profile form will go here.</p>
      </Modal>
      <Modal isOpen={isChangePasswordOpen} onClose={() => setChangePasswordOpen(false)} title="Change Password">
        <p>Change password form will go here.</p>
      </Modal>
      <Modal isOpen={isAddressesOpen} onClose={() => setAddressesOpen(false)} title="Saved Addresses">
        <p>Address management will go here.</p>
      </Modal>
      <Modal isOpen={isSecurityOpen} onClose={() => setSecurityOpen(false)} title="Security Questions">
        <p>Security questions form will go here.</p>
      </Modal>
    </div>
  );
};

export default ProfilePage;