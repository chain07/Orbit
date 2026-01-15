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
    <div className="flex flex-col gap-4 p-4">
      
      {/* Segment Filter */}
      <SegmentedControl
        options={segments}
        selected={segment}
        onSelect={setSegment}
      />

      {/* Add New Log Entry */}
      <Glass>
        <div className="flex flex-col gap-3">
          <div className="text-lg font-bold">Add Log Entry</div>
          <div className="flex gap-2">
            <select
              value={newEntry.metricId}
              onChange={e => setNewEntry({ ...newEntry, metricId: e.target.value })}
              className="flex-1 p-2 rounded border border-separator bg-transparent"
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
              className="w-20 p-2 rounded border border-separator bg-transparent"
            />
            <button onClick={handleAdd} className="py-2 px-3 rounded bg-blue text-white font-bold">Add</button>
          </div>
        </div>
      </Glass>

      {/* Recent Entries Chart */}
      {metrics.length > 0 && filteredEntries.length > 0 && (
        <Glass>
          <div className="text-lg font-bold mb-4">Recent Entries</div>
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
