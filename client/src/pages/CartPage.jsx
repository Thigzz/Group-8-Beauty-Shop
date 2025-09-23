import React, { useEffect, useState } from "react";
import apiClient from "../api/axios";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CartItem from "../components/CartItem";

// helper: generate a random session_id if none exists
const getOrCreateSessionId = () => {
  let sessionId = localStorage.getItem("sessionId");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem("sessionId", sessionId);
  }
  return sessionId;
};

const CartPage = () => {
  const [cart, setCart] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const userId = localStorage.getItem("userId"); // set this on login
        const sessionId = getOrCreateSessionId();

        // backend requires query params
        const params = userId ? { user_id: userId } : { session_id: sessionId };

        const response = await apiClient.get("/api/carts/", { params });
        setCart(response.data);
      } catch (error) {
        console.error("Failed to fetch cart:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCart();
  }, []);

  if (isLoading) return <p>Loading cart...</p>;
  if (!cart || !cart.items || cart.items.length === 0)
    return (
      <div>
        <Header />
        <main className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
          <p>Your cart is empty.</p>
        </main>
        <Footer />
      </div>
    );

  return (
    <div>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
        <div className="space-y-4">
          {cart.items.map((item) => (
            <CartItem key={item.product_id} item={item} />
          ))}
        </div>
        <div className="mt-6 flex justify-between font-semibold">
          <span>Total:</span>
          <span>KES {cart.grand_total}</span>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CartPage;
