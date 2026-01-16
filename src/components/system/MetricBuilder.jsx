import React, { useState } from 'react';
import { Glass } from '../ui/Glass';

export const MetricBuilder = ({ metric = null, onSave, onCancel }) => {
  const [form, setForm] = useState({
    name: metric?.name || '',
    type: metric?.type || 'number', // number, boolean, duration, range, select, text
    goal: metric?.goal || 0,
    color: metric?.color || '#4f46e5',
    widgetType: metric?.widgetType || 'ring',
    range: metric?.range || { min: 1, max: 10, step: 1 },
    options: metric?.options || []
  });

  // Local state for adding new options in Select mode
  const [newOption, setNewOption] = useState('');

  const handleChange = (field, value) => setForm({ ...form, [field]: value });

  const handleRangeChange = (field, value) => {
      setForm({ ...form, range: { ...form.range, [field]: parseFloat(value) } });
  };

  const handleAddOption = () => {
      if (newOption.trim()) {
          setForm(prev => ({ ...prev, options: [...prev.options, newOption.trim()] }));
          setNewOption('');
      }
  };

  const handleRemoveOption = (idx) => {
      setForm(prev => ({ ...prev, options: prev.options.filter((_, i) => i !== idx) }));
  };

  const handleSave = () => {
    if (!form.name) return alert("Name is required");
    if ((form.type === 'number' || form.type === 'duration') && (form.goal === null || isNaN(form.goal))) return alert("Goal must be a number");
    onSave({ ...metric, ...form });
  };

  return (
    <Glass>
      <div className="flex flex-col gap-3">
        <div className="text-lg font-bold">{metric ? 'Edit Metric' : 'New Metric'}</div>
        
        <input
          type="text"
          value={form.name}
          onChange={e => handleChange('name', e.target.value)}
          placeholder="Metric Name"
          className="p-2 rounded border border-separator bg-transparent text-lg"
        />

        <div className="flex gap-2">
          <select
            value={form.type}
            onChange={e => handleChange('type', e.target.value)}
            className="flex-1 p-2 rounded border border-separator bg-transparent"
          >
            <option value="number">Number</option>
            <option value="boolean">Boolean</option>
            <option value="duration">Duration</option>
            <option value="range">Range</option>
            <option value="select">Select</option>
            <option value="text">Text</option>
          </select>

          <input
            type="color"
            value={form.color}
            onChange={e => handleChange('color', e.target.value)}
            className="h-10 w-14 p-0 border-none bg-transparent"
          />
        </div>

        {/* GOAL INPUT (Number, Duration) */}
        {(form.type === 'number' || form.type === 'duration') && (
          <div className="flex flex-col gap-1">
            <label className="text-xs text-secondary uppercase font-bold">Daily Goal</label>
            <input
              type="number"
              value={form.goal}
              onChange={e => handleChange('goal', parseFloat(e.target.value))}
              placeholder="Goal"
              className="p-2 rounded border border-separator bg-transparent"
            />
          </div>
        )}

        {/* RANGE INPUTS */}
        {form.type === 'range' && (
            <div className="flex gap-2">
                <div className="flex-1 flex flex-col gap-1">
                    <label className="text-xs text-secondary uppercase font-bold">Min</label>
                    <input type="number" value={form.range.min} onChange={e => handleRangeChange('min', e.target.value)} className="p-2 rounded border border-separator bg-transparent" />
                </div>
                <div className="flex-1 flex flex-col gap-1">
                    <label className="text-xs text-secondary uppercase font-bold">Max</label>
                    <input type="number" value={form.range.max} onChange={e => handleRangeChange('max', e.target.value)} className="p-2 rounded border border-separator bg-transparent" />
                </div>
                <div className="flex-1 flex flex-col gap-1">
                    <label className="text-xs text-secondary uppercase font-bold">Step</label>
                    <input type="number" value={form.range.step} onChange={e => handleRangeChange('step', e.target.value)} className="p-2 rounded border border-separator bg-transparent" />
                </div>
            </div>
        )}

        {/* SELECT OPTIONS INPUTS */}
        {form.type === 'select' && (
            <div className="flex flex-col gap-2">
                <label className="text-xs text-secondary uppercase font-bold">Options</label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newOption}
                        onChange={e => setNewOption(e.target.value)}
                        placeholder="Add option..."
                        className="flex-1 p-2 rounded border border-separator bg-transparent"
                        onKeyDown={e => e.key === 'Enter' && handleAddOption()}
                    />
                    <button onClick={handleAddOption} className="px-3 py-2 bg-blue text-white rounded font-bold">+</button>
                </div>
                <div className="flex flex-wrap gap-2 mt-1">
                    {form.options.map((opt, idx) => (
                        <div key={idx} className="flex items-center gap-1 px-2 py-1 bg-card border border-separator rounded-full text-sm">
                            <span>{opt}</span>
                            <button onClick={() => handleRemoveOption(idx)} className="text-red font-bold ml-1">×</button>
                        </div>
                    ))}
                </div>
            </div>
        )}

        <div className="flex flex-col gap-1">
          <label className="text-xs text-secondary uppercase font-bold">Widget Style</label>
          <select
            value={form.widgetType}
            onChange={e => handleChange('widgetType', e.target.value)}
            className="p-2 rounded border border-separator bg-transparent"
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

        <div className="flex gap-2 mt-2">
          <button 
            onClick={handleSave} 
            className="flex-1 py-2 rounded bg-blue text-white font-bold"
          >
            Save
          </button>
          <button 
            onClick={onCancel} 
            className="flex-1 py-2 rounded border border-separator font-bold text-secondary"
          >
            Cancel
          </button>
        </div>
      </div>
    </Glass>
  );
};
