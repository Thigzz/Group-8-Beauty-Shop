import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, User, MapPin, Clock, CheckCircle, X } from 'lucide-react';
import { 
  fetchOrderDetails, 
  updateOrderStatus, 
  ORDER_STATUS,
  clearOrder,
  clearUpdateSuccess,
  clearError 
} from '../../redux/features/orders/orderSlice';

export default function AdminOrderDetails() {
  const { orderId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { currentOrder, loading, error, updating, updateSuccess } = useSelector(state => state.orders);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [statusChangeNote, setStatusChangeNote] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchOrder = async () => {
      if (orderId && isMounted) {
        await dispatch(fetchOrderDetails(orderId));
      }
    };

    fetchOrder();

    return () => {
      isMounted = false;
      dispatch(clearOrder());
      dispatch(clearError());
    };
  }, [dispatch, orderId]);

  useEffect(() => {
    if (currentOrder && currentOrder.status) {
      setSelectedStatus(currentOrder.status);
    }
  }, [currentOrder]);

  useEffect(() => {
    if (updateSuccess) {
    setShowConfirmation(false);
    setStatusChangeNote('');

      const timer = setTimeout(() => {
        dispatch(clearUpdateSuccess());
        setStatusChangeNote('');
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [updateSuccess, dispatch]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);

    if (error) {
      dispatch(clearError());
    }
  };

  const handleSaveChanges = () => {
    if (selectedStatus === currentOrder.status || !selectedStatus) {
      return;
    }
    setShowConfirmation(true);
  };

  const confirmStatusUpdate = async () => {
          try {
              await dispatch(
                  updateOrderStatus({
                    orderId,
                    status: selectedStatus,
                    note: statusChangeNote,
                  })
                ).unwrap();
              } catch (err) {
              console.error("Unexpected error:", err);
              dispatch(clearError());
                            }
        };;

  const cancelStatusUpdate = () => {
    setShowConfirmation(false);
    setStatusChangeNote("");
    dispatch(clearError());
  };

  const canChangeStatus = () => {
    if (!currentOrder?.status) return false;
    
    const finalStatuses = [ORDER_STATUS.CANCELLED, ORDER_STATUS.DELIVERED];
    return !finalStatuses.includes(currentOrder.status);
  };

  const getStatusBadgeStyle = (status) => {
    const baseClasses = "px-4 py-2 rounded-full text-sm font-medium inline-block";
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

  const getCustomerName = () => {
    if (!currentOrder?.customer) return "Unknown Customer";
    return `${currentOrder.customer.first_name || ''} ${currentOrder.customer.last_name || ''}`.trim() || "Unknown Customer";
  };

  const getAllStatusOptions = () => {
    return Object.values(ORDER_STATUS);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C9A35D] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error && !currentOrder) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-4"> Error: {error}</div>
          <button
            onClick={() => {
              dispatch(clearError());
              navigate("/admin/orders");
            }}
            className="px-6 py-2 rounded-lg 
            bg-gradient-to-r from-[#C9A35D] to-[#b18e4e] 
            text-white hover:from-[#b18e4e] hover:to-[#9c7b43] 
            transition-colors font-medium"
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
            className="px-6 py-2 rounded-lg 
            bg-gradient-to-r from-[#C9A35D] to-[#b18e4e] 
            text-white hover:from-[#b18e4e] hover:to-[#9c7b43] 
            transition-colors font-medium"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const allStatusOptions = getAllStatusOptions();
  const isStatusChangeAllowed = canChangeStatus();

  return (
    <div
      className={`min-h-screen bg-gray-50 py-8" ${
        showConfirmation ? "overflow-hidden" : ""
      }`}
    >
      <div
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${
          showConfirmation ? "blur-sm" : ""
        }`}
      >
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/admin/orders")}
            className="flex items-center text-[#C9A35D] hover:text-[#b18e4e] mb-4 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Orders
          </button>

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Order Details
              </h1>
              <p className="text-gray-600 mt-1">
                Order ID:{" "}
                <span className="font-mono">
                  {currentOrder.id || currentOrder._id}
                </span>
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Created:{" "}
                {currentOrder.created_at
                  ? new Date(currentOrder.created_at).toLocaleString()
                  : "N/A"}
              </p>
            </div>
            <span className={getStatusBadgeStyle(currentOrder.status)}>
              {formatStatus(currentOrder.status)}
            </span>
          </div>
        </div>

        {/* Error Message */}
        {error && !showConfirmation && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg flex items-center">
            <X className="mr-2" size={20} />
            {error}
          </div>
        )}

        {/* Success Message */}
        {updateSuccess && (
          <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg flex items-center">
            <CheckCircle className="mr-2" size={20} />
            Order status updated successfully!
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Order Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <div className="bg-white shadow rounded-2xl">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center">
                <User className="mr-2 text-[#C9A35D]" size={20} />
                <h2 className="text-lg font-semibold text-gray-900">
                  Customer Information
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Name
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {getCustomerName()}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Email
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {currentOrder.customer?.email || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Phone
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {currentOrder.customer?.primary_phone_no || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Username
                    </label>
                    <p className="mt-1 text-sm text-gray-900 font-mono">
                      {currentOrder.customer?.username || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            {currentOrder.shipping_address && (
              <div className="bg-white shadow rounded-2xl">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center">
                  <MapPin className="mr-2 text-[#C9A35D]" size={20} />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Shipping Address
                  </h2>
                </div>
                <div className="p-6">
                  <p className="text-sm text-gray-900 leading-relaxed">
                    {currentOrder.shipping_address.street ||
                      currentOrder.shipping_address.address_line1}
                    <br />
                    {currentOrder.shipping_address.address_line2 && (
                      <>
                        {currentOrder.shipping_address.address_line2}
                        <br />
                      </>
                    )}
                    {currentOrder.shipping_address.city},{" "}
                    {currentOrder.shipping_address.state ||
                      currentOrder.shipping_address.county}
                    <br />
                    {currentOrder.shipping_address.postal_code ||
                      currentOrder.shipping_address.zip_code}
                    <br />
                    {currentOrder.shipping_address.country}
                  </p>
                </div>
              </div>
            )}

            {/* Combined Order Items and Summary */}
            <div className="bg-white shadow rounded-2xl">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center">
                <Package className="mr-2 text-[#C9A35D]" size={20} />
                <h2 className="text-lg font-semibold text-gray-900">
                  Order Items & Summary
                </h2>
              </div>
              <div className="p-6">
                {/* Order Items */}
                <div className="mb-6">
                  <h3 className="text-md font-semibold text-gray-900 mb-4">
                    Items
                  </h3>
                  <div className="space-y-4">
                    {currentOrder.items && currentOrder.items.length > 0 ? (
                      currentOrder.items.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                        >
                          <div className="flex items-center space-x-4">
                            {item.product?.image_url && (
                              <img
                                src={item.product.image_url}
                                alt={
                                  item.product?.product_name ||
                                  item.product?.name ||
                                  "Product"
                                }
                                className="w-16 h-16 object-cover rounded-lg"
                              />
                            )}
                            <div>
                              <h3 className="text-sm font-medium text-gray-900">
                                {item.product?.product_name ||
                                  item.product?.name ||
                                  item.name ||
                                  "Unknown Product"}
                              </h3>
                              <p className="text-sm text-gray-500">
                                Quantity: {item.quantity}
                              </p>
                              {item.variant && (
                                <p className="text-sm text-gray-500">
                                  Variant: {item.variant}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                              KES {item.price?.toFixed(2) || "0.00"}
                            </p>
                            <p className="text-sm text-gray-500">
                              Total: KES{" "}
                              {(
                                (item.price || 0) * (item.quantity || 0)
                              ).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-4">
                        No items in this order
                      </p>
                    )}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-md font-semibold text-gray-900 mb-4">
                    Order Summary
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="text-gray-900">
                        KES {currentOrder.subtotal?.toFixed(2) || "0.00"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping</span>
                      <span className="text-gray-900">
                        KES {currentOrder.shipping_cost?.toFixed(2) || "0.00"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax</span>
                      <span className="text-gray-900">
                        KES {currentOrder.tax?.toFixed(2) || "0.00"}
                      </span>
                    </div>
                    {currentOrder.discount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Discount</span>
                        <span className="text-green-600">
                          -KES {currentOrder.discount.toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-semibold border-t border-gray-200 pt-3 mt-3">
                      <span className="text-gray-900">Total</span>
                      <span className="text-gray-900">
                        KES {currentOrder.total_amount?.toFixed(2) || "0.00"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Status Update & Additional Info */}
          <div className="space-y-6">
            {/* Status Update */}
            <div className="bg-white shadow rounded-2xl">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Update Status
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Status
                    </label>
                    <span className={getStatusBadgeStyle(currentOrder.status)}>
                      {formatStatus(currentOrder.status)}
                    </span>
                  </div>

                  {isStatusChangeAllowed ? (
                    <>
                      <div>
                        <label
                          htmlFor="status"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Change Status To
                        </label>
                        <select
                          id="status"
                          value={selectedStatus}
                          onChange={handleStatusChange}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#C9A35D] focus:border-transparent"
                        >
                          <option value="">Select a status</option>
                          {allStatusOptions.map((status) => (
                            <option key={status} value={status}>
                              {formatStatus(status)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor="statusNote"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Status Change Note (Optional)
                        </label>
                        <textarea
                          id="statusNote"
                          rows={3}
                          value={statusChangeNote}
                          onChange={(e) => setStatusChangeNote(e.target.value)}
                          placeholder="Add a note about this status change..."
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#C9A35D] focus:border-transparent"
                        />
                      </div>

                      <button
                        onClick={handleSaveChanges}
                        disabled={
                          !selectedStatus ||
                          selectedStatus === currentOrder.status ||
                          updating
                        }
                        className="w-full 
                        bg-gradient-to-r from-[#C9A35D] to-[#b18e4e] 
                        text-white py-3 px-4 rounded-lg 
                        hover:from-[#b18e4e] hover:to-[#9c7b43] 
                        focus:outline-none focus:ring-2 focus:ring-[#C9A35D] focus:ring-offset-2 
                        disabled:opacity-50 disabled:cursor-not-allowed 
                        transition-all shadow-md font-medium"
                      >
                        {updating ? "Updating..." : "Update Order Status"}
                      </button>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <div className="bg-gray-100 rounded-lg p-4">
                        <p className="text-gray-600 text-sm">
                          Status cannot be changed for orders that are{" "}
                          <strong>cancelled or delivered</strong>.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Information */}
            {currentOrder.payment_method && (
              <div className="bg-white shadow rounded-2xl">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Payment Information
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Payment Method</span>
                      <span className="text-gray-900 capitalize">
                        {currentOrder.payment_method}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Payment Status</span>
                      <span
                        className={`capitalize ${
                          currentOrder.payment_status === "paid"
                            ? "text-green-600"
                            : "text-yellow-600"
                        }`}
                      >
                        {currentOrder.payment_status || "pending"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Order Timeline */}
            {currentOrder.status_history &&
              currentOrder.status_history.length > 0 && (
                <div className="bg-white shadow rounded-2xl">
                  <div className="px-6 py-4 border-b border-gray-200 flex items-center">
                    <Clock className="mr-2 text-[#C9A35D]" size={20} />
                    <h2 className="text-lg font-semibold text-gray-900">
                      Order Timeline
                    </h2>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {currentOrder.status_history.map((event, index) => (
                        <div key={index} className="flex items-start space-x-3">ƒ
                          <div
                            className={`w-2 h-2 rounded-full mt-2 ${
                              index === 0 ? "bg-[#C9A35D]" : "bg-gray-300"
                            }`}
                          ></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 capitalize">
                              {formatStatus(event.status || event.old_status)}
                            </p>
                            <p className="text-sm text-gray-500">
                              {event.changed_at
                                ? new Date(event.changed_at).toLocaleString()
                                : "N/A"}
                            </p>
                            {event.note && (
                              <p className="text-sm text-gray-600 mt-1">
                                {event.note}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Confirm Status Update
              </h3>

              {/* Error message */}
              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm flex items-center">
                  <X className="mr-2" size={16} />
                  {error}
                </div>
              )}
              <p className="text-gray-600 mb-4">
                Are you sure you want to change the order status from{" "}
                <span className="font-medium">
                  "{formatStatus(currentOrder.status)}"
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  "{formatStatus(selectedStatus)}"
                </span>
                ?
              </p>
              {statusChangeNote && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Note:
                  </p>
                  <p className="text-sm text-gray-600">{statusChangeNote}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={cancelStatusUpdate}
                  disabled={updating}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmStatusUpdate}
                  disabled={updating}
                  className="flex-1 px-4 py-2 rounded-lg 
                  bg-gradient-to-r from-[#C9A35D] to-[#b18e4e] 
                  text-white hover:from-[#b18e4e] hover:to-[#9c7b43] 
                  transition-colors disabled:opacity-50 font-medium"
                >
                  {updating ? "Updating..." : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}