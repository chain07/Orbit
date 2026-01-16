import React, { useState, useContext } from 'react';
import { StorageContext } from '../../context/StorageContext';
import { Glass } from '../../components/ui/Glass';

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
  [span_0](start_span)// Defaulting to diverse colors and widget types for a better starting dashboard[span_0](end_span)
  const [formData, setFormData] = useState({
    metric1: { name: '', type: 'boolean', goal: 1, color: '#007AFF', widgetType: 'ring' },
    metric2: { name: '', type: 'number', goal: 10, color: '#34C759', widgetType: 'sparkline' },
    metric3: { name: '', type: 'number', goal: 5, color: '#FF9500', widgetType: 'bar' }
  });

  [span_1](start_span)// Implemented properly to handle updates (replacing unused placeholder)[span_1](end_span)
  const updateField = (metricKey, field, value) => {
    setFormData(prev => ({
      ...prev,
      [metricKey]: {
        ...prev[metricKey],
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

  [span_2](start_span)// Implements actual metric creation form for each step[span_2](end_span)
  const renderMetricForm = (metricKey) => {
    const data = formData[metricKey];
    return (
      <div className="flex flex-col gap-4 animate-fade-in">
        <div>
          <label className="text-xs font-bold text-secondary uppercase">Metric Name</label>
          <input 
            type="text" 
            value={data.name}
            onChange={(e) => updateField(metricKey, 'name', e.target.value)}
            placeholder="e.g. Morning Jog"
            className="w-full p-3 rounded-xl bg-bg-color border border-separator text-lg font-bold outline-none focus:border-blue"
          />
        </div>

        <div>
           <label className="text-xs font-bold text-secondary uppercase">Type</label>
           <div className="flex gap-2 mt-1">
             <button 
                onClick={() => updateField(metricKey, 'type', 'boolean')}
                className={`flex-1 py-2 rounded-lg font-bold text-sm transition-colors ${data.type === 'boolean' ? 'bg-blue text-white' : 'bg-bg-color border border-separator'}`}
             >
                Yes/No
             </button>
             <button 
                onClick={() => updateField(metricKey, 'type', 'number')}
                className={`flex-1 py-2 rounded-lg font-bold text-sm transition-colors ${data.type === 'number' ? 'bg-blue text-white' : 'bg-bg-color border border-separator'}`}
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
                 onClick={() => updateField(metricKey, 'color', c)}
                 style={{ backgroundColor: c }}
                 className={`w-8 h-8 rounded-full ${data.color === c ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
               />
             ))}
           </div>
        </div>
      </div>
    );
  };

  [span_3](start_span)// Implements goal setting form for step 4[span_3](end_span)
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
    <div className="flex items-center justify-center min-h-screen p-4 bg-bg-color">
      <div className="w-full max-w-md">
        <Glass>
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center border-b border-separator pb-4">
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

            [span_4](start_span){/* Replaced placeholder div with actual form inputs[span_4](end_span) */}
            <div className="min-h-[250px]">
              {currentStep < 3 ? renderMetricForm(steps[currentStep].key) : renderGoalForm()}
            </div>

            <div className="flex justify-between pt-4 border-t border-separator">
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className={`px-6 py-3 font-bold rounded-xl transition-colors ${currentStep === 0 ? 'text-secondary opacity-50 cursor-not-allowed' : 'text-primary hover:bg-bg-color'}`}
              >
                Back
              </button>
              <button
                onClick={nextStep}
                className="px-8 py-3 bg-blue text-white font-bold rounded-xl active:scale-95 transition-transform shadow-lg shadow-blue/20"
              >
                {currentStep === steps.length - 1 ? 'Launch ORBIT 🚀' : 'Next'}
              </button>
            </div>
          </div>
        </Glass>
      </div>
    </div>
  );
};
