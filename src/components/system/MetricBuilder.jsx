import React, { useState } from 'react';
import { Glass } from '../ui/Glass';

export const MetricBuilder = ({ metric = null, onSave, onCancel }) => {
  const [form, setForm] = useState({
    name: metric?.name || '',
    type: metric?.type || 'number', // number, boolean, duration, etc.
    goal: metric?.goal || 0,
    color: metric?.color || '#4f46e5',
    widgetType: metric?.widgetType || 'ring'
  });

  const handleChange = (field, value) => setForm({ ...form, [field]: value });

  const handleSave = () => {
    if (!form.name) return alert("Name is required");
    if (form.type === 'number' && (form.goal === null || isNaN(form.goal))) return alert("Goal must be a number");
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
          </select>

          <input
            type="color"
            value={form.color}
            onChange={e => handleChange('color', e.target.value)}
            className="h-10 w-14 p-0 border-none bg-transparent"
          />
        </div>

        {form.type === 'number' && (
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
