import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrderDetails, clearOrder } from '../redux/features/orders/orderSlice';
import { X } from 'lucide-react';

export default function OrderDetailsModal({ orderId, onClose }) {
  const dispatch = useDispatch();
  const { currentOrder, loading, error } = useSelector((state) => state.orders);

  useEffect(() => {
    if (orderId) {
      dispatch(fetchOrderDetails(orderId));
    }
    
    return () => {
      dispatch(clearOrder());
    };
  }, [orderId, dispatch]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return isNaN(date) ? 'Invalid Date' : date.toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">Order Details</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {loading && <p className="text-center text-gray-500">Loading order details...</p>}
          {error && <p className="text-center text-red-500">Error: {error}</p>}
          
          {!loading && !error && currentOrder && (
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-mono">{currentOrder.id.substring(0, 8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Date:</span>
                <span>{formatDate(currentOrder.created_at)}</span>
              </div>
              <div className="flex justify-between text-sm items-center">
                <span className="text-gray-600">Status:</span>
                <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full capitalize">
                  {currentOrder.status}
                </span>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Items</h3>
                <div className="space-y-2">
                  {currentOrder.items && currentOrder.items.length > 0 ? (
                    currentOrder.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <div>
                          <p className="font-medium">{item.product?.name || 'Unknown Product'}</p>
                          <p className="text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-medium">Ksh {(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No items found for this order.</p>
                  )}
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-base font-semibold">
                  <span>Total</span>
                  <span>Ksh {currentOrder.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}