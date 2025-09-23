export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-white p-6">
      <h2 className="text-2xl font-semibold text-center mb-6">Checkout</h2>

      {/* Shipping Address */}
      <div className="space-y-4 mb-6">
        <h3 className="font-medium">Shipping Address</h3>
        <input type="text" placeholder="Full Name" className="w-full border p-3 rounded-lg" />
        <input type="text" placeholder="Address" className="w-full border p-3 rounded-lg" />
        <div className="flex gap-4">
          <input type="text" placeholder="City" className="flex-1 border p-3 rounded-lg" />
          <input type="text" placeholder="Postal Code" className="flex-1 border p-3 rounded-lg" />
        </div>
      </div>

      {/* Payment Method */}
      <div className="mb-6">
        <h3 className="font-medium mb-2">Payment Method</h3>
        <div className="grid grid-cols-3 gap-3">
          <button className="p-3 border rounded-lg">Credit / Debit Card</button>
          <button className="p-3 border rounded-lg">PayPal</button>
          <button className="p-3 border rounded-lg">M-Pesa</button>
        </div>
      </div>

      {/* Order Summary */}
      <div className="p-4 border rounded-xl shadow-sm bg-gray-50 mb-6">
        <h3 className="font-medium mb-3">Order Summary</h3>
        <div className="flex justify-between">
          <span>Items</span>
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

      <button className="w-full bg-yellow-600 text-white py-3 rounded-xl font-medium hover:bg-yellow-700">
        Place Order
      </button>
    </div>
  );
}
