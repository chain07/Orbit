import React, { useState } from 'react';
import { SegmentedControl } from '../ui/SegmentedControl';
import { DailyCheckInForm } from './DailyCheckInForm';
import { TimeTracker } from './TimeTracker';
import { Glass } from '../ui/Glass';

export const LoggerSegmentedView = () => {
  const [activeMode, setActiveMode] = useState('checkin');

  const modes = [
    { label: 'Daily Check-In', value: 'checkin' },
    { label: 'Time Tracker', value: 'tracker' }
  ];

  return (
    <div className="flex flex-col gap-4">
      <SegmentedControl
        options={modes}
        value={activeMode}
        onChange={setActiveMode}
      />

      <div className="fade-in">
        {activeMode === 'checkin' && <DailyCheckInForm />}
        {activeMode === 'tracker' && <TimeTracker />}
      </div>
    </div>
  );
};
