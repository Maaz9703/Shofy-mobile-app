import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../config/api';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    mobileAppName: 'Shofy Mobile',
    promoBannerText: 'Welcome to our store!',
    showPromoBanner: false,
    maintenanceMode: false,
    disableReviews: false,
  });
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings');
      if (res.data?.success) {
        setSettings(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch mobile settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
