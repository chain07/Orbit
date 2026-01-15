import React, { useState, useContext, useEffect } from 'react';
/* 🔗 Global design system */
import '../styles/tokens.css';
import '../styles/motion.css';
import { StorageProvider, StorageContext } from '../context/StorageContext';
import { Horizon } from '../views/Horizon';
import { Logger } from '../views/Logger';
import { Intel } from '../views/Intel';
import { System } from '../views/System';
import { BottomNav } from '../components/ui/BottomNav';
import { OnboardingWizard } from '../components/system/OnboardingWizard';

/* * AppContent
 * Internal component to consume StorageContext, which is provided by the parent App component.
 */
const AppContent = () => {
  const [activeTab, setActiveTab] = useState('Horizon');
  [span_0](start_span)// Access onboarding state from Context[span_0](end_span)
  const { onboardingComplete, completeOnboarding } = useContext(StorageContext);
  const [showWizard, setShowWizard] = useState(false);

  // Check onboarding status on mount
  useEffect(() => {
    // If onboardingComplete is undefined (context loading) or false, show wizard
    if (onboardingComplete === false) {
      setShowWizard(true);
    }
  }, [onboardingComplete]);

  const handleOnboardingFinish = () => {
    completeOnboarding();
    setShowWizard(false);
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'Horizon': return <Horizon />;
      case 'Logger': return <Logger />;
      case 'Intel': return <Intel />;
      case 'System': return <System />;
      default: return <Horizon />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-page font-system text-primary relative">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {renderTab()}
      </div>
      
      {/* Navigation */}
      <BottomNav
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Onboarding Overlay */}
      {showWizard && (
        <div className="absolute inset-0 z-50 bg-bg-color">
          <OnboardingWizard onComplete={handleOnboardingFinish} />
        </div>
      )}
    </div>
  );
};

export const App = () => {
  return (
    <StorageProvider>
      <AppContent />
    </StorageProvider>
  );
};
