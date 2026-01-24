import React, { useState, useEffect, useContext, useMemo } from 'react';
import { StorageContext } from '../../context/StorageContext';
import SegmentedControl from '../../components/ui/SegmentedControl';
import { Icons } from '../../components/ui/Icons';
import { OrbitButton } from '../ui/OrbitButton';

const toLocalISOString = (date) => {
  const pad = (n) => n.toString().padStart(2, '0');
  return date.getFullYear() +
      '-' + pad(date.getMonth() + 1) +
      '-' + pad(date.getDate()) +
      'T' + pad(date.getHours()) +
      ':' + pad(date.getMinutes());
};

export const TimeTracker = ({ metricId }) => {
  const { metrics, addTimeLog } = useContext(StorageContext);
  
  // State
  const [mode, setMode] = useState('manual'); // 'timer' | 'manual'
  const [selectedMetricId, setSelectedMetricId] = useState(metricId || '');
  
  // Timer State
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0); // in seconds
  const [startTime, setStartTime] = useState(null); // Capture precise start time
  
  // Manual Entry State
  const [manualStartTime, setManualStartTime] = useState('');
  const [manualEndTime, setManualEndTime] = useState('');
  const [durationDisplay, setDurationDisplay] = useState('');
  const [isDurationFocused, setIsDurationFocused] = useState(false);

  // Notes State
  const [notes, setNotes] = useState('');

  // Sync prop if provided
  useEffect(() => {
    if (metricId) setSelectedMetricId(metricId);
  }, [metricId]);

  // Calculate Duration Display (Only if not focused to avoid fighting user input)
  useEffect(() => {
    if (isDurationFocused) return;

    if (manualStartTime && manualEndTime) {
      const start = new Date(manualStartTime);
      const end = new Date(manualEndTime);
      if (end > start) {
        const diff = end - start;
        const totalMinutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(totalMinutes / 60);
        const mins = totalMinutes % 60;
        setDurationDisplay(`${hours}h ${mins}m`);
      } else {
        setDurationDisplay(''); // Invalid or negative
      }
    } else {
      setDurationDisplay('');
    }
  }, [manualStartTime, manualEndTime, isDurationFocused]);

  // Handle Manual Duration Edit
  const handleDurationChange = (e) => {
    const val = e.target.value;
    setDurationDisplay(val);

    if (!manualStartTime) return;

    let minutes = 0;
    // 1. HH:MM
    if (val.includes(':')) {
        const parts = val.split(':');
        const h = parseInt(parts[0] || '0', 10);
        const m = parseInt(parts[1] || '0', 10);
        minutes = h * 60 + m;
    }
    // 2. '90m' or '90 min'
    else if (val.toLowerCase().includes('m')) {
        minutes = parseFloat(val);
    }
    // 3. Decimal hours '1.5' or '1'
    else {
        minutes = parseFloat(val) * 60;
    }

    if (!isNaN(minutes) && minutes > 0) {
        const start = new Date(manualStartTime);
        const newEnd = new Date(start.getTime() + minutes * 60000);
        setManualEndTime(toLocalISOString(newEnd));
    }
  };

  // Timer Logic
  useEffect(() => {
    let timer;
    if (running) {
      if (!startTime) setStartTime(new Date().toISOString());
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

  const getSelectedMetricLabel = () => {
      const m = metrics.find(metric => metric.id === selectedMetricId);
      return m ? (m.label || m.name) : 'Unknown Activity';
  };

  const handleSave = () => {
    if (!selectedMetricId) {
      alert("Please select an activity first.");
      return;
    }

    let calculatedDuration = 0;
    let finalStartTime = new Date().toISOString();
    let finalEndTime = new Date().toISOString();

    if (mode === 'timer') {
      if (elapsed === 0) return;
      calculatedDuration = elapsed / 3600; // Hours
      finalStartTime = startTime || new Date(Date.now() - elapsed * 1000).toISOString();
      finalEndTime = new Date().toISOString();

      setElapsed(0);
      setRunning(false);
      setStartTime(null);
    } else {
      if (!manualStartTime || !manualEndTime) {
        alert("Please enter both start and end times.");
        return;
      }

      finalStartTime = new Date(manualStartTime).toISOString();
      finalEndTime = new Date(manualEndTime).toISOString();

      const start = new Date(finalStartTime);
      const end = new Date(finalEndTime);

      if (end <= start) {
        alert("End time must be after start time.");
        return;
      }

      calculatedDuration = (end - start) / (1000 * 60 * 60); // Hours

      setManualStartTime('');
      setManualEndTime('');
      setDurationDisplay('');
    }

    addTimeLog({
      activityId: selectedMetricId,
      activityLabel: getSelectedMetricLabel(),
      startTime: finalStartTime,
      endTime: finalEndTime,
      duration: parseFloat(calculatedDuration.toFixed(2)),
      notes: notes
    });

    setNotes('');
  };

  return (
    <div className="flex flex-col w-full gap-4">
      
      {/* 1. Mode Toggle */}
      <SegmentedControl
        options={[{ label: 'Stopwatch', value: 'timer' }, { label: 'Manual Entry', value: 'manual' }]}
        value={mode}
        onChange={setMode}
      />

      {/* 2. Activity Selector */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold text-secondary uppercase ml-1">Activity</label>
        <div className="relative">
          <select
            value={selectedMetricId}
            onChange={(e) => setSelectedMetricId(e.target.value)}
            className="w-full p-3 bg-bg-color border border-separator rounded-[14px] font-bold text-lg outline-none focus:border-blue appearance-none"
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
      <div className="flex flex-col items-center justify-center p-6 bg-bg-color border border-separator border-dashed rounded-[14px] min-h-[220px]">
        
        {mode === 'timer' ? (
          <>
            {/* Timer Display */}
            <div className="text-6xl font-mono font-black tracking-tighter mb-8 tabular-nums">
              {formatTimer(elapsed)}
            </div>
            
            {/* Controls */}
            <div className="flex w-full gap-3">
              {elapsed === 0 ? (
                <OrbitButton
                  onClick={() => setRunning(true)}
                  variant="primary"
                  className="flex-1 !bg-green !shadow-none"
                  style={{ backgroundColor: 'var(--green)' }}
                >
                  Start
                </OrbitButton>
              ) : (
                <>
                  <OrbitButton
                    onClick={() => setRunning(!running)}
                    variant="primary"
                    className="flex-1 !text-white !shadow-none"
                    style={{ backgroundColor: running ? 'var(--orange)' : 'var(--green)' }}
                  >
                    {running ? 'Pause' : 'Resume'}
                  </OrbitButton>
                  
                  {!running && (
                    <OrbitButton
                      onClick={handleSave}
                      variant="primary"
                      className="flex-1"
                    >
                      Save
                    </OrbitButton>
                  )}
                  
                  {!running && (
                    <OrbitButton
                      onClick={() => { setElapsed(0); setStartTime(null); }}
                      variant="secondary"
                      className="!w-12 !px-0"
                      icon={<Icons.RotateCcw size={20} />}
                    />
                  )}
                </>
              )}
            </div>
          </>
        ) : (
          /* Manual Entry Inputs - Refactored Layout */
          <div className="flex flex-col w-full gap-6">

            <div className="flex w-full gap-3"> {/* gap-3 */}
              <div className="flex flex-col gap-1 flex-1"> {/* flex-1 */}
                <label className="text-xs font-bold text-secondary uppercase ml-1">Start Time</label>
                <input
                  type="datetime-local"
                  value={manualStartTime}
                  onChange={(e) => setManualStartTime(e.target.value)}
                  className="w-full p-3 bg-card border border-separator rounded-[14px] font-bold text-sm outline-none focus:border-blue"
                />
              </div>

              <div className="flex flex-col gap-1 flex-1"> {/* flex-1 */}
                <label className="text-xs font-bold text-secondary uppercase ml-1">End Time</label>
                <input
                  type="datetime-local"
                  value={manualEndTime}
                  onChange={(e) => setManualEndTime(e.target.value)}
                  className="w-full p-3 bg-card border border-separator rounded-[14px] font-bold text-sm outline-none focus:border-blue"
                />
              </div>
            </div>

            {/* Calculated/Editable Duration Field */}
            <div className="flex flex-col gap-1">
               <label className="text-xs font-bold text-secondary uppercase ml-1">Duration (Hours/Mins)</label>
               <input
                 type="text"
                 value={durationDisplay}
                 onChange={handleDurationChange}
                 onFocus={() => setIsDurationFocused(true)}
                 onBlur={() => setIsDurationFocused(false)}
                 placeholder="e.g. 1.5, 90m, 1:30"
                 className="w-full p-3 bg-bg-color border border-separator rounded-[14px] font-mono text-lg text-primary outline-none focus:border-blue"
               />
            </div>
            
            <div className="overflow-hidden rounded-[14px] w-full">
              <OrbitButton
                onClick={handleSave}
                variant="primary"
                className="w-full"
              >
                Log Session
              </OrbitButton>
            </div>
          </div>
        )}
      </div>

      {/* 4. Notes Field */}
      <div>
          <label className="text-xs font-bold text-secondary uppercase ml-1">Notes</label>
          <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Session notes..."
              className="w-full p-3 mt-1 bg-bg-color border border-separator rounded-[14px] outline-none focus:border-blue min-h-[80px]"
          />
      </div>
    </div>
  );
};
