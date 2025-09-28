import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrderDetails } from '../redux/features/orders/ordersSlice';
import { X } from 'lucide-react';

export default function OrderDetailsModal({ orderId, onClose }) {
  const dispatch = useDispatch();
  const { currentOrderDetails, detailsStatus, detailsError } = useSelector((state) => state.orders);

  useEffect(() => {
    if (orderId) {
      dispatch(fetchOrderDetails(orderId));
    }
  }, [orderId, dispatch]);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-1 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">Order Details</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {detailsStatus === 'loading' && <p>Loading order details...</p>}
          {detailsError && <p className="text-red-500">{detailsError}</p>}
          
          {detailsStatus === 'succeeded' && currentOrderDetails && (
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-mono">{currentOrderDetails.order.id.substring(0, 8)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Date:</span>
                <span>{new Date(currentOrderDetails.order.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Status:</span>
                <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">{currentOrderDetails.order.status}</span>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Items</h3>
                <div className="space-y-2">
                  {currentOrderDetails.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <div>
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p>Ksh {(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>Ksh {currentOrderDetails.order.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}