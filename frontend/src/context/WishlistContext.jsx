import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../services/api';
import { AuthContext } from './AuthContext';

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = async () => {
    if (!user || user.role === 'ADMIN') return;
    setLoading(true);
    try {
      const res = await API.get('wishlist/');
      setWishlist(res.data.results !== undefined ? res.data.results : res.data);
    } catch (err) {
      console.error("Failed to fetch wishlist:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      fetchWishlist();
    } else {
      setWishlist([]);
    }
  }, [user]);

  const addToWishlist = async (productId) => {
    try {
      await API.post('wishlist/add/', { product: productId });
      await fetchWishlist();
    } catch (err) {
      console.error("Failed to add to wishlist:", err);
    }
  };

  const removeFromWishlist = async (itemId) => {
    try {
      await API.delete(`wishlist/${itemId}/`);
      await fetchWishlist();
    } catch (err) {
      console.error("Failed to remove from wishlist:", err);
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => item.product === productId);
  };

  const getWishlistItemId = (productId) => {
    const found = wishlist.find(item => item.product === productId);
    return found ? found.id : null;
  };

  const wishlistCount = wishlist.length;

  return (
    <WishlistContext.Provider value={{ wishlist, wishlistCount, loading, fetchWishlist, addToWishlist, removeFromWishlist, isInWishlist, getWishlistItemId }}>
      {children}
    </WishlistContext.Provider>
  );
};

export default WishlistContext;
