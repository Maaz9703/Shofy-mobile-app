import React, { createContext, useContext, useState, useMemo } from 'react';
import { getQuantityDiscount } from './utils/price';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (product, quantity = 1, color = null, flavor = null, note = '') => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product._id === product._id && item.color === color && item.flavor === flavor && item.note === note
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity
        };
        return updated;
      }
      return [...prev, { product, quantity, color, flavor, note }];
    });
  };

  const removeFromCart = (productId, color, flavor, note) => {
    setCartItems((prev) => prev.filter((item) => !(item.product._id === productId && item.color === color && item.flavor === flavor && item.note === note)));
  };

  const updateQuantity = (productId, color, flavor, note, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId, color, flavor, note);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        (item.product._id === productId && item.color === color && item.flavor === flavor && item.note === note) ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => setCartItems([]);

  const cartTotal = useMemo(() => {
    const productQuantities = {};
    cartItems.forEach(item => {
      const pid = item.product._id;
      if (!productQuantities[pid]) {
        productQuantities[pid] = 0;
      }
      productQuantities[pid] += item.quantity;
    });

    let total = 0;
    cartItems.forEach(item => {
      const pid = item.product._id;
      const totalProductQty = productQuantities[pid];
      const { unitPrice } = getQuantityDiscount(item.product, totalProductQty);
      total += unitPrice * item.quantity;
    });
    return total;
  }, [cartItems]);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal,
    cartCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
