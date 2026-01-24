import React, { useState, useContext } from 'react';
import { StorageContext } from '../../context/StorageContext';
import { OrbitButton } from '../ui/OrbitButton';
import { Icons } from '../../components/ui/Icons';
import Glass from '../ui/Glass';
import SegmentedControl from '../ui/SegmentedControl';

export const ActivityManager = () => {
  const { metrics, addMetric } = useContext(StorageContext);
  const [isCreating, setIsCreating] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [color, setColor] = useState('#007AFF');
  const [hasGoal, setHasGoal] = useState(false);
  const [goalValue, setGoalValue] = useState(0);
  const [frequency, setFrequency] = useState('daily');

  // Filter for duration metrics
  const activities = metrics.filter(m => m.type === 'duration');

  const handleSave = () => {
    if (!name.trim()) return;

    const newMetric = {
        id: crypto.randomUUID(), // Explicit ID generation
        label: name.trim(),
        name: name.trim().toLowerCase().replace(/\s+/g, '_'),
        type: 'duration',
        goal: hasGoal ? parseFloat(goalValue) : 0,
        frequency: hasGoal ? frequency : 'daily', // 'daily' or 'weekly'
        color: color,
        widgetType: 'sparkline', // Default visualization
        dashboardVisible: false, // Hidden from Horizon by default
        created: new Date().toISOString()
    };

    addMetric(newMetric);

    // Reset Form
    setIsCreating(false);
    setName('');
    setColor('#007AFF');
    setHasGoal(false);
    setGoalValue(0);
    setFrequency('daily');
  };

  return (
    <Glass className="p-4" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontWeight: 'bold', fontSize: '1.125rem', color: 'var(--text-primary)', margin: 0 }}>Manage Activities</h3>
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            style={{
              background: 'rgba(0,0,0,0.05)',
              border: 'none',
              borderRadius: '20px',
              padding: '4px 12px',
              fontSize: '11px',
              fontWeight: '600',
              color: 'var(--text-secondary)',
              cursor: 'pointer'
            }}
          >
            New
          </button>
        )}
      </div>

      {/* List or Form */}
      {isCreating ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem', backgroundColor: 'var(--bg-color)', borderRadius: '14px', border: '1px solid var(--separator)' }}>
          {/* 1. Name */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase', marginLeft: '4px' }}>Activity Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Coding, Reading"
              style={{ width: '100%', padding: '12px', backgroundColor: 'var(--card-bg)', border: '1px solid var(--separator)', borderRadius: '14px', fontWeight: 'bold', fontSize: '1.125rem', outline: 'none' }}
            />
          </div>

          {/* 2. Color */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase', marginLeft: '4px' }}>Color</label>
            <div style={{ position: 'relative', width: '100%', height: '48px' }}>
               <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 10 }}
               />
               <div
                  style={{ width: '100%', height: '100%', borderRadius: '14px', border: '1px solid var(--separator)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white', backgroundColor: color, textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}
               >
                  {color.toUpperCase()}
               </div>
            </div>
          </div>

          {/* 3. Goal Toggle */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>Track as Goal?</span>
                <div
                  onClick={() => setHasGoal(!hasGoal)}
                  style={{
                    width: '48px',
                    height: '28px',
                    borderRadius: '9999px',
                    position: 'relative',
                    transition: 'background-color 0.2s',
                    cursor: 'pointer',
                    backgroundColor: hasGoal ? 'var(--green)' : 'var(--separator)'
                  }}
                >
                   <div
                      style={{
                        position: 'absolute',
                        top: '4px',
                        width: '20px',
                        height: '20px',
                        backgroundColor: 'white',
                        borderRadius: '50%',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                        transition: 'transform 0.2s',
                        transform: hasGoal ? 'translateX(24px)' : 'translateX(4px)'
                      }}
                   />
                </div>
             </div>

             {hasGoal && (
               <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>

                 <div style={{ width: '100%' }}>
                    <SegmentedControl
                       options={[{ label: 'Daily', value: 'daily' }, { label: 'Weekly', value: 'weekly' }]}
                       value={frequency}
                       onChange={setFrequency}
                    />
                 </div>

                 <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                   <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase', marginLeft: '4px' }}>Target (Hours)</label>
                   <input
                     type="number"
                     value={goalValue}
                     onChange={(e) => setGoalValue(e.target.value)}
                     style={{ width: '100%', padding: '12px', backgroundColor: 'var(--card-bg)', border: '1px solid var(--separator)', borderRadius: '14px', fontFamily: 'monospace', fontSize: '1.125rem', outline: 'none' }}
                     step="0.1"
                     min="0"
                   />
                 </div>
               </div>
             )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
             <OrbitButton
               onClick={() => setIsCreating(false)}
               variant="secondary"
               style={{ flex: 1 }}
             >
               Cancel
             </OrbitButton>
             <OrbitButton
               onClick={handleSave}
               variant="primary"
               style={{ flex: 1 }}
               type="button"
             >
               Save Activity
             </OrbitButton>
          </div>
        </div>
      ) : (
        /* Activity List */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
           {activities.length === 0 ? (
             <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem', backgroundColor: 'var(--bg-color)', borderRadius: '14px', border: '1px dashed var(--separator)' }}>
               No activities found. Create one to start tracking time.
             </div>
           ) : (
             activities.map(act => (
               <div key={act.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', backgroundColor: 'var(--bg-color)', borderRadius: '14px', border: '1px solid var(--separator)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                     <div
                       style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: act.color }}
                     />
                     <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{act.label}</span>
                  </div>

                  {act.goal > 0 ? (
                    <div style={{ padding: '4px 8px', backgroundColor: 'rgba(0,122,255,0.1)', color: 'var(--blue)', fontSize: '0.75rem', fontWeight: 'bold', borderRadius: '6px' }}>
                      {act.goal}h/{act.frequency === 'weekly' ? 'wk' : 'day'}
                    </div>
                  ) : (
                    <div style={{ padding: '4px 8px', backgroundColor: 'rgba(60,60,67,0.1)', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 'bold', borderRadius: '6px' }}>
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
