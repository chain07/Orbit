import React, { createContext, useContext, useState, useEffect } from 'react';

// ----------------------
// Default Settings Schema
// ----------------------
export const DefaultSettings = {
  darkMode: false,
  units: 'metric', // could be 'metric' or 'imperial'
  showAdvancedAnalytics: true,
  notificationsEnabled: true,
  preferredWidgetLayout: {}, // object with widget positions
};

// ----------------------
// Settings Context
// ----------------------
const SettingsContext = createContext();

export const useSettings = () => {
  return useContext(SettingsContext);
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(DefaultSettings);

  // Load settings from localStorage
  useEffect(() => {
    const storedSettings = JSON.parse(localStorage.getItem('settings')) || {};
    setSettings(prev => ({ ...prev, ...storedSettings }));
  }, []);

  // Persist settings to localStorage
  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify(settings));
  }, [settings]);

  // ----------------------
  // Update Functions
  // ----------------------
  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => {
    setSettings(DefaultSettings);
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSetting,
        resetSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
