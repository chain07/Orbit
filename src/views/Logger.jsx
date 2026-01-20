import React, { useState, useContext, useEffect } from 'react';
import SegmentedControl from '../components/ui/SegmentedControl';
import Glass from '../components/ui/Glass';
import { DailyCheckInForm } from '../components/logger/DailyCheckInForm';
import { TimeTracker } from '../components/logger/TimeTracker';
import { Timeline } from '../components/logger/Timeline';
import { StorageContext } from '../context/StorageContext';
import { NavigationContext } from '../context/NavigationContext';
import { EmptyState } from '../components/ui/EmptyState';
import { Icons } from '../components/ui/Icons';
import { OrbitButton } from '../components/ui/OrbitButton';
import '../styles/motion.css';

export const Logger = ({ initialMetricId = null }) => {
  const { metrics, addMetric } = useContext(StorageContext);
  const { setActiveTab } = useContext(NavigationContext);
  const [activeMode, setActiveMode] = useState('checkin');
  const [selectedTrackerMetric, setSelectedTrackerMetric] = useState('');
  const [newActivityName, setNewActivityName] = useState('');

  const handleAddActivity = () => {
    if (!newActivityName.trim()) return;
    const id = 'activity_' + Date.now();
    addMetric({
      id,
      name: newActivityName,
      type: 'duration',
      dashboardVisible: false,
      goal: 0,
      color: '#007AFF',
      widgetType: 'sparkline'
    });
    setNewActivityName('');
    setSelectedTrackerMetric(id);
  };

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

  return (
    <div className="flex flex-col gap-6 p-4 pb-32 fade-in">
      <div className="view-header-stack">
        <div className="flex flex-col gap-0">
          <h1 className="text-3xl font-extrabold tracking-tight leading-none">Logger</h1>
          <p className="text-secondary font-medium leading-tight mt-0">Input engine.</p>
        </div>

        <SegmentedControl
          options={[
            { label: 'Daily Check-In', value: 'checkin' },
            { label: 'Time Tracker', value: 'tracker' }
          ]}
          value={activeMode}
          onChange={setActiveMode}
          className="mt-4"
        />
      </div>

      {(!hasMetrics && activeMode === 'checkin') ? (
        <EmptyState 
           icon={<Icons.Edit3 size={48} className="text-secondary opacity-50" />}
           title="No Metrics Configured"
           message="You need to define what to track before you can log data."
           actionLabel="Create Metric"
           actionIcon={<Icons.Plus />}
           onAction={() => setActiveTab('System')}
        />
      ) : (
        <>
          <div className="fade-in">
            {activeMode === 'checkin' ? (
              <DailyCheckInForm />
            ) : (
              <Glass className="p-4">
                <div className="flex flex-col gap-4">
                  <div className="text-sm font-bold text-secondary uppercase tracking-wide">
                    Activity Tracker
                  </div>

                  {timeMetrics.length === 0 ? (
                    <div className="flex flex-col gap-3">
                      <label className="text-xs font-bold text-secondary uppercase">Create New Activity</label>
                      <div className="flex gap-2">
                         <input
                           type="text"
                           value={newActivityName}
                           onChange={(e) => setNewActivityName(e.target.value)}
                           placeholder="Activity Name"
                           className="flex-1 p-3 rounded-xl bg-bg-color border border-separator text-lg font-bold outline-none focus:border-blue"
                         />
                         <OrbitButton
                           onClick={handleAddActivity}
                           variant="primary"
                           className="!w-auto px-6"
                         >
                           Add
                         </OrbitButton>
                      </div>
                    </div>
                  ) : (
                    <>
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
                    </>
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
        </>
      )}
    </div>
  );
};
