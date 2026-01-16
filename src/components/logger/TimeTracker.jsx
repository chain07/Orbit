import React, { useState, useEffect, useContext, useMemo } from 'react';
import { StorageContext } from '../../context/StorageContext';
import { RotateCcw } from 'lucide-react';

export const TimeTracker = ({ metricKey }) => {
  const { metrics, addLogEntry } = useContext(StorageContext);
  
  // State
  const [mode, setMode] = useState('timer'); // 'timer' | 'manual'
  const [selectedMetricId, setSelectedMetricId] = useState(metricKey || '');
  
  // Timer State
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0); // in seconds
  
  // Manual Entry State
  const [manualHours, setManualHours] = useState('');
  const [manualMinutes, setManualMinutes] = useState('');

  // Sync prop if provided
  useEffect(() => {
    if (metricKey) setSelectedMetricId(metricKey);
  }, [metricKey]);

  // Timer Logic
  useEffect(() => {
    let timer;
    if (running) {
      timer = setInterval(() => setElapsed(prev => prev + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [running]);

  // Format Helper: HH:MM:SS
  const formatTimer = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  // Filter for duration-compatible metrics
  const trackableMetrics = useMemo(() => 
    metrics.filter(m => m.type === 'duration' || m.type === 'number'), 
  [metrics]);

  const handleSave = () => {
    if (!selectedMetricId) {
      alert("Please select an activity first.");
      return;
    }

    let valueToLog = 0;

    if (mode === 'timer') {
      if (elapsed === 0) return;
      valueToLog = elapsed / 3600; // Save as hours
      setElapsed(0);
      setRunning(false);
    } else {
      const h = parseFloat(manualHours) || 0;
      const m = parseFloat(manualMinutes) || 0;
      if (h === 0 && m === 0) return;
      valueToLog = h + (m / 60);
      setManualHours('');
      setManualMinutes('');
    }

    // Save to TimeLog via StorageContext
    addLogEntry({
      metricId: selectedMetricId,
      value: parseFloat(valueToLog.toFixed(2)),
      timestamp: new Date().toISOString()
    });
  };

  return (
    <div className="flex flex-col w-full gap-4">
      
      {/* 1. Mode Toggle */}
      <div className="flex p-1 bg-separator bg-opacity-20 rounded-lg">
        <button
          onClick={() => setMode('timer')}
          className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${
            mode === 'timer' ? 'bg-card text-primary shadow-sm' : 'text-secondary'
          }`}
        >
          Timer
        </button>
        <button
          onClick={() => setMode('manual')}
          className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${
            mode === 'manual' ? 'bg-card text-primary shadow-sm' : 'text-secondary'
          }`}
        >
          Manual Entry
        </button>
      </div>

      {/* 2. Activity Selector */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold text-secondary uppercase ml-1">Activity</label>
        <div className="relative">
          <select
            value={selectedMetricId}
            onChange={(e) => setSelectedMetricId(e.target.value)}
            className="w-full p-3 bg-bg-color border border-separator rounded-xl font-bold text-lg outline-none focus:border-blue appearance-none"
          >
            <option value="">Select Activity...</option>
            {trackableMetrics.map(m => (
              <option key={m.id} value={m.id}>{m.label || m.name}</option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-secondary text-xs">
            ▼
          </div>
        </div>
      </div>

      {/* 3. Main Interface */}
      <div className="flex flex-col items-center justify-center p-6 bg-bg-color border border-separator border-dashed rounded-2xl min-h-[220px]">
        
        {mode === 'timer' ? (
          <>
            {/* Timer Display */}
            <div className="text-6xl font-mono font-black tracking-tighter mb-8 tabular-nums">
              {formatTimer(elapsed)}
            </div>
            
            {/* Controls */}
            <div className="flex w-full gap-3">
              {elapsed === 0 ? (
                <button 
                  onClick={() => setRunning(true)}
                  className="flex-1 py-4 bg-green text-white rounded-xl font-bold text-lg btn-ios shadow-lg shadow-green/20"
                >
                  Start
                </button>
              ) : (
                <>
                  <button 
                    onClick={() => setRunning(!running)}
                    className={`flex-1 py-4 rounded-xl font-bold text-lg btn-ios shadow-lg ${
                      running ? 'bg-orange text-white shadow-orange/20' : 'bg-green text-white shadow-green/20'
                    }`}
                  >
                    {running ? 'Pause' : 'Resume'}
                  </button>
                  
                  {!running && (
                    <button 
                      onClick={handleSave}
                      className="flex-1 py-4 bg-blue text-white rounded-xl font-bold text-lg btn-ios shadow-lg shadow-blue/20"
                    >
                      Save
                    </button>
                  )}
                  
                  {!running && (
                    <button 
                      onClick={() => setElapsed(0)}
                      className="px-4 py-4 border border-separator text-secondary rounded-xl font-bold btn-ios bg-white"
                    >
                      <RotateCcw size={20} />
                    </button>
                  )}
                </>
              )}
            </div>
          </>
        ) : (
          /* Manual Entry Inputs */
          <div className="flex flex-col w-full gap-6">
            <div className="flex items-center justify-center gap-4">
              <div className="flex flex-col items-center gap-2">
                <input
                  type="number"
                  placeholder="0"
                  value={manualHours}
                  onChange={(e) => setManualHours(e.target.value)}
                  className="w-24 h-20 text-center text-4xl font-bold bg-card border border-separator rounded-2xl outline-none focus:border-blue"
                />
                <span className="text-xs font-bold text-secondary uppercase">Hours</span>
              </div>
              <span className="text-4xl font-bold text-separator pb-6">:</span>
              <div className="flex flex-col items-center gap-2">
                <input
                  type="number"
                  placeholder="0"
                  value={manualMinutes}
                  onChange={(e) => setManualMinutes(e.target.value)}
                  className="w-24 h-20 text-center text-4xl font-bold bg-card border border-separator rounded-2xl outline-none focus:border-blue"
                />
                <span className="text-xs font-bold text-secondary uppercase">Mins</span>
              </div>
            </div>
            
            <button
              onClick={handleSave}
              className="w-full py-4 bg-blue text-white rounded-xl font-bold text-lg btn-ios shadow-lg shadow-blue/20"
            >
              Save Entry
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
