import React, { useState, useContext, useEffect } from 'react';
import SegmentedControl from '../components/ui/SegmentedControl';
import Glass from '../components/ui/Glass';
import { DailyCheckInForm } from '../components/logger/DailyCheckInForm';
import { TimeTracker } from '../components/logger/TimeTracker';
import { Timeline } from '../components/logger/Timeline';
import { StorageContext } from '../context/StorageContext';
import { EmptyState } from '../components/ui/EmptyState';
import '../styles/motion.css';

export const Logger = ({ initialMetricId = null }) => {
  const { metrics } = useContext(StorageContext);
  const [activeMode, setActiveMode] = useState('checkin');
  const [selectedTrackerMetric, setSelectedTrackerMetric] = useState('');

  // Handle Initial Metric Selection (from Quick Link)
  useEffect(() => {
    if (initialMetricId) {
      // Check if metric exists and determine mode
      const metric = metrics.find(m => m.id === initialMetricId);
      if (metric) {
        if (metric.type === 'duration') {
          setActiveMode('tracker');
          setSelectedTrackerMetric(initialMetricId);
        } else {
           setActiveMode('checkin');
        }
      }
    }
  }, [initialMetricId, metrics]);

  // Check if we have any metrics at all
  const hasMetrics = metrics && metrics.length > 0;

  // Filter metrics that make sense for time tracking
  const timeMetrics = metrics.filter(m => m.type === 'number' || m.type === 'duration');

  if (!hasMetrics) {
    return (
      <div className="flex flex-col gap-6 p-4 pb-32 fade-in">
        <div className="flex flex-col gap-1 safe-pt">
           <h1 className="text-3xl font-extrabold tracking-tight">Logger</h1>
           <p className="text-secondary font-medium">Input engine.</p>
        </div>
        <EmptyState 
           icon="📝"
           title="No Metrics Configured"
           message="You need to define what to track before you can log data."
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 pb-32 fade-in">
      {/* Header with Safe Padding */}
      <div className="flex flex-col gap-1 safe-pt">
        <h1 className="text-3xl font-extrabold tracking-tight">Logger</h1>
        <p className="text-secondary font-medium">Input engine.</p>
      </div>

      {/* Mode Switch - N-01: Ensured existence and styling */}
      <SegmentedControl
        options={[
          { label: 'Daily Check-In', value: 'checkin' },
          { label: 'Time Tracker', value: 'tracker' }
        ]}
        value={activeMode}
        onChange={setActiveMode}
      />

      {/* Mode Content */}
      <div className="fade-in">
        {activeMode === 'checkin' ? (
          <DailyCheckInForm />
        ) : (
          <Glass className="p-4">
            <div className="flex flex-col gap-4">
              <div className="text-sm font-bold text-secondary uppercase tracking-wide">
                Activity Tracker
              </div>
              
              {/* Activity Selector */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-secondary uppercase">Select Activity</label>
                <div className="relative">
                  <select
                    value={selectedTrackerMetric}
                    onChange={(e) => setSelectedTrackerMetric(e.target.value)}
                    className="w-full p-3 rounded-xl bg-bg-color border border-separator text-lg font-bold outline-none focus:border-blue appearance-none"
                  >
                    <option value="">Choose activity...</option>
                    {timeMetrics.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-secondary">
                    ▼
                  </div>
                </div>
              </div>

              {selectedTrackerMetric ? (
                 <div className="mt-2 p-6 bg-bg-color rounded-xl flex justify-center border border-separator border-opacity-50">
                   <TimeTracker metricId={selectedTrackerMetric} />
                 </div>
              ) : (
                <div className="text-center text-secondary opacity-60 italic py-8 border-2 border-dashed border-separator rounded-xl">
                  Select an activity above to start tracking time
                </div>
              )}
            </div>
          </Glass>
        )}
      </div>

      {/* Timeline Visualization */}
      <div className="flex flex-col gap-2 mt-4">
        <div className="section-label px-1 text-secondary font-bold text-xs uppercase">
          Today's Timeline
        </div>
        <Timeline />
      </div>
    </div>
  );
};
