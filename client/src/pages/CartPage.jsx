import React, { useEffect, useState } from "react";
import apiClient from "../api/axios";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CartItem from "../components/CartItem";

const CartPage = () => {
  const [cart, setCart] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await apiClient.get("/api/carts");
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
  if (!cart || cart.items.length === 0) return <p>Your cart is empty.</p>;

  return (
    <div>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
        <div className="space-y-4">
          {cart.items.map((item) => (
            <CartItem key={item.id} item={item} />
          ))}
        </div>
        <div className="mt-6 flex justify-between font-semibold">
          <span>Total:</span>
          <span>KES {cart.total_amount}</span>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CartPage;
