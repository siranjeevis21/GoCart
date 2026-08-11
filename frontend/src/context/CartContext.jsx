import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../services/api';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [cart, setCart] = useState({ items: [], subtotal: 0, delivery: 0, total: 0 });
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!user || user.role === 'ADMIN') return;
    setLoading(true);
    try {
      const res = await API.get('cart/');
      setCart(res.data);
    } catch (err) {
      console.error("Failed to fetch cart:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      fetchCart();
    } else {
      setCart({ items: [], subtotal: 0, delivery: 0, total: 0 });
    }
  }, [user]);

  const addToCart = async (productId, quantity = 1) => {
    await API.post('cart/add/', { product: productId, quantity });
    await fetchCart();
  };

  const updateQuantity = async (itemId, quantity) => {
    await API.put(`cart/update/${itemId}/`, { quantity });
    await fetchCart();
  };

  const removeItem = async (itemId) => {
    await API.delete(`cart/remove/${itemId}/`);
    await fetchCart();
  };

  const clearCart = async () => {
    await API.delete('cart/clear/');
    setCart({ items: [], subtotal: 0, delivery: 0, total: 0 });
  };

  const cartCount = cart.items ? cart.items.reduce((sum, item) => sum + item.quantity, 0) : 0;

  return (
    <CartContext.Provider value={{ cart, cartCount, loading, fetchCart, addToCart, updateQuantity, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
