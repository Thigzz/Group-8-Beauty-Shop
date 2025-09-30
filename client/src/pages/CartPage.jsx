// HotFix2/client/src/pages/CartPage.jsx
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getCart, updateCartItem, removeFromCart } from "../redux/features/cart/cartSlice";
import CartItem from "../components/CartItem";

export default function CartPage() {
  const dispatch = useDispatch();
  const { items, grand_total, status } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    const sessionId = localStorage.getItem("sessionId");
    if (userInfo) {
      dispatch(getCart({ userId: userInfo.id }));
    } else if (sessionId) {
      dispatch(getCart({ sessionId }));
    }
  }, [dispatch, userInfo]);


  const handleQuantityChange = (itemId, quantity) => {
    dispatch(updateCartItem({ itemId, quantity }));
  };

  const handleRemoveItem = (itemId) => {
    dispatch(removeFromCart(itemId));
  };


  if (status === 'loading') {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <h2 className="text-2xl font-semibold text-center mb-6">Your Shopping Cart</h2>

      {/* Cart Items */}
      <div className="space-y-4">
        {items && items.map((item) => (
          <CartItem
            key={item.id}
            item={item}
            onQuantityChange={handleQuantityChange}
            onRemove={handleRemoveItem}
          />
        ))}
      </div>

      {/* Order Summary */}
      <div className="mt-6 p-4 border rounded-xl shadow-sm bg-gray-50">
        <h3 className="font-medium mb-3">Order Summary</h3>
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>Ksh {grand_total.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping</span>
          <span>Ksh 0.00</span>
        </div>
        <div className="flex justify-between font-semibold text-lg mt-2">
          <span>Total</span>
          <span>Ksh {grand_total.toFixed(2)}</span>
        </div>
      </div>

      {/* Proceed to Checkout */}
      <Link
        to="/checkout"
        className="mt-6 block w-full bg-yellow-600 text-white py-3 rounded-xl text-center font-medium hover:bg-yellow-700"
      >
        Proceed to Checkout
      </Link>
    </div>
  );
}