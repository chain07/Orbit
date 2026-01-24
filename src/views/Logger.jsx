import React, { useState, useContext, useEffect } from 'react';
import SegmentedControl from '../components/ui/SegmentedControl';
import Glass from '../components/ui/Glass';
import { DailyCheckInForm } from '../components/logger/DailyCheckInForm';
import { TimeTracker } from '../components/logger/TimeTracker';
import { ActivityManager } from '../components/logger/ActivityManager';
import { Timeline } from '../components/logger/Timeline';
import { StorageContext } from '../context/StorageContext';
import { EmptyState } from '../components/ui/EmptyState';
import { Icons } from '../components/ui/Icons';
import '../styles/motion.css';

export const Logger = ({ initialMetricId = null }) => {
  const { metrics } = useContext(StorageContext);
  const [activeMode, setActiveMode] = useState('checkin');

  useEffect(() => {
    if (initialMetricId) {
      const metric = metrics.find(m => m.id === initialMetricId);
      if (metric) {
        if (metric.type === 'duration') {
          setActiveMode('tracker');
        } else {
           setActiveMode('checkin');
        }
      }
    }
  }, [initialMetricId, metrics]);

  const hasMetrics = metrics && metrics.length > 0;

  return (
    <div className="layout-padding fade-in">
      <div className="view-header-stack">
        <h1 className="text-3xl font-extrabold tracking-tight">Logger</h1>
        <p className="text-secondary font-medium">Input engine.</p>
        <div className="system-toggle-wrapper">
          <SegmentedControl
            options={[
              { label: 'Daily Check-In', value: 'checkin' },
              { label: 'Time Tracker', value: 'tracker' }
            ]}
            value={activeMode}
            onChange={setActiveMode}
          />
        </div>
      </div>

      <div className="layout-content flex flex-col gap-6">
        <div className="fade-in">
          {activeMode === 'checkin' ? (
            !hasMetrics ? (
              <EmptyState
                 icon={null}
                 title="No Metrics Configured"
                 message="You need to define what to track before you can log data."
              />
            ) : (
              <DailyCheckInForm />
            )
          ) : (
            <>
              <Glass className="p-4">
                 <TimeTracker metricId={initialMetricId} />
              </Glass>
              <div style={{ height: '24px' }} />
              <ActivityManager />
            </>
          )}
        </div>

        {hasMetrics && (
          <div className="flex flex-col gap-2 mt-4">
            <div className="section-label px-1 text-secondary font-bold text-xs uppercase">
              Today's Timeline
            </div>
            <Timeline />
          </div>
        )}
      </div>
    </div>
  );
};
