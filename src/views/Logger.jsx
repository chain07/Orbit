// src/views/Logger.jsx
import React, { useContext, useState } from 'react';
import { StorageContext } from '../context/StorageContext';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { Glass } from '../components/ui/Glass';
import { StackedBar } from '../components/ui/StackedBar';

export const Logger = () => {
  const { metrics, logEntries, addLogEntry } = useContext(StorageContext);

  // Segment for filtering entries
  const [segment, setSegment] = useState('Daily');
  const segments = ['Daily', 'Weekly', 'Monthly'];

  // Track form state for new entry
  const [newEntry, setNewEntry] = useState({
    metricId: metrics.length > 0 ? metrics[0].id : '',
    value: ''
  });

  const handleAdd = () => {
    if (!newEntry.metricId || newEntry.value === '') return;
    addLogEntry({
      metricId: newEntry.metricId,
      value: parseFloat(newEntry.value),
      timestamp: new Date().toISOString()
    });
    setNewEntry({ ...newEntry, value: '' });
  };

  // Filter entries based on segment
  const filteredEntries = logEntries.filter(entry => {
    const now = new Date();
    const ts = new Date(entry.timestamp);
    if (segment === 'Daily') return ts.toDateString() === now.toDateString();
    if (segment === 'Weekly') {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay()); // Sunday
      return ts >= weekStart;
    }
    if (segment === 'Monthly') return ts.getMonth() === now.getMonth() && ts.getFullYear() === now.getFullYear();
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
      
      {/* Segment Filter */}
      <SegmentedControl
        options={segments}
        selected={segment}
        onSelect={setSegment}
      />

      {/* Add New Log Entry */}
      <Glass>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 16, fontWeight: 600 }}>Add Log Entry</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <select
              value={newEntry.metricId}
              onChange={e => setNewEntry({ ...newEntry, metricId: e.target.value })}
              style={{ flex: 1, padding: 6, borderRadius: 6, border: '1px solid #ccc' }}
            >
              {metrics.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
            <input
              type="number"
              value={newEntry.value}
              onChange={e => setNewEntry({ ...newEntry, value: e.target.value })}
              placeholder="Value"
              style={{ width: 80, padding: 6, borderRadius: 6, border: '1px solid #ccc' }}
            />
            <button onClick={handleAdd} style={{ padding: '6px 12px', borderRadius: 6, background: '#4f46e5', color: '#fff', fontWeight: 600 }}>Add</button>
          </div>
        </div>
      </Glass>

      {/* Recent Entries Chart */}
      {metrics.length > 0 && filteredEntries.length > 0 && (
        <Glass>
          <div style={{ fontSize: 16, fontWeight: 600 }}>Recent Entries</div>
          <StackedBar
            data={metrics.map(m => {
              const entriesForMetric = filteredEntries.filter(e => e.metricId === m.id);
              return {
                label: m.name,
                values: entriesForMetric.reduce((acc, curr, idx) => {
                  acc[`Entry ${idx + 1}`] = curr.value;
                  return acc;
                }, {})
              };
            })}
            colors={metrics.reduce((acc, m) => {
              acc[m.name] = m.color || '#8E8E93';
              return acc;
            }, {})}
          />
        </Glass>
      )}

    </div>
  );
};
