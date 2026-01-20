import React, { useState, useContext, useEffect } from 'react';
import '../styles/tokens.css';
import '../styles/motion.css';
import '../styles/layout.css';

import { StorageProvider, StorageContext } from '../context/StorageContext';
import { NavigationProvider, NavigationContext } from '../context/NavigationContext';
import { Horizon } from '../views/Horizon';
import { Logger } from '../views/Logger';
import { Intel } from '../views/Intel';
import { System } from '../views/System';
import BottomNav from '../components/ui/BottomNav';
import UpdateManager from '../components/system/UpdateManager';
import { OnboardingWizard } from '../components/system/OnboardingWizard';
import { GlobalErrorBoundary } from '../components/system/GlobalErrorBoundary'; // Restored for production safety

const AppContent = () => {
  const { activeTab, setActiveTab, navigationParams, setNavigationParams, tabs } = useContext(NavigationContext);
  const { onboardingComplete, completeOnboarding } = useContext(StorageContext);
  const [showWizard, setShowWizard] = useState(false);

  const handleOnboardingFinish = () => {
    completeOnboarding();
    setShowWizard(false);
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'Horizon': return <Horizon onLaunchSetup={() => setShowWizard(true)} />;
      case 'Logger':
        return <Logger initialMetricId={navigationParams?.metricId} />;
      case 'Intel': return <Intel />;
      case 'System': return <System />;
      default: return <Horizon />;
    }
  };

  const activeIndex = tabs.findIndex(tab => tab.id === activeTab);

  const handleTabChange = (index) => {
    const selectedTab = tabs[index];
    if (selectedTab) {
      setActiveTab(selectedTab.id);
      setNavigationParams(null);
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-bg-color font-system text-primary relative">
      {/* Main Content Area */}
      <main className="flex-1 w-full layout-padding">
         {renderTab()}
      </main>
      
      {/* Update Manager */}
      <UpdateManager />

      {/* Navigation */}
      <BottomNav
        tabs={tabs}
        activeIndex={activeIndex}
        onChange={handleTabChange}
      />

      {/* Onboarding Overlay - Fixed: Only show on Horizon to prevent ghosting */}
      {showWizard && activeTab === 'Horizon' && (
        <div className="fixed inset-0 z-[200] bg-bg-color animate-fade-in overflow-y-auto flex items-center justify-center p-4">
          <div className="w-full max-w-lg h-full max-h-[90vh]">
            <OnboardingWizard onComplete={handleOnboardingFinish} onClose={() => setShowWizard(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export const App = () => {
  return (
    <GlobalErrorBoundary>
      <StorageProvider>
        <NavigationProvider>
           <AppContent />
        </NavigationProvider>
      </StorageProvider>
    </GlobalErrorBoundary>
  );
};
