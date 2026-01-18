import React, { useState } from 'react';
import { Glass } from '../ui/Glass';
import { Icons } from '../ui/Icons'; // Assuming Icons exists or I remove if unused

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
      <div className="p-4 border-b border-separator flex justify-between items-center bg-bg-color sticky top-0 z-10">
        <h2 className="text-lg font-bold">{metric ? 'Edit Metric' : 'New Metric'}</h2>
        <button onClick={onCancel} className="text-blue font-bold active:opacity-50">Cancel</button>
      </div>

      <div className="p-4 flex flex-col gap-6 overflow-y-auto">

        {/* Core Identity */}
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs font-bold text-secondary uppercase mb-1 block">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={e => updateForm('name', e.target.value)}
              placeholder="e.g. Water Intake"
              className="w-full p-3 rounded-xl border border-separator bg-transparent text-lg font-bold outline-none focus:border-blue"
            />
          </div>

          <div className="flex gap-3">
             <div className="flex-1">
                <label className="text-xs font-bold text-secondary uppercase mb-1 block">Type</label>
                <select
                  value={form.type}
                  onChange={e => updateForm('type', e.target.value)}
                  className="w-full p-3 rounded-xl border border-separator bg-transparent outline-none font-medium appearance-none"
                >
                  <option value="number">Number</option>
                  <option value="boolean">Boolean</option>
                  <option value="duration">Duration</option>
                  <option value="range">Range</option>
                  <option value="select">Select</option>
                  <option value="text">Text</option>
                </select>
             </div>
             <div>
                <label className="text-xs font-bold text-secondary uppercase mb-1 block">Color</label>
                <input
                  type="color"
                  value={form.color}
                  onChange={e => updateForm('color', e.target.value)}
                  className="h-[46px] w-[50px] p-1 rounded-xl border border-separator bg-transparent cursor-pointer"
                />
             </div>
          </div>
        </div>

        <div className="h-px bg-separator opacity-50" />

        {/* Dynamic Type Configuration */}
        <div className="flex flex-col gap-4 animate-fade-in">
            <label className="text-xs font-bold text-secondary uppercase">Configuration</label>

            {/* NUMBER */}
            {form.type === 'number' && (
               <>
                 <div className="flex gap-3">
                    <div className="flex-1">
                        <label className="text-xs text-secondary mb-1 block">Target Goal</label>
                        <input type="number" value={form.goal} onChange={e => updateForm('goal', e.target.value)} className="w-full p-3 rounded-xl border border-separator bg-transparent" />
                    </div>
                    <div className="w-1/3">
                        <label className="text-xs text-secondary mb-1 block">Unit</label>
                        <input type="text" value={form.unit} onChange={e => updateForm('unit', e.target.value)} placeholder="kg" className="w-full p-3 rounded-xl border border-separator bg-transparent" />
                    </div>
                 </div>
               </>
            )}

            {/* BOOLEAN */}
            {form.type === 'boolean' && (
               <div className="flex gap-3">
                  <div className="flex-1">
                      <label className="text-xs text-secondary mb-1 block">"True" Label</label>
                      <input type="text" value={form.config?.trueLabel || 'Yes'} onChange={e => updateConfig('trueLabel', e.target.value)} className="w-full p-3 rounded-xl border border-separator bg-transparent" />
                  </div>
                  <div className="flex-1">
                      <label className="text-xs text-secondary mb-1 block">"False" Label</label>
                      <input type="text" value={form.config?.falseLabel || 'No'} onChange={e => updateConfig('falseLabel', e.target.value)} className="w-full p-3 rounded-xl border border-separator bg-transparent" />
                  </div>
               </div>
            )}

            {/* DURATION */}
            {form.type === 'duration' && (
               <div className="flex flex-col gap-3">
                  <div>
                      <label className="text-xs text-secondary mb-1 block">Daily Goal (Hours)</label>
                      <input type="number" value={form.goal} onChange={e => updateForm('goal', e.target.value)} className="w-full p-3 rounded-xl border border-separator bg-transparent" />
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
               <div className="flex flex-col gap-3">
                  <div className="flex gap-3">
                      <div className="flex-1">
                          <label className="text-xs text-secondary mb-1 block">Min Value</label>
                          <input type="number" value={form.range.min} onChange={e => updateRange('min', e.target.value)} className="w-full p-3 rounded-xl border border-separator bg-transparent" />
                      </div>
                      <div className="flex-1">
                          <label className="text-xs text-secondary mb-1 block">Max Value</label>
                          <input type="number" value={form.range.max} onChange={e => updateRange('max', e.target.value)} className="w-full p-3 rounded-xl border border-separator bg-transparent" />
                      </div>
                      <div className="w-1/4">
                          <label className="text-xs text-secondary mb-1 block">Step</label>
                          <input type="number" value={form.range.step} onChange={e => updateRange('step', e.target.value)} className="w-full p-3 rounded-xl border border-separator bg-transparent" />
                      </div>
                  </div>
                  <div className="flex gap-3">
                      <div className="flex-1">
                          <label className="text-xs text-secondary mb-1 block">Min Label (Optional)</label>
                          <input type="text" value={form.config?.minLabel || ''} onChange={e => updateConfig('minLabel', e.target.value)} placeholder="Low" className="w-full p-3 rounded-xl border border-separator bg-transparent" />
                      </div>
                      <div className="flex-1">
                          <label className="text-xs text-secondary mb-1 block">Max Label (Optional)</label>
                          <input type="text" value={form.config?.maxLabel || ''} onChange={e => updateConfig('maxLabel', e.target.value)} placeholder="High" className="w-full p-3 rounded-xl border border-separator bg-transparent" />
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
                        className="flex-1 p-3 rounded-xl border border-separator bg-transparent outline-none"
                        onKeyDown={e => e.key === 'Enter' && handleAddOption()}
                      />
                      <button onClick={handleAddOption} className="btn-secondary px-4">+</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                      {form.options.map((opt, idx) => (
                          <div key={idx} className="flex items-center gap-2 px-3 py-1 rounded-full bg-separator bg-opacity-20 border border-separator text-sm font-medium">
                              {opt}
                              <button onClick={() => handleRemoveOption(idx)} className="text-red font-bold">×</button>
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
                      <label className="text-xs text-secondary mb-1 block">Placeholder Prompt</label>
                      <input type="text" value={form.config?.placeholder || ''} onChange={e => updateConfig('placeholder', e.target.value)} placeholder="e.g. How are you feeling?" className="w-full p-3 rounded-xl border border-separator bg-transparent" />
                  </div>
                  <div>
                      <label className="text-xs text-secondary mb-1 block">Max Length (Optional)</label>
                      <input type="number" value={form.config?.maxLength || ''} onChange={e => updateConfig('maxLength', e.target.value)} placeholder="140" className="w-full p-3 rounded-xl border border-separator bg-transparent" />
                  </div>
               </div>
            )}
        </div>

        <div className="h-px bg-separator opacity-50" />

        {/* Widget Style Select */}
        <div>
          <label className="text-xs font-bold text-secondary uppercase mb-1 block">Dashboard Widget</label>
          <select
            value={form.widgetType}
            onChange={e => updateForm('widgetType', e.target.value)}
            className="w-full p-3 rounded-xl border border-separator bg-transparent outline-none font-medium appearance-none"
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

      <div className="p-4 border-t border-separator bg-bg-color">
         <button onClick={handleSave} className="btn-primary w-full shadow-lg shadow-blue/20">
            {metric ? 'Update Metric' : 'Create Metric'}
         </button>
      </div>
    </Glass>
  );
};
