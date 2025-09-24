import React, { useState, useEffect } from "react";
import axios from "axios";

export default function CheckoutPage({ userId, cartItems }) {
  const [address, setAddress] = useState({
    fullName: "",
    street: "",
    city: "",
    postalCode: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [orderSummary, setOrderSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Calculate totals on cart change
  useEffect(() => {
    if (cartItems && cartItems.length > 0) {
      calculateTotals();
    }
  }, [cartItems]);

  const calculateTotals = async () => {
    try {
      const { data } = await axios.post("/api/checkout/calculate", {
        items: cartItems.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
      });
      setOrderSummary(data);
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.error || "Failed to calculate total");
    }
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    setMessage("");
    try {
      const { data } = await axios.post("/api/checkout/process", {
        user_id: userId,
        items: cartItems.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
        payment_method: paymentMethod,
        shipping_address: address, // optional if you expand backend to save shipping
      });

      setMessage(`✅ ${data.message}. Order ID: ${data.order.id}`);
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.error || "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <h2 className="text-2xl font-semibold text-center mb-6">Checkout</h2>

      {/* Shipping Address */}
      <div className="space-y-4 mb-6">
        <h3 className="font-medium">Shipping Address</h3>
        <input
          type="text"
          placeholder="Full Name"
          value={address.fullName}
          onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
          className="w-full border p-3 rounded-lg"
        />
        <input
          type="text"
          placeholder="Street Address"
          value={address.street}
          onChange={(e) => setAddress({ ...address, street: e.target.value })}
          className="w-full border p-3 rounded-lg"
        />
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="City"
            value={address.city}
            onChange={(e) => setAddress({ ...address, city: e.target.value })}
            className="flex-1 border p-3 rounded-lg"
          />
          <input
            type="text"
            placeholder="Postal Code"
            value={address.postalCode}
            onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
            className="flex-1 border p-3 rounded-lg"
          />
        </div>
      </div>

      {/* Payment Method */}
      <div className="mb-6">
        <h3 className="font-medium mb-2">Payment Method</h3>
        <div className="grid grid-cols-3 gap-3">
          {["credit_card", "paypal", "mpesa"].map((method) => (
            <button
              key={method}
              onClick={() => setPaymentMethod(method)}
              className={`p-3 border rounded-lg ${
                paymentMethod === method ? "bg-yellow-200" : ""
              }`}
            >
              {method === "credit_card"
                ? "Credit/Debit Card"
                : method === "paypal"
                ? "PayPal"
                : "M-Pesa"}
            </button>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      {orderSummary && (
        <div className="p-4 border rounded-xl shadow-sm bg-gray-50 mb-6">
          <h3 className="font-medium mb-3">Order Summary</h3>
          {orderSummary.items.map((item) => (
            <div key={item.product_id} className="flex justify-between text-sm">
              <span>
                {item.product_name} x {item.quantity}
              </span>
              <span>Ksh {item.subtotal.toFixed(2)}</span>
            </div>
          ))}
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>Ksh {orderSummary.shipping.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-semibold text-lg mt-2">
            <span>Total</span>
            <span>Ksh {orderSummary.total.toFixed(2)}</span>
          </div>
        </div>
      )}

      <button
        onClick={handlePlaceOrder}
        disabled={loading}
        className="w-full bg-yellow-600 text-white py-3 rounded-xl font-medium hover:bg-yellow-700 disabled:opacity-50"
      >
        {loading ? "Placing Order..." : "Place Order"}
      </button>

      {message && <p className="mt-4 text-center text-sm text-red-600">{message}</p>}
    </div>
  );
}
