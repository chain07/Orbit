import React, { useContext, useState, useMemo } from 'react';
import { StorageContext } from '../context/StorageContext';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { Glass } from '../components/ui/Glass';
// CRITICAL FIX: Correct import path
import { StackedBar } from '../components/ui/charts/StackedBar';
import '../styles/motion.css';

export const Logger = () => {
  const { metrics, logEntries, addLogEntry } = useContext(StorageContext);
  
  // State
  const [segment, setSegment] = useState('Daily');
  const segments = ['Daily', 'Weekly', 'Monthly'];
  
  const [newEntry, setNewEntry] = useState({
    metricId: metrics.length > 0 ? metrics[0].id : '',
    value: ''
  });

  const handleAdd = () => {
    if (!newEntry.metricId || newEntry.value === '') return;
    
    // Auto-select the next metric or stay on current? 
    // Staying on current allows rapid entry of same metric.
    addLogEntry({
      metricId: newEntry.metricId,
      value: parseFloat(newEntry.value),
      timestamp: new Date().toISOString()
    });
    setNewEntry({ ...newEntry, value: '' });
  };

  // Helper to filter entries
  const filteredEntries = useMemo(() => {
    const now = new Date();
    return logEntries.filter(entry => {
      const ts = new Date(entry.timestamp);
      if (segment === 'Daily') return ts.toDateString() === now.toDateString();
      if (segment === 'Weekly') {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - 7); 
        return ts >= weekStart;
      }
      if (segment === 'Monthly') return ts.getMonth() === now.getMonth() && ts.getFullYear() === now.getFullYear();
      return true;
    });
  }, [logEntries, segment]);

  // Refactored Chart Data Construction
  const chartData = useMemo(() => {
    if (!metrics.length || !filteredEntries.length) return null;

    const entries = metrics.map(m => {
      const entriesForMetric = filteredEntries.filter(e => e.metricId === m.id);
      // Group values into a single object for the StackedBar expectation
      const values = entriesForMetric.reduce((acc, curr, idx) => {
        // StackedBar expects keys for segments, here we treat individual entries as segments
        // Limiting to last 10 to prevent chart explosion
        if (idx < 10) acc[`${idx}`] = curr.value; 
        return acc;
      }, {});
      
      return {
        label: m.name, // The X-Axis label (Metric Name)
        values: values // The stack segments
      };
    });

    const colors = metrics.reduce((acc, m) => {
      acc[m.name] = m.color || '#8E8E93';
      return acc;
    }, {});

    return { entries, colors };
  }, [metrics, filteredEntries]);

  return (
    <div className="flex flex-col gap-6 p-4 pb-32 fade-in">
      
      {/* Header */}
      <div className="flex flex-col gap-1 mt-2">
         <h1 className="text-3xl font-extrabold tracking-tight">Logger</h1>
         <p className="text-secondary font-medium">Input engine.</p>
      </div>

      <SegmentedControl
        options={segments.map(s => ({ label: s, value: s }))}
        value={segment}
        onChange={setSegment}
      />

      {/* INPUT CARD */}
      <Glass className="p-4">
        <div className="flex flex-col gap-4">
          <div className="text-sm font-bold text-secondary uppercase tracking-wide">Quick Entry</div>
          
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <select
                value={newEntry.metricId}
                onChange={e => setNewEntry({ ...newEntry, metricId: e.target.value })}
                className="w-full p-4 rounded-xl bg-bg-color border-none text-lg font-bold appearance-none focus:ring-2 ring-blue outline-none"
              >
                {metrics.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
              {/* Custom arrow could go here */}
            </div>
            
            <input
              type="number"
              value={newEntry.value}
              onChange={e => setNewEntry({ ...newEntry, value: e.target.value })}
              placeholder="0.0"
              className="w-24 p-4 rounded-xl bg-bg-color border-none text-lg font-bold text-center focus:ring-2 ring-blue outline-none"
            />
          </div>
          
          <button 
            onClick={handleAdd} 
            className="w-full py-4 rounded-xl bg-blue text-white font-bold text-lg active:scale-95 transition-transform"
          >
            Log Entry
          </button>
        </div>
      </Glass>

      {/* VISUALIZATION */}
      {chartData && (
        <Glass className="p-4">
          <div className="text-sm font-bold text-secondary uppercase tracking-wide mb-4">Recent Distribution</div>
          <StackedBar
            data={chartData.entries}
            colors={chartData.colors}
            height={200}
          />
        </Glass>
      )}

      {/* History List (Fall back if no chart data) */}
      {!chartData && (
        <div className="text-center text-secondary opacity-50 py-10 font-medium">
          No logs found for this period.
        </div>
      )}
    </div>
  );
};
