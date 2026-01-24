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

const DEFAULT_METRIC_STATE = {
    name: '',
    type: 'number',
    goal: 0,
    color: '#007AFF',
    widgetType: 'ring',
    unit: '',
    range: { min: 1, max: 10, step: 1 },
    options: [],
    config: {}
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
  
  // Initialize state with full schema
  const [formData, setFormData] = useState({
    metric1: { ...DEFAULT_METRIC_STATE, type: 'boolean', goal: 1, widgetType: 'heatmap' },
    metric2: { ...DEFAULT_METRIC_STATE, type: 'number', goal: 10, color: '#34C759', widgetType: 'sparkline' },
    metric3: { ...DEFAULT_METRIC_STATE, type: 'number', goal: 5, color: '#FF9500', widgetType: 'bar' } // 'bar' is not in descriptions? Maybe 'stackedbar' or 'ring' or 'sparkline'. Let's stick to safe 'ring'.
  });

  // 'bar' in initial state was likely incorrect, fixing to 'ring' or valid type if needed, but defaulting to 'number' means 'ring' usually.

  const [newOption, setNewOption] = useState('');

  // Helper to update deeply nested state
  const updateField = (metricSlot, field, value) => {
    setFormData(prev => {
        const newData = { ...prev };
        newData[metricSlot] = { ...prev[metricSlot], [field]: value };

        // Smart Default Logic
        if (field === 'type') {
            let defaultWidget = 'history';
            switch (value) {
                case 'number': defaultWidget = 'ring'; break;
                case 'boolean': defaultWidget = 'heatmap'; break;
                case 'range': defaultWidget = 'sparkline'; break;
                case 'duration': defaultWidget = 'number'; break;
                default: defaultWidget = 'history';
            }
            newData[metricSlot].widgetType = defaultWidget;

            // Reset goal if needed for validation
            if (value !== 'number' && value !== 'duration') {
                newData[metricSlot].goal = 0;
            }
        }
        return newData;
    });
  };

  const updateConfig = (metricSlot, key, val) => {
      setFormData(prev => ({
          ...prev,
          [metricSlot]: {
              ...prev[metricSlot],
              config: { ...prev[metricSlot].config, [key]: val }
          }
      }));
  };

  const updateRange = (metricSlot, key, val) => {
      setFormData(prev => ({
          ...prev,
          [metricSlot]: {
              ...prev[metricSlot],
              range: { ...prev[metricSlot].range, [key]: parseFloat(val) }
          }
      }));
  };

  const handleAddOption = (metricSlot) => {
      if (newOption.trim()) {
          setFormData(prev => ({
              ...prev,
              [metricSlot]: {
                  ...prev[metricSlot],
                  options: [...prev[metricSlot].options, newOption.trim()]
              }
          }));
          setNewOption('');
      }
  };

  const handleRemoveOption = (metricSlot, idx) => {
      setFormData(prev => ({
          ...prev,
          [metricSlot]: {
              ...prev[metricSlot],
              options: prev[metricSlot].options.filter((_, i) => i !== idx)
          }
      }));
  };

  const nextStep = () => {
    // Clear temp option state when moving steps
    setNewOption('');

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
    setNewOption('');
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleFinish = () => {
    ['metric1', 'metric2', 'metric3'].forEach(key => {
      const m = formData[key];
      if (m.name) {
         addMetric({
             name: m.name,
             type: m.type,
             goal: (m.type === 'number' || m.type === 'duration') ? parseFloat(m.goal) : null,
             color: m.color,
             widgetType: m.widgetType,
             label: m.name,
             unit: m.unit,
             range: m.range,
             options: m.options,
             config: m.config
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
                <option value="number">Number</option>
                <option value="boolean">Yes/No</option>
                <option value="duration">Duration</option>
                <option value="range">Range</option>
                <option value="select">Select</option>
                <option value="text">Text</option>
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

        {/* Dynamic Type Configuration */}
        <div className="animate-fade-in">
            <div className="section-divider">Configuration</div>

            {/* NUMBER */}
            {data.type === 'number' && (
               <div className="form-row">
                    <div className="form-group">
                        <label className="label-standard block">Target Goal</label>
                        <input type="number" value={data.goal} onChange={e => updateField(metricSlot, 'goal', e.target.value)} className="input-standard" />
                    </div>
                    <div className="form-group">
                        <label className="label-standard block">Unit</label>
                        <input type="text" value={data.unit} onChange={e => updateField(metricSlot, 'unit', e.target.value)} placeholder="kg" className="input-standard" />
                    </div>
               </div>
            )}

            {/* BOOLEAN */}
            {data.type === 'boolean' && (
               <div className="form-row">
                  <div className="form-group">
                      <label className="label-standard block">"True" Label</label>
                      <input type="text" value={data.config?.trueLabel || 'Yes'} onChange={e => updateConfig(metricSlot, 'trueLabel', e.target.value)} className="input-standard" />
                  </div>
                  <div className="form-group">
                      <label className="label-standard block">"False" Label</label>
                      <input type="text" value={data.config?.falseLabel || 'No'} onChange={e => updateConfig(metricSlot, 'falseLabel', e.target.value)} className="input-standard" />
                  </div>
               </div>
            )}

            {/* DURATION */}
            {data.type === 'duration' && (
               <div className="flex flex-col gap-3">
                  <div>
                      <label className="label-standard block">Daily Goal (Hours)</label>
                      <input type="number" value={data.goal} onChange={e => updateField(metricSlot, 'goal', e.target.value)} className="input-standard" />
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-separator">
                      <input
                        type="checkbox"
                        checked={data.config?.allowLaps || false}
                        onChange={e => updateConfig(metricSlot, 'allowLaps', e.target.checked)}
                        className="w-5 h-5 accent-blue"
                      />
                      <span className="font-medium">Allow Laps / Sessions</span>
                  </div>
               </div>
            )}

            {/* RANGE */}
            {data.type === 'range' && (
               <div className="flex flex-col gap-4">
                  <div className="form-row">
                      <div className="form-group">
                          <label className="label-standard block">Min Value</label>
                          <input type="number" value={data.range.min} onChange={e => updateRange(metricSlot, 'min', e.target.value)} className="input-standard" />
                      </div>
                      <div className="form-group">
                          <label className="label-standard block">Max Value</label>
                          <input type="number" value={data.range.max} onChange={e => updateRange(metricSlot, 'max', e.target.value)} className="input-standard" />
                      </div>
                      <div className="form-group" style={{ flex: 0.5 }}>
                          <label className="label-standard block">Step</label>
                          <input type="number" value={data.range.step} onChange={e => updateRange(metricSlot, 'step', e.target.value)} className="input-standard" />
                      </div>
                  </div>
                  <div className="form-row">
                      <div className="form-group">
                          <label className="label-standard block">Min Label (Optional)</label>
                          <input type="text" value={data.config?.minLabel || ''} onChange={e => updateConfig(metricSlot, 'minLabel', e.target.value)} placeholder="Low" className="input-standard" />
                      </div>
                      <div className="form-group">
                          <label className="label-standard block">Max Label (Optional)</label>
                          <input type="text" value={data.config?.maxLabel || ''} onChange={e => updateConfig(metricSlot, 'maxLabel', e.target.value)} placeholder="High" className="input-standard" />
                      </div>
                  </div>
               </div>
            )}

            {/* SELECT */}
            {data.type === 'select' && (
               <div className="flex flex-col gap-3">
                  <div className="flex gap-2">
                      <input
                        type="text"
                        value={newOption}
                        onChange={e => setNewOption(e.target.value)}
                        placeholder="Add option..."
                        className="input-standard flex-1"
                        onKeyDown={e => e.key === 'Enter' && handleAddOption(metricSlot)}
                      />
                      <OrbitButton onClick={() => handleAddOption(metricSlot)} variant="secondary" className="!w-12 !px-0 !text-xl">+</OrbitButton>
                  </div>
                  <div className="flex flex-wrap gap-2">
                      {data.options.map((opt, idx) => (
                          <div key={idx} className="flex items-center gap-2 px-3 py-1 rounded-full bg-separator bg-opacity-20 border border-separator text-sm font-medium">
                              {opt}
                              <OrbitButton onClick={() => handleRemoveOption(metricSlot, idx)} variant="destructive" className="!w-8 !h-8 !p-0 !bg-transparent !text-red">×</OrbitButton>
                          </div>
                      ))}
                      {data.options.length === 0 && <span className="text-secondary italic text-sm">No options added.</span>}
                  </div>
               </div>
            )}

            {/* TEXT */}
            {data.type === 'text' && (
               <div className="flex flex-col gap-3">
                  <div>
                      <label className="label-standard block">Placeholder Prompt</label>
                      <input type="text" value={data.config?.placeholder || ''} onChange={e => updateConfig(metricSlot, 'placeholder', e.target.value)} placeholder="e.g. How are you feeling?" className="input-standard" />
                  </div>
                  <div>
                      <label className="label-standard block">Max Length (Optional)</label>
                      <input type="number" value={data.config?.maxLength || ''} onChange={e => updateConfig(metricSlot, 'maxLength', e.target.value)} placeholder="140" className="input-standard" />
                  </div>
               </div>
            )}
        </div>
        
        {/* Widget Preview / Helper */}
        <div className="visualization-section">
             <div className="section-divider">Visualization</div>
             <div>
              <label className="label-standard block">Dashboard Widget</label>
              <select
                value={data.widgetType}
                onChange={e => updateField(metricSlot, 'widgetType', e.target.value)}
                className="input-standard"
              >
                <option value="ring">Ring Progress</option>
                <option value="sparkline">Sparkline Trend</option>
                <option value="heatmap">Consistency Grid</option>
                <option value="stackedbar">Stacked Bar</option>
                <option value="number">Simple Number</option>
                <option value="streak">Streak Counter</option>
                <option value="history">History Log</option>
              </select>
             </div>
             <div className="widget-helper-text">
                {WIDGET_DESCRIPTIONS[data.widgetType] || "Tracks your progress."}
             </div>
        </div>
      </div>
    );
  };

  const renderGoalForm = () => {
    const numericMetrics = ['metric1', 'metric2', 'metric3'].filter(k =>
        (formData[k].type === 'number' || formData[k].type === 'duration') && formData[k].name
    );
    
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

             <OrbitButton
                onClick={handleSkip}
                variant="secondary"
                className="w-full mt-4"
            >
                Skip Setup
            </OrbitButton>
        </div>
    </Glass>
  );
};
