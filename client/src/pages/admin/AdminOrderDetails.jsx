import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  fetchOrderDetails, 
  updateOrderStatus, 
  ORDER_STATUS,
  clearOrder 
} from '../../redux/features/orders/orderSlice';
import ConfirmationModal from '../../components/admin/ConfirmationModal';

const AdminOrderDetails = () => {
  const { orderId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { currentOrder, loading, error, updating } = useSelector(state => state.orders);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [statusChangeNote, setStatusChangeNote] = useState('');

  useEffect(() => {
    if (orderId) {
      dispatch(fetchOrderDetails(orderId));
    }

    return () => {
      dispatch(clearOrder());
    };
  }, [dispatch, orderId]);

  useEffect(() => {
    if (currentOrder) {
      setSelectedStatus(currentOrder.status);
    }
  }, [currentOrder]);

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
  };

  const handleSaveChanges = () => {
    setShowConfirmation(true);
  };

  const confirmStatusUpdate = () => {
    dispatch(updateOrderStatus({ 
      orderId, 
      status: selectedStatus,
      note: statusChangeNote 
    })).then(() => {
      setShowConfirmation(false);
      setStatusChangeNote('');
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      [ORDER_STATUS.PENDING]: 'bg-yellow-100 text-yellow-800',
      [ORDER_STATUS.CONFIRMED]: 'bg-blue-100 text-blue-800',
      [ORDER_STATUS.PROCESSING]: 'bg-indigo-100 text-indigo-800',
      [ORDER_STATUS.SHIPPED]: 'bg-purple-100 text-purple-800',
      [ORDER_STATUS.DELIVERED]: 'bg-green-100 text-green-800',
      [ORDER_STATUS.CANCELLED]: 'bg-red-100 text-red-800',
      [ORDER_STATUS.REFUNDED]: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusOptions = (currentStatus) => {
    const statusFlow = {
      [ORDER_STATUS.PENDING]: [ORDER_STATUS.CONFIRMED, ORDER_STATUS.CANCELLED],
      [ORDER_STATUS.CONFIRMED]: [ORDER_STATUS.PROCESSING, ORDER_STATUS.CANCELLED],
      [ORDER_STATUS.PROCESSING]: [ORDER_STATUS.SHIPPED, ORDER_STATUS.CANCELLED],
      [ORDER_STATUS.SHIPPED]: [ORDER_STATUS.DELIVERED, ORDER_STATUS.REFUNDED],
      [ORDER_STATUS.DELIVERED]: [ORDER_STATUS.REFUNDED],
      [ORDER_STATUS.CANCELLED]: [],
      [ORDER_STATUS.REFUNDED]: [],
    };
    
    return statusFlow[currentStatus] || [];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-4">Error: {error}</div>
          <button 
            onClick={() => navigate('/admin/orders')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  if (!currentOrder) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 text-lg mb-4">Order not found</div>
          <button 
            onClick={() => navigate('/admin/orders')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const availableStatusOptions = getStatusOptions(currentOrder.status);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => navigate('/admin/orders')}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Orders
          </button>
          
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
              <p className="text-gray-600">Order ID: {currentOrder.orderNumber}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentOrder.status)}`}>
              {currentOrder.status.charAt(0).toUpperCase() + currentOrder.status.slice(1)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Order Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Customer Information</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Customer Name</label>
                    <p className="mt-1 text-sm text-gray-900">{currentOrder.customer.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{currentOrder.customer.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <p className="mt-1 text-sm text-gray-900">{currentOrder.customer.phone}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Shipping Address</h2>
              </div>
              <div className="p-6">
                <p className="text-sm text-gray-900">
                  {currentOrder.shippingAddress.street}<br />
                  {currentOrder.shippingAddress.city}, {currentOrder.shippingAddress.state} {currentOrder.shippingAddress.zipCode}<br />
                  {currentOrder.shippingAddress.country}
                </p>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Order Items</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {currentOrder.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center space-x-4">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                          <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                          {item.variant && (
                            <p className="text-sm text-gray-500">Variant: {item.variant}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">${item.price}</p>
                        <p className="text-sm text-gray-500">Total: ${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary & Status Update */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Order Summary</h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">${currentOrder.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-gray-900">${currentOrder.shippingCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span className="text-gray-900">${currentOrder.tax.toFixed(2)}</span>
                  </div>
                  {currentOrder.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Discount</span>
                      <span className="text-green-600">-${currentOrder.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-medium border-t border-gray-200 pt-3">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900">${currentOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Update */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Update Status</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Status
                    </label>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentOrder.status)}`}>
                      {currentOrder.status.charAt(0).toUpperCase() + currentOrder.status.slice(1)}
                    </div>
                  </div>

                  {availableStatusOptions.length > 0 && (
                    <>
                      <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                          Change Status To
                        </label>
                        <select
                          id="status"
                          value={selectedStatus}
                          onChange={handleStatusChange}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value={currentOrder.status}>Keep current status</option>
                          {availableStatusOptions.map(status => (
                            <option key={status} value={status}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="statusNote" className="block text-sm font-medium text-gray-700 mb-2">
                          Status Change Note (Optional)
                        </label>
                        <textarea
                          id="statusNote"
                          rows={3}
                          value={statusChangeNote}
                          onChange={(e) => setStatusChangeNote(e.target.value)}
                          placeholder="Add a note about this status change..."
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <button
                        onClick={handleSaveChanges}
                        disabled={selectedStatus === currentOrder.status || updating}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {updating ? 'Updating...' : 'Update Order Status'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Order Timeline */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Order Timeline</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {currentOrder.timeline?.map((event, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        event.status === currentOrder.status ? 'bg-blue-600' : 'bg-gray-300'
                      }`}></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                        </p>
                        <p className="text-sm text-gray-500">{new Date(event.timestamp).toLocaleString()}</p>
                        {event.note && (
                          <p className="text-sm text-gray-600 mt-1">{event.note}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={confirmStatusUpdate}
        title="Confirm Status Update"
        message={`Are you sure you want to change the order status from "${currentOrder.status}" to "${selectedStatus}"?`}
        confirmText="Update Status"
        loading={updating}
      />
    </div>
  );
};

export default AdminOrderDetails;