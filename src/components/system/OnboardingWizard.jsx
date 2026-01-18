import React, { useState, useContext } from 'react';
import { StorageContext } from '../../context/StorageContext';
import { Glass } from '../../components/ui/Glass';
import '../../styles/index.css'; // Ensure standard buttons are available

export const OnboardingWizard = ({ onComplete }) => {
  const { addMetric } = useContext(StorageContext);
  
  const steps = [
    { title: 'Create Metric 1', key: 'metric1' },
    { title: 'Create Metric 2', key: 'metric2' },
    { title: 'Create Metric 3', key: 'metric3' },
    { title: 'Set Goals', key: 'goal' }
  ];

  const [currentStep, setCurrentStep] = useState(0);
  
  // Initialize state for the three metrics we will build
  // Defaulting to diverse colors and widget types for a better starting dashboard
  const [formData, setFormData] = useState({
    metric1: { name: '', type: 'boolean', goal: 1, color: '#007AFF', widgetType: 'ring' },
    metric2: { name: '', type: 'number', goal: 10, color: '#34C759', widgetType: 'sparkline' },
    metric3: { name: '', type: 'number', goal: 5, color: '#FF9500', widgetType: 'bar' }
  });

  // Implemented properly to handle updates (replacing unused placeholder)
  const updateField = (metricSlot, field, value) => {
    setFormData(prev => ({
      ...prev,
      [metricSlot]: {
        ...prev[metricSlot],
        [field]: value
      }
    }));
  };

  const nextStep = () => {
    // Basic validation for the metric creation steps
    if (currentStep < 3) {
      const currentKey = steps[currentStep].key;
      if (!formData[currentKey].name) {
        alert("Please give your metric a name");
        return;
      }
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleFinish = () => {
    // Submit all metrics
    ['metric1', 'metric2', 'metric3'].forEach(key => {
      const m = formData[key];
      // Only add metrics that were actually named by the user
      if (m.name) {
         addMetric({
             name: m.name,
             type: m.type,
             goal: parseFloat(m.goal),
             color: m.color,
             widgetType: m.widgetType,
             label: m.name // Ensure label is set for consistency
         });
      }
    });
    if (onComplete) onComplete();
  };

  const handleSkip = () => {
      if (confirm("Are you sure you want to skip setup? You can configure metrics later in System > Metrics.")) {
          if (onComplete) onComplete();
      }
  };

  // Implements actual metric creation form for each step
  const renderMetricForm = (metricSlot) => {
    const data = formData[metricSlot];
    return (
      <div className="flex flex-col gap-4 animate-fade-in">
        <div>
          <label className="text-xs font-bold text-secondary uppercase">Metric Name</label>
          <input 
            type="text" 
            value={data.name}
            onChange={(e) => updateField(metricSlot, 'name', e.target.value)}
            placeholder="e.g. Focus Time"
            className="w-full p-3 rounded-xl bg-bg-color border border-separator text-lg font-bold outline-none focus:border-blue"
          />
        </div>

        <div>
           <label className="text-xs font-bold text-secondary uppercase">Type</label>
           <div className="flex gap-2 mt-1">
             <button 
                onClick={() => updateField(metricSlot, 'type', 'boolean')}
                className={`flex-1 py-3 rounded-lg font-bold text-sm transition-colors ${data.type === 'boolean' ? 'bg-blue text-white' : 'bg-bg-color border border-separator'}`}
             >
                Yes/No
             </button>
             <button 
                onClick={() => updateField(metricSlot, 'type', 'number')}
                className={`flex-1 py-3 rounded-lg font-bold text-sm transition-colors ${data.type === 'number' ? 'bg-blue text-white' : 'bg-bg-color border border-separator'}`}
             >
                Number
             </button>
           </div>
        </div>
        
        {/* Simple Color Picker to provide visual variety */}
        <div>
          <label className="text-xs font-bold text-secondary uppercase">Color</label>
           <div className="flex gap-3 mt-1">
             {['#007AFF', '#34C759', '#FF9500', '#FF3B30', '#AF52DE'].map(c => (
               <button
                 key={c}
                 onClick={() => updateField(metricSlot, 'color', c)}
                 style={{ backgroundColor: c }}
                 className={`w-10 h-10 rounded-full ${data.color === c ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
               />
             ))}
           </div>
        </div>
      </div>
    );
  };

  // Implements goal setting form for step 4
  const renderGoalForm = () => {
    // Only show goal inputs for metrics that are numeric
    const numericMetrics = ['metric1', 'metric2', 'metric3'].filter(k => formData[k].type === 'number' && formData[k].name);
    
    if (numericMetrics.length === 0) {
      return (
        <div className="text-center py-8 text-secondary">
          <div className="text-3xl mb-2">✨</div>
          <p>All your metrics are Yes/No habits.</p>
          <p className="text-sm mt-1">You're ready to go!</p>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-4 animate-fade-in">
        <p className="text-sm text-secondary mb-2">Set daily targets for your numeric metrics.</p>
        {numericMetrics.map(key => (
          <div key={key}>
            <label className="text-xs font-bold text-secondary uppercase">{formData[key].name} Goal</label>
            <input 
              type="number" 
              value={formData[key].goal}
              onChange={(e) => updateField(key, 'goal', e.target.value)}
              className="w-full p-3 rounded-xl bg-bg-color border border-separator text-lg font-bold outline-none"
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <Glass className="h-full flex flex-col p-6 shadow-2xl border border-glass-border">
        <div className="flex justify-between items-center border-b border-separator pb-4 mb-4">
            <div>
              <h2 className="text-xl font-extrabold">{steps[currentStep].title}</h2>
              <span className="text-xs text-secondary font-bold">Step {currentStep + 1} of {steps.length}</span>
            </div>
            {/* Progress dot indicator */}
            <div className="flex gap-1">
              {steps.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-2 h-2 rounded-full ${idx === currentStep ? 'bg-blue' : 'bg-separator opacity-30'}`}
                />
              ))}
            </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto min-h-[250px]">
          {currentStep < 3 ? renderMetricForm(steps[currentStep].key) : renderGoalForm()}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col gap-3 pt-4 border-t border-separator mt-4">
            <div className="flex justify-between gap-3">
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className={`btn-secondary flex-1 ${currentStep === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Back
              </button>
              <button
                onClick={nextStep}
                className="btn-primary flex-1"
              >
                {currentStep === steps.length - 1 ? 'Launch ORBIT 🚀' : 'Next'}
              </button>
            </div>

            <button onClick={handleSkip} className="text-xs text-secondary font-bold hover:text-primary transition-colors py-2 text-center">
                Skip Setup
            </button>
        </div>
    </Glass>
  );
};
