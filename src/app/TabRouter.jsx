// src/components/app/TabRouter.jsx
import React, { useState } from 'react';

/**
 * TabRouter
 * Props:
 * - tabs: array of { key: string, component: JSX.Element }
 * - initialTab: key of the initial active tab
 * - onTabChange: optional callback when tab switches
 */
export const TabRouter = ({ tabs = [], initialTab = null, onTabChange }) => {
  const [activeTab, setActiveTab] = useState(initialTab || (tabs[0] && tabs[0].key));

  const switchTab = (key) => {
    setActiveTab(key);
    if (onTabChange) onTabChange(key);
  };

  const renderTab = () => {
    const active = tabs.find(t => t.key === activeTab);
    return active ? active.component : null;
  };

  return {
    activeTab,
    switchTab,
    renderTab
  };
};
