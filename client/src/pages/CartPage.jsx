import { Link } from "react-router-dom";

export default function CartPage() {
  return (
    <div className="min-h-screen bg-white p-6">
      <h2 className="text-2xl font-semibold text-center mb-6">Your Shopping Cart</h2>

      {/* Cart Items */}
      <div className="space-y-4">
        {/* Item Card */}
        <div className="flex items-center justify-between border rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-4">
            {/* Image Placeholder */}
            <div className="w-16 h-16 bg-gray-200 rounded-md"></div>
            <div>
              <h3 className="font-medium">Product Name</h3>
              <p className="text-sm text-gray-500">Product Size</p>
            </div>
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center gap-3">
            <button className="px-2 py-1 border rounded-lg">-</button>
            <span>1</span>
            <button className="px-2 py-1 border rounded-lg">+</button>
          </div>

          <p className="font-semibold">Ksh 0.00</p>
        </div>
      </div>

      {/* Order Summary */}
      <div className="mt-6 p-4 border rounded-xl shadow-sm bg-gray-50">
        <h3 className="font-medium mb-3">Order Summary</h3>
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>Ksh 0.00</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping</span>
          <span>Ksh 0.00</span>
        </div>
        <div className="flex justify-between font-semibold text-lg mt-2">
          <span>Total</span>
          <span>Ksh 0.00</span>
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
