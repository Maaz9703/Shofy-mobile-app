import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

const RecentlyViewedContext = createContext();

export const useRecentlyViewed = () => {
  const context = useContext(RecentlyViewedContext);
  if (!context) {
    throw new Error('useRecentlyViewed must be used within RecentlyViewedProvider');
  }
  return context;
};

export const RecentlyViewedProvider = ({ children }) => {
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const MAX_ITEMS = 20;

  useEffect(() => {
    loadRecentlyViewed();
  }, []);

  const loadRecentlyViewed = async () => {
    try {
      const data = await SecureStore.getItemAsync('recentlyViewed');
      if (data) {
        setRecentlyViewed(JSON.parse(data));
      }
    } catch (error) {
      console.error('Load recently viewed:', error);
    }
  };

  const saveRecentlyViewed = async (items) => {
    try {
      await SecureStore.setItemAsync('recentlyViewed', JSON.stringify(items));
      setRecentlyViewed(items);
    } catch (error) {
      console.error('Save recently viewed:', error);
    }
  };

  const addToRecentlyViewed = (product) => {
    if (!product || !product._id) return;

    setRecentlyViewed((prev) => {
      // Remove if already exists
      const filtered = prev.filter((p) => p._id !== product._id);
      // Add to beginning
      const updated = [{ ...product, viewedAt: new Date().toISOString() }, ...filtered];
      // Keep only MAX_ITEMS
      const limited = updated.slice(0, MAX_ITEMS);
      saveRecentlyViewed(limited);
      return limited;
    });
  };

  const clearRecentlyViewed = async () => {
    try {
      await SecureStore.deleteItemAsync('recentlyViewed');
      setRecentlyViewed([]);
    } catch (error) {
      console.error('Clear recently viewed:', error);
    }
  };

  const getRecommendations = (currentProductId) => {
    // Get products from same category, excluding current product
    const currentProduct = recentlyViewed.find((p) => p._id === currentProductId);
    if (!currentProduct) return [];

    return recentlyViewed
      .filter(
        (p) =>
          p._id !== currentProductId &&
          p.category === currentProduct.category
      )
      .slice(0, 4);
  };

  return (
    <RecentlyViewedContext.Provider
      value={{
        recentlyViewed,
        addToRecentlyViewed,
        clearRecentlyViewed,
        getRecommendations,
      }}
    >
      {children}
    </RecentlyViewedContext.Provider>
  );
};
