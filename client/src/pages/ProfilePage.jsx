import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchUserProfile, logout } from '../redux/features/auth/authSlice';
import { fetchOrders } from '../redux/features/orders/orderSlice';
import Footer from '../components/Footer';
import { UserCircle2 } from 'lucide-react';
import EditProfileModal from '../components/EditProfileModal';
import Toast from '../components/Toast';
import ChangePassword from '../components/ChangePassword';
import SavedAddresses from '../components/SavedAddresses';
import AddressForm from '../components/AddressForm';
import MySecurityQuestions from '../components/MySecurityQuestions';
import OrderDetailsModal from '../components/OrderDetailsModal';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token, status } = useSelector((state) => state.auth);
  const { orderHistory, status: orderStatus } = useSelector((state) => state.orders);
  
  const [isEditProfileOpen, setEditProfileOpen] = useState(false);
  const [isChangePasswordOpen, setChangePasswordOpen] = useState(false);
  const [isAddressesOpen, setAddressesOpen] = useState(false);
  const [isSecurityOpen, setSecurityOpen] = useState(false);
  const [isAddAddressOpen, setAddAddressOpen] = useState(false);
  const [isEditAddressOpen, setEditAddressOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isOrderModalOpen, setOrderModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    if (token) {
      dispatch(fetchUserProfile());
      dispatch(fetchOrders());
    } else {
      navigate('/login');
    }
  }, [token, dispatch, navigate]);

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

  const handleAddressAction = (action, address = null) => {
    if (action === 'add') {
      setAddAddressOpen(true);
      setAddressesOpen(false);
    } else if (action === 'edit' && address) {
      setSelectedAddress(address);
      setEditAddressOpen(true);
      setAddressesOpen(false);
    }
  };

  const handlePasswordChangeSuccess = () => {
    setChangePasswordOpen(false);
    showToast('Password updated successfully!', 'success');
  };

  const handleAddressSuccess = () => {
    setAddAddressOpen(false);
    setEditAddressOpen(false);
    showToast('Address saved successfully!', 'success');
  };

  const handleViewDetails = (orderId) => {
    setSelectedOrderId(orderId);
    setOrderModalOpen(true);
  };

  const handleCloseOrderModal = () => {
    setOrderModalOpen(false);
    setSelectedOrderId(null);
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
                {orderStatus === 'loading' && <p>Loading orders...</p>}
                {orderHistory.length > 0 ? orderHistory.map(order => (
                    <div key={order.id} className="p-4 border rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-gray-50 transition-colors">
                        <div className="flex-1">
                            <p className="font-mono text-sm text-gray-500">ORDER #{order.id.substring(0, 8).toUpperCase()}</p>
                            <p className="text-sm text-gray-600">
                                Placed on {new Date(order.created_at).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="text-left sm:text-right">
                            <p className="font-semibold">Ksh {order.total_amount.toFixed(2)}</p>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${getStatusColor(order.status)}`}>
                                {order.status}
                            </span>
                        </div>
                        <button
                            onClick={() => handleViewDetails(order.id)}
                            className="w-full sm:w-auto mt-2 sm:mt-0 bg-[#C9A35D] text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90"
                        >
                            View Details
                        </button>
                    </div>
                )) : <p>You have no past orders.</p>}
            </div>
        </section>

        <section className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-bold mb-4">Account Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              onClick={() => setEditProfileOpen(true)} 
              className="text-left text-gray-700 hover:text-[#C9A35D] transition-colors p-3 rounded-lg hover:bg-gray-50 border border-gray-200"
            >
              <div className="font-medium">Edit Profile</div>
              <div className="text-sm text-gray-500">Update your personal information</div>
            </button>
            
            <button 
              onClick={() => setChangePasswordOpen(true)} 
              className="text-left text-gray-700 hover:text-[#C9A35D] transition-colors p-3 rounded-lg hover:bg-gray-50 border border-gray-200"
            >
              <div className="font-medium">Change Password</div>
              <div className="text-sm text-gray-500">Update your password</div>
            </button>
            
            <button 
              onClick={() => setAddressesOpen(true)} 
              className="text-left text-gray-700 hover:text-[#C9A35D] transition-colors p-3 rounded-lg hover:bg-gray-50 border border-gray-200"
            >
              <div className="font-medium">Saved Addresses</div>
              <div className="text-sm text-gray-500">Manage your delivery addresses</div>
            </button>
            
            <button 
              onClick={() => setSecurityOpen(true)} 
              className="text-left text-gray-700 hover:text-[#C9A35D] transition-colors p-3 rounded-lg hover:bg-gray-50 border border-gray-200"
            >
              <div className="font-medium">Security Questions</div>
              <div className="text-sm text-gray-500">Add security questions</div>
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

      <EditProfileModal 
        isOpen={isEditProfileOpen}
        onClose={() => setEditProfileOpen(false)}
        onSuccess={handleEditProfileSuccess}
      />

      {isChangePasswordOpen && (
        <Modal 
          isOpen={isChangePasswordOpen}
          onClose={() => setChangePasswordOpen(false)}
          title="Change Password"
        >
          <ChangePassword 
            onSuccess={handlePasswordChangeSuccess}
            onCancel={() => setChangePasswordOpen(false)}
          />
        </Modal>
      )}

      {isAddressesOpen && (
        <Modal 
          isOpen={isAddressesOpen}
          onClose={() => setAddressesOpen(false)}
          title="Saved Addresses"
          size="large"
        >
          <SavedAddresses onAction={handleAddressAction} />
        </Modal>
      )}

      {isAddAddressOpen && (
        <Modal 
          isOpen={isAddAddressOpen}
          onClose={() => setAddAddressOpen(false)}
          title="Add New Address"
          size="large"
        >
          <AddressForm 
            mode="add"
            onSuccess={handleAddressSuccess}
            onCancel={() => setAddAddressOpen(false)}
          />
        </Modal>
      )}

      {isEditAddressOpen && (
        <Modal 
          isOpen={isEditAddressOpen}
          onClose={() => setEditAddressOpen(false)}
          title="Edit Address"
          size="large"
        >
          <AddressForm 
            mode="edit"
            address={selectedAddress}
            onSuccess={handleAddressSuccess}
            onCancel={() => setEditAddressOpen(false)}
          />
        </Modal>
      )}

      {isSecurityOpen && (
        <Modal 
          isOpen={isSecurityOpen}
          onClose={() => setSecurityOpen(false)}
          title="Security Questions"
          size="large"
        >
          <MySecurityQuestions onClose={() => setSecurityOpen(false)} />
        </Modal>
      )}

      {isOrderModalOpen && <OrderDetailsModal orderId={selectedOrderId} onClose={handleCloseOrderModal} />}
    </div>
  );
};

const Modal = ({ isOpen, onClose, title, children, size = 'medium' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    medium: 'max-w-md',
    large: 'max-w-2xl',
    xlarge: 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div 
        className={`bg-white rounded-lg shadow-xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto`} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-semibold">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;