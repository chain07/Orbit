// src/components/ui/MetricBuilder.jsx
import React, { useState } from 'react';
import { Glass } from './Glass';

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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ fontSize: 16, fontWeight: 600 }}>{metric ? 'Edit Metric' : 'New Metric'}</div>
        
        <input
          type="text"
          value={form.name}
          onChange={e => handleChange('name', e.target.value)}
          placeholder="Metric Name"
          style={{ padding: 6, borderRadius: 6, border: '1px solid #ccc' }}
        />

        <select
          value={form.type}
          onChange={e => handleChange('type', e.target.value)}
          style={{ padding: 6, borderRadius: 6, border: '1px solid #ccc' }}
        >
          <option value="number">Number</option>
          <option value="boolean">Boolean</option>
          <option value="duration">Duration</option>
        </select>

        {form.type === 'number' && (
          <input
            type="number"
            value={form.goal}
            onChange={e => handleChange('goal', parseFloat(e.target.value))}
            placeholder="Goal"
            style={{ padding: 6, borderRadius: 6, border: '1px solid #ccc' }}
          />
        )}

        <input
          type="color"
          value={form.color}
          onChange={e => handleChange('color', e.target.value)}
          style={{ width: 60, height: 30, border: 'none', padding: 0 }}
        />

        <select
          value={form.widgetType}
          onChange={e => handleChange('widgetType', e.target.value)}
          style={{ padding: 6, borderRadius: 6, border: '1px solid #ccc' }}
        >
          <option value="ring">Ring</option>
          <option value="sparkline">Sparkline</option>
          <option value="heatmap">HeatMap</option>
          <option value="stackedbar">StackedBar</option>
        </select>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleSave} style={{ padding: '6px 12px', borderRadius: 6, background: '#4f46e5', color: '#fff', fontWeight: 600 }}>Save</button>
          <button onClick={onCancel} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #ccc' }}>Cancel</button>
        </div>
      </div>
    </Glass>
  );
};
