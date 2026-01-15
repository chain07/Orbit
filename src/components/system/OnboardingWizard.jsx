// src/views/system/OnboardingWizard.jsx
import React, { useState, useContext } from 'react';
import { StorageContext } from '../../context/StorageContext';
import { Glass } from '../../components/ui/Glass';
import { MetricInput } from '../components/logger/MetricInput';

export const OnboardingWizard = ({ onComplete }) => {
  const { addMetric } = useContext(StorageContext);

  const steps = [
    { title: 'Create Metric 1', key: 'metric1' },
    { title: 'Create Metric 2', key: 'metric2' },
    { title: 'Create Metric 3', key: 'metric3' },
    { title: 'Set Your First Goal', key: 'goal' }
  ];

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Save all metrics
      Object.values(formData).forEach(metric => {
        addMetric(metric);
      });
      if (onComplete) onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const updateField = (key, value) => {
    setFormData(prev => ({
      ...prev,
      [steps[currentStep].key]: value
    }));
  };

  return (
    <Glass>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600 }}>{steps[currentStep].title}</h2>

        <MetricInput
          value={formData[steps[currentStep].key] || {}}
          onChange={(val) => updateField(steps[currentStep].key, val)}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
          <button onClick={prevStep} disabled={currentStep === 0}>Back</button>
          <button onClick={nextStep}>{currentStep === steps.length - 1 ? 'Finish' : 'Next'}</button>
        </div>
      </div>
    </Glass>
  );
};
