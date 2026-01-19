import React, { useState } from 'react';
import { Glass } from '../ui/Glass';
import { Icons } from '../ui/Icons';
import { OrbitButton } from '../ui/OrbitButton';

export const MetricBuilder = ({ metric = null, onSave, onCancel }) => {
  const [form, setForm] = useState({
    id: metric?.id,
    name: metric?.name || '',
    label: metric?.label || '',
    type: metric?.type || 'number',
    goal: metric?.goal !== undefined ? metric.goal : 0,
    color: metric?.color || '#007AFF',
    widgetType: metric?.widgetType || 'ring',
    unit: metric?.unit || '',
    range: metric?.range || { min: 1, max: 10, step: 1 },
    options: metric?.options || [],
    config: metric?.config || {}
  });

  const [newOption, setNewOption] = useState('');

  const updateForm = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
  const updateConfig = (key, val) => setForm(prev => ({ ...prev, config: { ...prev.config, [key]: val } }));
  const updateRange = (key, val) => setForm(prev => ({ ...prev, range: { ...prev.range, [key]: parseFloat(val) } }));

  const handleAddOption = () => {
    if (newOption.trim()) {
      updateForm('options', [...form.options, newOption.trim()]);
      setNewOption('');
    }
  };

  const handleRemoveOption = (idx) => {
    updateForm('options', form.options.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    if (!form.name) return alert("Name is required");
    // Auto-generate label if missing
    const submission = {
      ...metric,
      ...form,
      label: form.label || form.name,
      // Ensure goal is null for types that don't use it to pass validation
      goal: (form.type === 'number' || form.type === 'duration') ? parseFloat(form.goal) : null
    };
    onSave(submission);
  };

  return (
    <Glass className="w-full max-w-lg flex flex-col bg-bg-color max-h-[90vh] overflow-hidden">
      {/* Header */}
      <div className="metric-modal-header">
        <h2 className="text-lg font-bold">{metric ? 'Edit Metric' : 'New Metric'}</h2>
        <button onClick={onCancel} className="btn-cancel-text">Cancel</button>
      </div>

      <div className="modal-content-scroll">

        {/* Core Identity */}
        <div>
            <label className="label-standard block">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={e => updateForm('name', e.target.value)}
              placeholder="e.g. Water Intake"
              className="input-standard"
            />
        </div>

        {/* Grid Row: Type + Color */}
        <div className="form-row">
             <div className="form-group">
                <label className="label-standard block">Type</label>
                <select
                  value={form.type}
                  onChange={e => updateForm('type', e.target.value)}
                  className="input-standard"
                >
                  <option value="number">Number</option>
                  <option value="boolean">Boolean</option>
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
                  value={form.color}
                  onChange={e => updateForm('color', e.target.value)}
                  className="input-color"
                />
             </div>
        </div>

        {/* Dynamic Type Configuration */}
        <div className="animate-fade-in">
            <div className="section-divider">Configuration</div>

            {/* NUMBER */}
            {form.type === 'number' && (
               <div className="form-row">
                    <div className="form-group">
                        <label className="label-standard block">Target Goal</label>
                        <input type="number" value={form.goal} onChange={e => updateForm('goal', e.target.value)} className="input-standard" />
                    </div>
                    <div className="form-group">
                        <label className="label-standard block">Unit</label>
                        <input type="text" value={form.unit} onChange={e => updateForm('unit', e.target.value)} placeholder="kg" className="input-standard" />
                    </div>
               </div>
            )}

            {/* BOOLEAN */}
            {form.type === 'boolean' && (
               <div className="form-row">
                  <div className="form-group">
                      <label className="label-standard block">"True" Label</label>
                      <input type="text" value={form.config?.trueLabel || 'Yes'} onChange={e => updateConfig('trueLabel', e.target.value)} className="input-standard" />
                  </div>
                  <div className="form-group">
                      <label className="label-standard block">"False" Label</label>
                      <input type="text" value={form.config?.falseLabel || 'No'} onChange={e => updateConfig('falseLabel', e.target.value)} className="input-standard" />
                  </div>
               </div>
            )}

            {/* DURATION */}
            {form.type === 'duration' && (
               <div className="flex flex-col gap-3">
                  <div>
                      <label className="label-standard block">Daily Goal (Hours)</label>
                      <input type="number" value={form.goal} onChange={e => updateForm('goal', e.target.value)} className="input-standard" />
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-separator">
                      <input
                        type="checkbox"
                        checked={form.config?.allowLaps || false}
                        onChange={e => updateConfig('allowLaps', e.target.checked)}
                        className="w-5 h-5 accent-blue"
                      />
                      <span className="font-medium">Allow Laps / Sessions</span>
                  </div>
               </div>
            )}

            {/* RANGE */}
            {form.type === 'range' && (
               <div className="flex flex-col gap-4">
                  <div className="form-row">
                      <div className="form-group">
                          <label className="label-standard block">Min Value</label>
                          <input type="number" value={form.range.min} onChange={e => updateRange('min', e.target.value)} className="input-standard" />
                      </div>
                      <div className="form-group">
                          <label className="label-standard block">Max Value</label>
                          <input type="number" value={form.range.max} onChange={e => updateRange('max', e.target.value)} className="input-standard" />
                      </div>
                      <div className="form-group" style={{ flex: 0.5 }}>
                          <label className="label-standard block">Step</label>
                          <input type="number" value={form.range.step} onChange={e => updateRange('step', e.target.value)} className="input-standard" />
                      </div>
                  </div>
                  <div className="form-row">
                      <div className="form-group">
                          <label className="label-standard block">Min Label (Optional)</label>
                          <input type="text" value={form.config?.minLabel || ''} onChange={e => updateConfig('minLabel', e.target.value)} placeholder="Low" className="input-standard" />
                      </div>
                      <div className="form-group">
                          <label className="label-standard block">Max Label (Optional)</label>
                          <input type="text" value={form.config?.maxLabel || ''} onChange={e => updateConfig('maxLabel', e.target.value)} placeholder="High" className="input-standard" />
                      </div>
                  </div>
               </div>
            )}

            {/* SELECT */}
            {form.type === 'select' && (
               <div className="flex flex-col gap-3">
                  <div className="flex gap-2">
                      <input
                        type="text"
                        value={newOption}
                        onChange={e => setNewOption(e.target.value)}
                        placeholder="Add option..."
                        className="input-standard flex-1"
                        onKeyDown={e => e.key === 'Enter' && handleAddOption()}
                      />
                      <OrbitButton onClick={handleAddOption} variant="secondary" className="!w-12 !px-0 !text-xl">+</OrbitButton>
                  </div>
                  <div className="flex flex-wrap gap-2">
                      {form.options.map((opt, idx) => (
                          <div key={idx} className="flex items-center gap-2 px-3 py-1 rounded-full bg-separator bg-opacity-20 border border-separator text-sm font-medium">
                              {opt}
                              <OrbitButton onClick={() => handleRemoveOption(idx)} variant="destructive" className="!w-8 !h-8 !p-0 !bg-transparent !text-red">×</OrbitButton>
                          </div>
                      ))}
                      {form.options.length === 0 && <span className="text-secondary italic text-sm">No options added.</span>}
                  </div>
               </div>
            )}

            {/* TEXT */}
            {form.type === 'text' && (
               <div className="flex flex-col gap-3">
                  <div>
                      <label className="label-standard block">Placeholder Prompt</label>
                      <input type="text" value={form.config?.placeholder || ''} onChange={e => updateConfig('placeholder', e.target.value)} placeholder="e.g. How are you feeling?" className="input-standard" />
                  </div>
                  <div>
                      <label className="label-standard block">Max Length (Optional)</label>
                      <input type="number" value={form.config?.maxLength || ''} onChange={e => updateConfig('maxLength', e.target.value)} placeholder="140" className="input-standard" />
                  </div>
               </div>
            )}
        </div>

        <div className="section-divider">Visualization</div>

        {/* Widget Style Select */}
        <div>
          <label className="label-standard block">Dashboard Widget</label>
          <select
            value={form.widgetType}
            onChange={e => updateForm('widgetType', e.target.value)}
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

      </div>

      <div className="modal-footer">
         <OrbitButton onClick={handleSave} variant="primary" className="w-full">
            {metric ? 'Update Metric' : 'Create Metric'}
         </OrbitButton>
      </div>
    </Glass>
  );
};
