import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import { LayoutDashboard, PenTool, Radio, Settings } from 'lucide-react';

export const NavigationContext = createContext();

export const NavigationProvider = ({ children }) => {
  const [activeTab, setActiveTab] = useState('Horizon');
  const [navigationParams, setNavigationParams] = useState(null);

  // Define Tab Configuration for Navigation
  const tabs = useMemo(() => [
    { id: 'Horizon', label: 'Horizon', icon: <LayoutDashboard size={24} /> },
    { id: 'Logger', label: 'Logger', icon: <PenTool size={24} /> },
    { id: 'Intel', label: 'Intel', icon: <Radio size={24} /> },
    { id: 'System', label: 'System', icon: <Settings size={24} /> }
  ], []);

  // Global Navigation Event Listener
  useEffect(() => {
    const handleNavigation = (event) => {
      const { tab, metricId } = event.detail;
      if (tab) {
        setActiveTab(tab);
        if (metricId) {
          setNavigationParams({ metricId });
        }
      }
    };

    window.addEventListener('orbit-navigate', handleNavigation);
    return () => window.removeEventListener('orbit-navigate', handleNavigation);
  }, []);

  const value = useMemo(() => ({
    activeTab,
    setActiveTab,
    navigationParams,
    setNavigationParams,
    tabs
  }), [activeTab, navigationParams, tabs]);

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};
