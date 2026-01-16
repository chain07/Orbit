import React, { useContext, useState } from 'react';
import { StorageContext } from '../context/StorageContext';
import SegmentedControl from '../components/ui/SegmentedControl';
import Glass from '../components/ui/Glass';
import { DailyCheckInForm } from '../components/logger/DailyCheckInForm';
import { TimeTracker } from '../components/logger/TimeTracker';
import { Timeline } from '../components/logger/Timeline';
import '../styles/motion.css';

export const Logger = () => {
  const { metrics, addLogEntry } = useContext(StorageContext);
  
  // View State
  const [activeMode, setActiveMode] = useState('checkin'); // 'checkin' | 'tracker'
  
  // Tracker State
  const [trackerMetricId, setTrackerMetricId] = useState('');
  const [manualDuration, setManualDuration] = useState('');

  const modes = [
    { label: 'Daily Check-In', value: 'checkin' },
    { label: 'Time Tracker', value: 'tracker' }
  ];

  // Filter metrics for the Time Tracker (usually Number/Duration types)
  const timeMetrics = metrics.filter(m => m.type === 'number' || m.type === 'duration');

  const handleManualLog = () => {
    if (!trackerMetricId || !manualDuration) return;
    
    addLogEntry({
      metricId: trackerMetricId,
      value: parseFloat(manualDuration),
      timestamp: new Date().toISOString()
    });
    setManualDuration('');
  };

  return (
    <div className="flex flex-col gap-6 p-4 pb-32 fade-in">
      
      {/* Header */}
      <div className="flex flex-col gap-1 mt-2">
         <h1 className="text-3xl font-extrabold tracking-tight">Logger</h1>
         <p className="text-secondary font-medium">Input engine.</p>
      </div>

      {/* Main Mode Switch */}
      <SegmentedControl
        options={modes}
        value={activeMode}
        onChange={setActiveMode}
      />

      {/* MODE: DAILY CHECK-IN */}
      {activeMode === 'checkin' && (
        <div className="animate-fade-in">
          <DailyCheckInForm />
        </div>
      )}

      {/* MODE: TIME TRACKER */}
      {activeMode === 'tracker' && (
        <div className="flex flex-col gap-4 animate-fade-in">
          <Glass className="p-4">
            <div className="flex flex-col gap-4">
              <div className="text-sm font-bold text-secondary uppercase tracking-wide">
                Active Session
              </div>

              {timeMetrics.length > 0 ? (
                <>
                  {/* Metric Selector */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-secondary">Select Activity</label>
                    <div className="relative">
                      <select
                        value={trackerMetricId}
                        onChange={(e) => setTrackerMetricId(e.target.value)}
                        className="w-full p-3 rounded-xl bg-bg-color border border-separator text-lg font-bold appearance-none outline-none focus:border-blue"
                      >
                        <option value="" disabled>Choose metric...</option>
                        {timeMetrics.map(m => (
                          <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none opacity-50">
                        ▼
                      </div>
                    </div>
                  </div>

                  {trackerMetricId ? (
                    <div className="flex flex-col gap-6 mt-2">
                      {/* Stopwatch Component */}
                      <div className="p-4 rounded-xl bg-bg-color border border-separator flex flex-col items-center justify-center gap-2">
                        <span className="text-xs font-bold text-secondary uppercase">Stopwatch</span>
                        <TimeTracker metricKey={trackerMetricId} />
                      </div>

                      {/* Manual Entry Fallback */}
                      <div className="border-t border-separator pt-4">
                        <div className="text-xs font-bold text-secondary uppercase mb-2">Manual Log</div>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={manualDuration}
                            onChange={(e) => setManualDuration(e.target.value)}
                            placeholder="Hours (e.g. 1.5)"
                            className="flex-1 p-3 rounded-xl bg-bg-color border border-separator font-bold outline-none"
                          />
                          <button 
                            onClick={handleManualLog}
                            disabled={!manualDuration}
                            className="px-6 py-3 rounded-xl bg-blue text-white font-bold disabled:opacity-50 active:scale-95 transition-transform"
                          >
                            Log
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-secondary italic opacity-60">
                      Select an activity above to start tracking.
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-4 text-secondary">
                  No duration metrics found. Go to System to add numeric metrics.
                </div>
              )}
            </div>
          </Glass>
        </div>
      )}

      {/* TIMELINE VISUALIZATION (Shared across modes) */}
      <div className="flex flex-col gap-2 mt-2">
        <div className="text-sm font-bold text-secondary uppercase tracking-wide px-1">
          Today's Stream
        </div>
        <Timeline />
      </div>
    </div>
  );
};
