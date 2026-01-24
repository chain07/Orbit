import React, { useState, useContext } from 'react';
import { StorageContext } from '../../context/StorageContext';
import { Glass } from '../../components/ui/Glass';
import { OrbitButton } from '../ui/OrbitButton';
import '../../styles/metric_builder.css';

const WIDGET_DESCRIPTIONS = {
  ring: "Visualizes progress towards a daily numeric goal.",
  sparkline: "Shows the trajectory of values over the last 7 days.",
  heatmap: "Heatmap tracking for daily habits and completion.",
  stackedbar: "Breaks down total activity by category.",
  number: "Displays the raw total or latest value.",
  streak: "Highlights consecutive days of activity.",
  history: "A chronological list of all entries."
};

export const OnboardingWizard = ({ onComplete }) => {
  const { addMetric } = useContext(StorageContext);
  
  const steps = [
    { title: 'Define Your First Metric', key: 'metric1' },
    { title: 'Create Metric 2', key: 'metric2' },
    { title: 'Create Metric 3', key: 'metric3' },
    { title: 'Set Goals', key: 'goal' }
  ];

  const [currentStep, setCurrentStep] = useState(0);
  
  const [formData, setFormData] = useState({
    metric1: { name: '', type: 'boolean', goal: 1, color: '#007AFF', widgetType: 'heatmap' },
    metric2: { name: '', type: 'number', goal: 10, color: '#34C759', widgetType: 'sparkline' },
    metric3: { name: '', type: 'number', goal: 5, color: '#FF9500', widgetType: 'bar' }
  });

  const updateField = (metricSlot, field, value) => {
    setFormData(prev => {
        const newData = { ...prev };
        newData[metricSlot] = { ...prev[metricSlot], [field]: value };

        // Smart Default Logic (similar to MetricBuilder)
        if (field === 'type') {
            if (value === 'boolean') newData[metricSlot].widgetType = 'heatmap';
            if (value === 'number') newData[metricSlot].widgetType = 'ring';
        }
        return newData;
    });
  };

  const nextStep = () => {
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
    ['metric1', 'metric2', 'metric3'].forEach(key => {
      const m = formData[key];
      if (m.name) {
         addMetric({
             name: m.name,
             type: m.type,
             goal: parseFloat(m.goal),
             color: m.color,
             widgetType: m.widgetType,
             label: m.name
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

  const renderMetricForm = (metricSlot) => {
    const data = formData[metricSlot];
    return (
      <div className="flex flex-col gap-4 animate-fade-in">
        <div>
          <label className="label-standard block">METRIC NAME</label>
          <input 
            type="text" 
            value={data.name}
            onChange={(e) => updateField(metricSlot, 'name', e.target.value)}
            placeholder="e.g. Focus Time"
            className="input-standard"
          />
        </div>

        <div className="form-row">
           <div className="form-group">
              <label className="label-standard block">Type</label>
              <select
                value={data.type}
                onChange={(e) => updateField(metricSlot, 'type', e.target.value)}
                className="input-standard"
              >
                <option value="boolean">Yes/No (Habit)</option>
                <option value="number">Number (Count)</option>
              </select>
           </div>
           <div className="form-group-color">
              <label className="label-standard block">Color</label>
              <input
                type="color"
                value={data.color}
                onChange={(e) => updateField(metricSlot, 'color', e.target.value)}
                className="input-color"
              />
           </div>
        </div>
        
        {/* Widget Preview / Helper */}
        <div className="visualization-section">
             <div className="section-divider">Visualization</div>
             <div className="widget-helper-text">
                {WIDGET_DESCRIPTIONS[data.widgetType] || "Tracks your progress."}
             </div>
        </div>
      </div>
    );
  };

  const renderGoalForm = () => {
    const numericMetrics = ['metric1', 'metric2', 'metric3'].filter(k => formData[k].type === 'number' && formData[k].name);
    
    if (numericMetrics.length === 0) {
      return (
        <div className="text-center py-8 text-secondary">
          <div className="text-3xl mb-2">✨</div>
          <p>All set!</p>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-4 animate-fade-in">
        {numericMetrics.map(key => (
          <div key={key}>
            <label className="label-standard block">{formData[key].name} Goal</label>
            <input 
              type="number" 
              value={formData[key].goal}
              onChange={(e) => updateField(key, 'goal', e.target.value)}
              className="input-standard"
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <Glass className="w-full max-w-lg flex flex-col bg-bg-color max-h-[90vh] overflow-hidden !p-0">
        <div className="metric-modal-header">
            <h2 className="metric-modal-title">Define your first 3 metrics</h2>
            <div className="text-xs text-secondary font-bold">Step {currentStep + 1}/{steps.length}</div>
        </div>

        <div className="modal-content-scroll">
            {currentStep < 3 ? renderMetricForm(steps[currentStep].key) : renderGoalForm()}
        </div>

        <div className="modal-footer flex flex-col gap-3">
             <div className="flex gap-3">
                <OrbitButton
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    variant="secondary"
                    className={`flex-1 ${currentStep === 0 ? 'opacity-0 pointer-events-none' : ''}`}
                >
                    Back
                </OrbitButton>
                <OrbitButton
                    onClick={nextStep}
                    variant="primary"
                    className="flex-1"
                >
                    {currentStep === steps.length - 1 ? 'Launch ORBIT 🚀' : 'Next'}
                </OrbitButton>
             </div>

             <button onClick={handleSkip} className="text-xs text-secondary underline hover:text-primary mx-auto pb-1">
                Skip Setup
             </button>
        </div>
    </Glass>
  );
};
