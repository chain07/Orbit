import React, { useState, useEffect, useContext, useMemo } from 'react';
import { StorageContext } from '../../context/StorageContext';
import SegmentedControl from '../../components/ui/SegmentedControl';
import { Icons } from '../../components/ui/Icons';
import { OrbitButton } from '../ui/OrbitButton';

export const TimeTracker = ({ metricId }) => {
  const { metrics, addTimeLog, addMetric } = useContext(StorageContext);
  
  // State
  const [mode, setMode] = useState('manual'); // 'timer' | 'manual'
  const [selectedMetricId, setSelectedMetricId] = useState(metricId || '');
  const [newActivityName, setNewActivityName] = useState('');
  
  // Timer State
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0); // in seconds
  const [startTime, setStartTime] = useState(null); // Capture precise start time
  
  // Manual Entry State
  const [manualStartTime, setManualStartTime] = useState('');
  const [manualEndTime, setManualEndTime] = useState('');

  // Notes State (New for Phase 4.2)
  const [notes, setNotes] = useState('');

  // Sync prop if provided
  useEffect(() => {
    if (metricId) setSelectedMetricId(metricId);
  }, [metricId]);

  // Timer Logic
  useEffect(() => {
    let timer;
    if (running) {
      if (!startTime) setStartTime(new Date().toISOString()); // Set start time on first tick
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

  const handleCreateAndStart = () => {
    if (!newActivityName.trim()) return;

    const newMetric = {
        id: crypto.randomUUID(),
        name: newActivityName,
        label: newActivityName,
        type: 'duration',
        goal: 0,
        frequency: 'daily',
        dashboardVisible: false,
        color: '#007AFF'
    };

    addMetric(newMetric);
    setSelectedMetricId(newMetric.id);
    setRunning(true);
    setNewActivityName('');
  };

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

      // If timer was running, use the captured start time.
      // If paused/stopped, logic might vary, but simplified here:
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
    }

    // Phase 4.2 Update: Call addTimeLog instead of addLogEntry
    addTimeLog({
      activityId: selectedMetricId, // Using correct activityId (metricId)
      activityLabel: getSelectedMetricLabel(),
      startTime: finalStartTime,
      endTime: finalEndTime,
      duration: parseFloat(calculatedDuration.toFixed(2)),
      notes: notes
    });

    // Clear notes after save
    setNotes('');
  };

  return (
    <div className="flex flex-col w-full gap-4">
      
      {trackableMetrics.length === 0 ? (
        <div className="flex flex-col gap-4 p-6 bg-bg-color border border-separator border-dashed rounded-2xl items-center text-center animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-blue/10 flex items-center justify-center text-blue mb-2">
                <span className="text-2xl font-bold">+</span>
            </div>
            <div>
                <div className="font-bold text-lg">No Activities Found</div>
                <div className="text-secondary text-sm">Create a passive tracker to get started.</div>
            </div>
            <div className="flex gap-2 w-full mt-2">
                <input
                    type="text"
                    placeholder="Activity Name (e.g. Walking)"
                    value={newActivityName}
                    onChange={e => setNewActivityName(e.target.value)}
                    className="w-full p-3 bg-card border border-separator rounded-xl outline-none focus:border-blue flex-1"
                />
                <OrbitButton onClick={handleCreateAndStart} variant="primary">Start</OrbitButton>
            </div>
        </div>
      ) : (
        <>
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
        </>
      )}

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
          /* Manual Entry Inputs */
          <div className="flex flex-col w-full gap-6">
            <div className="flex flex-col gap-4 w-full">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-secondary uppercase ml-1">Start Time</label>
                <input
                  type="datetime-local"
                  value={manualStartTime}
                  onChange={(e) => setManualStartTime(e.target.value)}
                  className="w-full p-3 bg-card border border-separator rounded-xl font-bold text-lg outline-none focus:border-blue"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-secondary uppercase ml-1">End Time</label>
                <input
                  type="datetime-local"
                  value={manualEndTime}
                  onChange={(e) => setManualEndTime(e.target.value)}
                  className="w-full p-3 bg-card border border-separator rounded-xl font-bold text-lg outline-none focus:border-blue"
                />
              </div>
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

      {/* 4. Notes Field (New) */}
      <div>
          <label className="text-xs font-bold text-secondary uppercase ml-1">Notes</label>
          <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Session notes..."
              className="w-full p-3 mt-1 bg-bg-color border border-separator rounded-xl outline-none focus:border-blue min-h-[80px]"
          />
      </div>
    </div>
  );
};
