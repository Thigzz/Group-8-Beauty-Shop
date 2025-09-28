import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { fetchAddresses } from '../redux/features/address/addressSlice';
import { placeOrder } from '../redux/features/orders/ordersSlice';
import { clearCart } from '../redux/features/cart/cartSlice';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [paymentMethod, setPaymentMethod] = useState('credit_card');

  const { user } = useSelector((state) => state.auth);
  const { items: cartItems, grand_total } = useSelector((state) => state.cart);
  const { defaultAddress, status: addressStatus } = useSelector((state) => state.address);
  const { status: orderStatus } = useSelector((state) => state.orders);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchAddresses());
    }
  }, [dispatch, user]);

  const shippingFee = 500.00;
  const orderTotal = grand_total + shippingFee;
  const fullName = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : '';

  const handlePlaceOrder = () => {
    const orderItems = cartItems
      .filter(item => item.product && item.product.id) 
      .map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
      }));
      
    if (orderItems.length === 0) {
        toast.error("Your cart contains no valid items to order.");
        return;
    }

    const orderData = {
      user_id: user.id,
      items: orderItems,
      payment_method: paymentMethod,
    };

    dispatch(placeOrder(orderData))
      .unwrap()
      .then((response) => {
        toast.success("Order placed successfully!");
        navigate('/order-confirmation', { state: { order: response.order, invoice: response.invoice } });
      })
      .catch((error) => {
        const errorMessage = error.error || "There was an issue placing your order.";
        toast.error(errorMessage);
      });
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <h2 className="text-2xl font-semibold text-center mb-6">Checkout</h2>

      {/* Shipping Address */}
      <div className="space-y-4 mb-6">
        <h3 className="font-medium">Shipping Address</h3>
        {addressStatus === 'loading' && <p>Loading your address...</p>}
        {addressStatus !== 'loading' && defaultAddress ? (
          <>
            <input type="text" defaultValue={fullName} readOnly className="w-full border p-3 rounded-lg bg-gray-100 cursor-not-allowed" />
            <input type="text" defaultValue={defaultAddress.address_line_1 || ''} readOnly className="w-full border p-3 rounded-lg bg-gray-100 cursor-not-allowed" />
            <div className="flex gap-4">
              <input type="text" defaultValue={defaultAddress.city || ''} readOnly className="flex-1 border p-3 rounded-lg bg-gray-100 cursor-not-allowed" />
              <input type="text" defaultValue={defaultAddress.postal_code || ''} readOnly className="flex-1 border p-3 rounded-lg bg-gray-100 cursor-not-allowed" />
            </div>
            <Link to="/profile" className="text-sm text-blue-600 hover:underline">
              Want to ship to a different address? Manage addresses in your profile.
            </Link>
          </>
        ) : (
          <div className="border p-3 rounded-lg bg-gray-50 text-center">
             <p className="text-gray-600">
                You have no default shipping address. 
                <Link to="/profile" className="text-blue-600 hover:underline ml-1">
                  Please add one in your profile to proceed.
                </Link>
              </p>
          </div>
        )}
      </div>

      {/* Payment Method */}
      <div className="mb-6">
        <h3 className="font-medium mb-2">Payment Method</h3>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <button onClick={() => setPaymentMethod('credit_card')} className={`p-3 border rounded-lg hover:border-yellow-700 ${paymentMethod === 'credit_card' ? 'border-yellow-600 ring-2 ring-yellow-500' : ''}`}>Credit / Debit Card</button>
          <button onClick={() => setPaymentMethod('paypal')} className={`p-3 border rounded-lg hover:border-yellow-700 ${paymentMethod === 'paypal' ? 'border-yellow-600 ring-2 ring-yellow-500' : ''}`}>PayPal</button>
          <button onClick={() => setPaymentMethod('mpesa')} className={`p-3 border rounded-lg hover:border-yellow-700 ${paymentMethod === 'mpesa' ? 'border-yellow-600 ring-2 ring-yellow-500' : ''}`}>M-Pesa</button>
        </div>

        {paymentMethod === 'credit_card' && (
          <div className="space-y-3 p-4 border rounded-lg bg-gray-50">
              <input type="text" placeholder="Card Number (e.g., 1234 5678 9101 1121)" className="w-full border p-3 rounded-lg" />
              <div className="flex gap-4">
                  <input type="text" placeholder="MM / YY" className="flex-1 border p-3 rounded-lg" />
                  <input type="text" placeholder="CVC" className="flex-1 border p-3 rounded-lg" />
              </div>
          </div>
        )}
        {paymentMethod === 'mpesa' && (
           <div className="space-y-3 p-4 border rounded-lg bg-gray-50">
               <p className="text-sm text-center text-gray-600">A payment prompt will be sent to your phone.</p>
               <input type="text" placeholder="Phone Number (e.g., 0712345678)" className="w-full border p-3 rounded-lg" />
           </div>
        )}
      </div>

      {/* Order Summary */}
      <div className="p-4 border rounded-xl shadow-sm bg-gray-50 mb-6">
        <h3 className="font-medium mb-3">Order Summary</h3>
        <div className="flex justify-between">
          <span>Items</span>
          <span>Ksh {grand_total.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping</span>
          <span>Ksh {shippingFee.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-semibold text-lg mt-2">
          <span>Total</span>
          <span>Ksh {orderTotal.toFixed(2)}</span>
        </div>
      </div>

      <button
        onClick={handlePlaceOrder}
        disabled={!defaultAddress || cartItems.length === 0 || orderStatus === 'loading'}
        className="w-full bg-yellow-600 text-white py-3 rounded-xl font-medium hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {orderStatus === 'loading' ? 'Placing Order...' : 'Place Order'}
      </button>
    </div>
  );
}