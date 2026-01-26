import React from 'react';
import { MetricType } from '../../types/schemas';

/**
 * MetricInput (Refactored Phase 4.9.2: Dark Mode & Polish)
 * Renders a single metric as a standalone Card with specific input controls.
 */
export const MetricInput = ({ metric, value, onChange }) => {
  // Simple Dark Mode Detection for high-contrast backgrounds
  const isDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const inputBg = isDark ? '#2C2C2E' : '#F2F2F7';

  const handleChange = (val) => {
    onChange(val);
  };

  const safeValue = value ?? '';

  // Helper to format context (Value + Unit)
  const renderContext = () => {
      if (value === undefined || value === '' || value === null) return metric.unit || '';
      if (metric.type === MetricType.BOOLEAN) return value ? 'Done' : 'Pending';
      return `${value} ${metric.unit || ''}`;
  };

  const renderInput = () => {
    switch (metric.type) {
        case MetricType.BOOLEAN:
            const isChecked = !!value;
            return (
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <div
                        onClick={() => handleChange(!isChecked)}
                        style={{
                            width: '51px',
                            height: '31px',
                            backgroundColor: isChecked ? '#34C759' : inputBg,
                            borderRadius: '34px',
                            position: 'relative',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s ease-in-out'
                        }}
                    >
                        <div style={{
                            width: '27px',
                            height: '27px',
                            backgroundColor: '#FFFFFF',
                            borderRadius: '50%',
                            position: 'absolute',
                            top: '2px',
                            left: '2px',
                            boxShadow: '0 3px 8px rgba(0,0,0,0.15), 0 3px 1px rgba(0,0,0,0.06)',
                            transform: isChecked ? 'translateX(20px)' : 'translateX(0)',
                            transition: 'transform 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)'
                        }} />
                    </div>
                </div>
            );

        case MetricType.NUMBER:
             const numVal = parseFloat(value) || 0;
             return (
               <div style={{ display: 'flex', justifyContent: 'center' }}>
                   <div style={{ display: 'flex', alignItems: 'center', backgroundColor: inputBg, borderRadius: '12px', padding: '4px' }}>
                       <button
                         type="button"
                         onClick={() => handleChange(Math.max(0, numVal - 1))}
                         style={{
                             width: '44px', height: '44px', borderRadius: '10px', border: 'none',
                             backgroundColor: 'var(--card-bg)', color: 'var(--text-primary)',
                             fontSize: '24px', fontWeight: '400', cursor: 'pointer',
                             boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                             display: 'flex', alignItems: 'center', justifyContent: 'center',
                             touchAction: 'manipulation'
                         }}
                       >
                           −
                       </button>
                       <div style={{ minWidth: '60px', textAlign: 'center', fontSize: '20px', fontWeight: '600', color: 'var(--text-primary)' }}>
                           {numVal}
                       </div>
                        <button
                         type="button"
                         onClick={() => handleChange(numVal + 1)}
                         style={{
                             width: '44px', height: '44px', borderRadius: '10px', border: 'none',
                             backgroundColor: 'var(--card-bg)', color: 'var(--text-primary)',
                             fontSize: '24px', fontWeight: '400', cursor: 'pointer',
                             boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                             display: 'flex', alignItems: 'center', justifyContent: 'center',
                             touchAction: 'manipulation'
                         }}
                       >
                           ＋
                       </button>
                   </div>
               </div>
            );

        case MetricType.RANGE:
            // Custom Slider Style with Gradient Track
            const rangeVal = value !== undefined ? value : (metric.range?.min || 0);
            return (
                <div style={{ width: '100%', padding: '10px 0' }}>
                    <style>{`
                        .custom-range::-webkit-slider-thumb {
                            -webkit-appearance: none;
                            appearance: none;
                            width: 28px;
                            height: 28px;
                            border-radius: 50%;
                            background: #FFFFFF;
                            cursor: pointer;
                            box-shadow: 0 2px 6px rgba(0,0,0,0.2);
                            margin-top: -11px;
                        }
                        .custom-range::-webkit-slider-runnable-track {
                            width: 100%;
                            height: 6px;
                            background: linear-gradient(90deg, #007AFF, #5856D6);
                            border-radius: 3px;
                        }
                    `}</style>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{metric.range?.min || 0}</span>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{metric.range?.max || 10}</span>
                    </div>
                    <input
                        type="range"
                        className="custom-range"
                        min={metric.range?.min || 0}
                        max={metric.range?.max || 10}
                        step={metric.range?.step || 1}
                        value={rangeVal}
                        onChange={(e) => handleChange(parseFloat(e.target.value))}
                        style={{
                            width: '100%',
                            appearance: 'none',
                            background: 'transparent',
                            outline: 'none',
                            margin: 0
                        }}
                    />
                     <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '17px', fontWeight: '600', color: '#007AFF' }}>
                        {rangeVal}
                    </div>
                </div>
            );

        case MetricType.SELECT:
            return (
                <div style={{
                    display: 'flex',
                    gap: '8px',
                    overflowX: 'auto',
                    paddingBottom: '4px',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    WebkitOverflowScrolling: 'touch'
                }}>
                    {(metric.options || []).map(opt => {
                        const isActive = value === opt;
                        return (
                            <button
                                key={opt}
                                type="button"
                                onClick={() => handleChange(opt)}
                                style={{
                                    backgroundColor: isActive ? '#007AFF' : inputBg,
                                    color: isActive ? '#FFFFFF' : 'var(--text-primary)',
                                    borderRadius: '20px',
                                    padding: '8px 16px',
                                    border: 'none',
                                    fontSize: '15px',
                                    fontWeight: isActive ? '600' : '400',
                                    whiteSpace: 'nowrap',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {opt}
                            </button>
                        );
                    })}
                </div>
            );

        case MetricType.DURATION:
            const hours = Math.floor(value || 0);
            const mins = Math.round(((value || 0) - hours) * 60);
            return (
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                   <div style={{ backgroundColor: inputBg, borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                       <input
                           type="number"
                           value={hours}
                           min={0}
                           onChange={(e) => handleChange(parseFloat(e.target.value || 0) + (mins/60))}
                           style={{ fontSize: '24px', fontWeight: '600', textAlign: 'center', background: 'transparent', border: 'none', width: '100%', padding: 0, color: 'var(--text-primary)' }}
                       />
                       <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', marginTop: '4px' }}>Hours</span>
                   </div>
                   <div style={{ backgroundColor: inputBg, borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                       <input
                           type="number"
                           value={mins}
                           min={0}
                           max={59}
                           onChange={(e) => handleChange(hours + (parseFloat(e.target.value || 0)/60))}
                           style={{ fontSize: '24px', fontWeight: '600', textAlign: 'center', background: 'transparent', border: 'none', width: '100%', padding: 0, color: 'var(--text-primary)' }}
                       />
                       <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', marginTop: '4px' }}>Mins</span>
                   </div>
               </div>
            );

        case MetricType.TEXT:
             return (
                 <textarea
                     value={value || ''}
                     onChange={(e) => handleChange(e.target.value)}
                     placeholder="Add notes..."
                     style={{
                         width: '100%',
                         backgroundColor: inputBg,
                         border: 'none',
                         borderRadius: '12px',
                         padding: '12px',
                         fontSize: '16px',
                         color: 'var(--text-primary)',
                         fontFamily: 'inherit',
                         resize: 'none',
                         minHeight: '80px',
                         boxSizing: 'border-box'
                     }}
                 />
             );

        default:
            return null;
    }
  };

  return (
    <div style={{
        backgroundColor: 'var(--card-bg)',
        borderRadius: '20px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
        padding: '20px',
        marginBottom: '16px',
        display: 'flex',
        flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <span style={{ fontSize: '17px', fontWeight: '700', color: 'var(--text-primary)' }}>{metric.label}</span>
          <span style={{ fontSize: '15px', fontWeight: '600', color: '#007AFF', fontVariantNumeric: 'tabular-nums' }}>
              {renderContext()}
          </span>
      </div>

      {/* Input Control */}
      <div style={{ width: '100%' }}>
        {renderInput()}
      </div>
    </div>
  );
};
