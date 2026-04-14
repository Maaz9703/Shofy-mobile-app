import React, { createContext, useContext, useState } from 'react';

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

  const addToCart = (product, quantity = 1, color = null, note = '') => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product._id === product._id && item.color === color && item.note === note
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity
        };
        return updated;
      }
      return [...prev, { product, quantity, color, note }];
    });
  };

  const removeFromCart = (productId, color, note) => {
    setCartItems((prev) => prev.filter((item) => !(item.product._id === productId && item.color === color && item.note === note)));
  };

  const updateQuantity = (productId, color, note, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId, color, note);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        (item.product._id === productId && item.color === color && item.note === note) ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => setCartItems([]);

  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

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
