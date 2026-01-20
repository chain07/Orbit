import React, { useState, useContext, useEffect } from 'react';
import SegmentedControl from '../components/ui/SegmentedControl';
import Glass from '../components/ui/Glass';
import { DailyCheckInForm } from '../components/logger/DailyCheckInForm';
import { TimeTracker } from '../components/logger/TimeTracker';
import { Timeline } from '../components/logger/Timeline';
import { StorageContext } from '../context/StorageContext';
import { MetricBuilder } from '../components/system/MetricBuilder';
import { EmptyState } from '../components/ui/EmptyState';
import { Icons } from '../components/ui/Icons';
import { OrbitButton } from '../components/ui/OrbitButton';
import '../styles/motion.css';

export const Logger = ({ initialMetricId = null }) => {
  const { metrics, addMetric, updateMetric } = useContext(StorageContext);
  const [activeMode, setActiveMode] = useState('checkin');
  const [selectedTrackerMetric, setSelectedTrackerMetric] = useState('');
  const [showBuilder, setShowBuilder] = useState(false);

  useEffect(() => {
    if (initialMetricId) {
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

  const hasMetrics = metrics && metrics.length > 0;
  const timeMetrics = metrics.filter(m => m.type === 'number' || m.type === 'duration');

  const handleSaveMetric = (metric) => {
    if (!metric.id) {
       metric.id = metric.label.toLowerCase().replace(/\s+/g, '_') + '_' + Math.random().toString(36).substr(2, 5);
       addMetric(metric);
    } else {
       updateMetric(metric);
    }
    setShowBuilder(false);
  };

  return (
    <div className="flex flex-col gap-6 p-4 pb-32 fade-in">
      <div className="view-header-stack">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Logger</h1>
          <p className="text-secondary font-medium system-subheader">Input engine.</p>
        </div>

        <SegmentedControl
          options={[
            { label: 'Daily Check-In', value: 'checkin' },
            { label: 'Time Tracker', value: 'tracker' }
          ]}
          value={activeMode}
          onChange={setActiveMode}
        />
      </div>

      {/* Persistent Create Activity Action */}
      {hasMetrics && (
        <div className="flex justify-end -mt-4">
             <button
                onClick={() => setShowBuilder(true)}
                className="text-xs font-bold text-blue flex items-center gap-1 bg-blue/10 px-3 py-1.5 rounded-full hover:bg-blue/20 transition-colors"
             >
                 <span className="text-lg leading-none">+</span> New Activity
             </button>
        </div>
      )}

      <div className="fade-in">
        {activeMode === 'checkin' ? (
          !hasMetrics ? (
            <Glass className="p-8 flex flex-col items-center justify-center text-center gap-4">
                <div className="w-16 h-16 rounded-full bg-blue/10 flex items-center justify-center text-blue">
                    <Icons.Activity size={32} />
                </div>
                <div>
                    <h3 className="font-bold text-xl text-primary">Start Tracking</h3>
                    <p className="text-secondary text-sm mt-1 max-w-[240px] mx-auto">
                        Create your first activity to begin logging your progress.
                    </p>
                </div>
                <OrbitButton
                    onClick={() => setShowBuilder(true)}
                    variant="primary"
                    className="!w-auto px-8"
                >
                    Create Activity
                </OrbitButton>
            </Glass>
          ) : (
            <DailyCheckInForm />
          )
        ) : (
          <Glass className="p-4">
            <div className="flex flex-col gap-4">
              <div className="text-sm font-bold text-secondary uppercase tracking-wide">
                Activity Tracker
              </div>
              
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

      <div className="flex flex-col gap-2 mt-4">
        <div className="section-label px-1 text-secondary font-bold text-xs uppercase">
          Today's Timeline
        </div>
        <Timeline />
      </div>

      {showBuilder && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4 animate-fade-in">
          <MetricBuilder
            onSave={handleSaveMetric}
            onCancel={() => setShowBuilder(false)}
          />
        </div>
      )}
    </div>
  );
};
