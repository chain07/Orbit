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

    let currentStart = manualStartTime;

    // Auto-set start time to NOW if missing
    if (!currentStart && val.trim().length > 0) {
        const now = new Date();
        currentStart = toLocalISOString(now);
        setManualStartTime(currentStart);
    }

    if (!currentStart) return;

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
        const start = new Date(currentStart);
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
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '1rem' }}>
      
      {/* 1. Mode Toggle */}
      <SegmentedControl
        options={[{ label: 'Stopwatch', value: 'timer' }, { label: 'Manual Entry', value: 'manual' }]}
        value={mode}
        onChange={setMode}
      />

      {/* 2. Activity Selector */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label className="text-secondary uppercase" style={{ fontSize: '12px', fontWeight: 'bold', marginLeft: '4px' }}>Activity</label>
        <div style={{ position: 'relative' }}>
          <select
            value={selectedMetricId}
            onChange={(e) => setSelectedMetricId(e.target.value)}
            className="input-standard"
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: 'var(--bg-color)',
              border: '1px solid var(--separator)',
              borderRadius: '14px',
              fontWeight: 'bold',
              fontSize: '1.125rem',
              outline: 'none',
              appearance: 'none',
              WebkitAppearance: 'none',
              MozAppearance: 'none',
              backgroundImage: 'none',
              paddingRight: '24px'
            }}
          >
            <option value="">Select Activity...</option>
            {trackableMetrics.length > 0 ? (
              trackableMetrics.map(m => (
                <option key={m.id} value={m.id}>{m.label || m.name}</option>
              ))
            ) : (
              <option value="" disabled>No activities - Create below ↓</option>
            )}
          </select>
          <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-secondary)' }}>
            <Icons.ChevronDown size={14} />
          </div>
        </div>
      </div>

      {/* 3. Main Interface */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          backgroundColor: 'var(--bg-color)',
          border: '1px dashed var(--separator)',
          borderRadius: '14px',
          minHeight: '220px'
        }}
      >
        
        {mode === 'timer' ? (
          <>
            {/* Timer Display */}
            <div
              style={{
                fontFamily: 'monospace',
                fontVariantNumeric: 'tabular-nums',
                textAlign: 'center',
                width: '100%',
                fontSize: '3.5rem',
                fontWeight: '900',
                letterSpacing: '-0.05em',
                marginBottom: '2rem'
              }}
            >
              {formatTimer(elapsed)}
            </div>
            
            {/* Controls */}
            <div style={{ display: 'flex', width: '100%', gap: '12px' }}>
              {elapsed === 0 ? (
                <OrbitButton
                  onClick={() => setRunning(true)}
                  variant="primary"
                  className="!shadow-none"
                  style={{ flex: 1, '--color-primary': 'var(--green)' }}
                >
                  Start
                </OrbitButton>
              ) : (
                <>
                  <OrbitButton
                    onClick={() => setRunning(!running)}
                    variant="primary"
                    className="!text-white !shadow-none"
                    style={{ flex: 1, '--color-primary': running ? 'var(--orange)' : 'var(--green)' }}
                  >
                    {running ? 'Pause' : 'Resume'}
                  </OrbitButton>
                  
                  {!running && (
                    <OrbitButton
                      onClick={handleSave}
                      variant="primary"
                      style={{ flex: 1 }}
                    >
                      Save
                    </OrbitButton>
                  )}
                  
                  {!running && (
                    <OrbitButton
                      onClick={() => { setElapsed(0); setStartTime(null); }}
                      variant="secondary"
                      icon={<Icons.RotateCcw size={20} />}
                      style={{ width: '48px', padding: 0 }}
                    />
                  )}
                </>
              )}
            </div>
          </>
        ) : (
          /* Manual Entry Inputs - Refactored Layout */
          <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>

            <div style={{
                border: '0.5px solid rgba(0,0,0,0.1)',
                borderRadius: '12px',
                overflow: 'hidden',
                marginBottom: '20px',
                backgroundColor: 'rgba(255,255,255,0.05)'
            }}>
                {/* Start Time Row */}
                <div style={{
                    borderBottom: '0.5px solid rgba(0,0,0,0.1)',
                    padding: '10px 14px'
                }}>
                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '700', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>Start Time</label>
                    <input
                        type="datetime-local"
                        value={manualStartTime}
                        onChange={(e) => setManualStartTime(e.target.value)}
                        style={{ width: '100%', border: 'none', background: 'transparent', fontSize: '16px', color: 'var(--text-primary)', outline: 'none', fontFamily: 'inherit' }}
                    />
                </div>

                {/* End Time Row */}
                <div style={{
                    padding: '10px 14px'
                }}>
                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '700', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>End Time</label>
                    <input
                        type="datetime-local"
                        value={manualEndTime}
                        onChange={(e) => setManualEndTime(e.target.value)}
                        style={{ width: '100%', border: 'none', background: 'transparent', fontSize: '16px', color: 'var(--text-primary)', outline: 'none', fontFamily: 'inherit' }}
                    />
                </div>
            </div>

            {/* Calculated/Editable Duration Field */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '16px' }}>
               <label className="text-secondary uppercase" style={{ fontSize: '12px', fontWeight: 'bold', marginLeft: '4px' }}>Duration (Hours/Mins)</label>
               <input
                 type="text"
                 value={durationDisplay}
                 onChange={handleDurationChange}
                 onFocus={() => setIsDurationFocused(true)}
                 onBlur={() => setIsDurationFocused(false)}
                 placeholder="e.g. 1.5, 90m, 1:30"
                 style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: 'var(--bg-color)',
                    border: '1px solid var(--separator)',
                    borderRadius: '14px',
                    fontFamily: 'monospace',
                    fontSize: '1.125rem',
                    color: 'var(--text-primary)',
                    outline: 'none'
                 }}
               />
            </div>
            
            <div style={{ overflow: 'hidden', borderRadius: '14px', width: '100%' }}>
              <OrbitButton
                onClick={handleSave}
                variant="primary"
                style={{ width: '100%' }}
              >
                Log Session
              </OrbitButton>
            </div>
          </div>
        )}
      </div>

      {/* 4. Notes Field */}
      <div>
          <label className="text-secondary uppercase" style={{ fontSize: '12px', fontWeight: 'bold', marginLeft: '4px' }}>Notes</label>
          <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Session notes..."
              style={{
                  width: '100%',
                  padding: '12px',
                  marginTop: '4px',
                  backgroundColor: 'var(--bg-color)',
                  border: '1px solid var(--separator)',
                  borderRadius: '14px',
                  outline: 'none',
                  minHeight: '80px',
                  fontFamily: 'inherit'
              }}
          />
      </div>
    </div>
  );
};
