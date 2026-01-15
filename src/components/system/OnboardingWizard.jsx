import React, { useState, useContext } from 'react';
import { StorageContext } from '../../context/StorageContext';
import { Glass } from '../../components/ui/Glass';
import { MetricInput } from '../logger/MetricInput';

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
      // Save all metrics (Simple mock implementation for wizard logic)
      // In a real scenario, this would map formData to actual metric objects
      Object.values(formData).forEach(val => {
        if(typeof val === 'object' && val.name) {
             addMetric(val);
        }
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
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold">{steps[currentStep].title}</h2>
            <span className="text-xs text-secondary font-bold">Step {currentStep + 1} of {steps.length}</span>
        </div>

        {/* Placeholder for wizard input logic - simplified for audit fix */}
        <div className="p-4 rounded border border-separator border-dashed text-center text-secondary">
            Input for {steps[currentStep].key} goes here
        </div>

        <div className="flex justify-between mt-4">
          <button 
            onClick={prevStep} 
            disabled={currentStep === 0}
            className={`font-bold ${currentStep === 0 ? 'text-secondary opacity-50' : 'text-blue'}`}
          >
            Back
          </button>
          <button 
            onClick={nextStep} 
            className="font-bold text-blue"
          >
            {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </Glass>
  );
};
