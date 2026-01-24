import React, { useState, useContext } from 'react';
import { StorageContext } from '../../context/StorageContext';
import { OrbitButton } from '../ui/OrbitButton';
import { Icons } from '../../components/ui/Icons';
import Glass from '../ui/Glass';

export const ActivityManager = () => {
  const { metrics, addMetric } = useContext(StorageContext);
  const [isCreating, setIsCreating] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [color, setColor] = useState('#007AFF');
  const [hasGoal, setHasGoal] = useState(false);
  const [goalValue, setGoalValue] = useState(0);

  // Filter for duration metrics
  const activities = metrics.filter(m => m.type === 'duration');

  const handleSave = () => {
    if (!name.trim()) {
      alert("Please enter an activity name.");
      return;
    }

    const finalGoal = hasGoal ? parseFloat(goalValue) : 0;

    addMetric({
      type: 'duration',
      name: name,
      label: name,
      color: color,
      goal: finalGoal,
      frequency: 'daily', // Default frequency
      status: 'active'
    });

    // Reset and close
    setName('');
    setColor('#007AFF');
    setHasGoal(false);
    setGoalValue(0);
    setIsCreating(false);
  };

  return (
    <Glass className="p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg text-primary">Manage Activities</h3>
        {!isCreating && (
          <OrbitButton
            onClick={() => setIsCreating(true)}
            variant="secondary"
            className="!w-auto !h-8 !px-3 text-xs"
          >
            New
          </OrbitButton>
        )}
      </div>

      {/* List or Form */}
      {isCreating ? (
        <div className="flex flex-col gap-4 p-4 bg-bg-color rounded-[14px] border border-separator">
          {/* 1. Name */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-secondary uppercase ml-1">Activity Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Coding, Reading"
              className="w-full p-3 bg-card border border-separator rounded-[14px] font-bold text-lg outline-none focus:border-blue"
            />
          </div>

          {/* 2. Color */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-secondary uppercase ml-1">Color</label>
            <div className="relative w-full h-12">
               <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
               />
               <div
                  className="w-full h-full rounded-[14px] border border-separator flex items-center justify-center font-bold text-white shadow-sm"
                  style={{ backgroundColor: color }}
               >
                  {color.toUpperCase()}
               </div>
            </div>
          </div>

          {/* 3. Goal Toggle */}
          <div className="flex flex-col gap-3">
             <div className="flex items-center justify-between">
                <span className="font-bold text-primary">Track as Goal?</span>
                <div
                  onClick={() => setHasGoal(!hasGoal)}
                  className={`w-12 h-7 rounded-full relative transition-colors cursor-pointer ${hasGoal ? 'bg-green' : 'bg-separator'}`}
                  style={{ backgroundColor: hasGoal ? 'var(--green)' : 'var(--separator)' }}
                >
                   <div
                      className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${hasGoal ? 'left-6' : 'left-1'}`}
                   />
                </div>
             </div>

             {hasGoal && (
               <div className="flex flex-col gap-1 fade-in">
                 <label className="text-xs font-bold text-secondary uppercase ml-1">Daily Goal (Hours)</label>
                 <input
                   type="number"
                   value={goalValue}
                   onChange={(e) => setGoalValue(e.target.value)}
                   className="w-full p-3 bg-card border border-separator rounded-[14px] font-mono text-lg outline-none focus:border-blue"
                   step="0.1"
                   min="0"
                 />
               </div>
             )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-2">
             <OrbitButton
               onClick={() => setIsCreating(false)}
               variant="secondary"
               className="flex-1"
             >
               Cancel
             </OrbitButton>
             <OrbitButton
               onClick={handleSave}
               variant="primary"
               className="flex-1"
             >
               Save Activity
             </OrbitButton>
          </div>
        </div>
      ) : (
        /* Activity List */
        <div className="flex flex-col gap-2">
           {activities.length === 0 ? (
             <div className="p-4 text-center text-secondary text-sm bg-bg-color rounded-[14px] border border-dashed border-separator">
               No activities found. Create one to start tracking time.
             </div>
           ) : (
             activities.map(act => (
               <div key={act.id} className="flex items-center justify-between p-3 bg-bg-color rounded-[14px] border border-separator">
                  <div className="flex items-center gap-3">
                     <div
                       className="w-3 h-3 rounded-full"
                       style={{ backgroundColor: act.color }}
                     />
                     <span className="font-bold text-primary">{act.label}</span>
                  </div>

                  {act.goal > 0 ? (
                    <div className="px-2 py-1 bg-blue/10 text-blue text-xs font-bold rounded-md" style={{ color: 'var(--blue)', backgroundColor: 'rgba(0,122,255,0.1)' }}>
                      Target: {act.goal}h
                    </div>
                  ) : (
                    <div className="px-2 py-1 bg-separator/20 text-secondary text-xs font-bold rounded-md">
                      Passive
                    </div>
                  )}
               </div>
             ))
           )}
        </div>
      )}
    </Glass>
  );
};
