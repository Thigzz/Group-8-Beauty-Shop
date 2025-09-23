import { Link } from "react-router-dom";
import { LogOut } from "lucide-react";

export default function OrderConfirmationPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-yellow-50 to-white p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-md p-6 text-center space-y-6">
        {/* Success Icon */}
        <div className="w-20 h-20 mx-auto flex items-center justify-center rounded-full bg-yellow-100">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-yellow-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Confirmation Text */}
        <div>
          <h2 className="text-xl font-semibold">Thank you for your order!</h2>
          <p className="text-gray-500 text-sm">Order #123456</p>
        </div>

        {/* Order Summary */}
        <div className="bg-yellow-50 rounded-lg p-4 text-left text-gray-700">
          <p>1x Gold Lipstick</p>
          <p>1x Beige Foundation</p>
          <p className="font-semibold mt-2">Total: KES 3,500</p>
        </div>

        {/* Delivery Estimate */}
        <p className="text-gray-500 text-sm">Estimated delivery: 2–5 days</p>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <Link
            to="/shop"
            className="w-full py-3 rounded-xl border border-yellow-600 text-yellow-600 hover:bg-yellow-600 hover:text-white font-medium transition"
          >
            Continue Shopping
          </Link>

          <button className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-100 font-medium transition">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>
    </div>
  );
}
