import React from 'react';
import { MetricType } from '../../types/schemas';

/**
 * MetricInput (CheckInRow)
 * Implements the "iOS Inset Grouped" input row spec.
 */
export const MetricInput = ({ metric, value, onChange }) => {

  const handleChange = (val) => {
    onChange(val);
  };

  const renderInput = () => {
    switch (metric.type) {
        case MetricType.BOOLEAN:
            return (
                <div
                    onClick={() => handleChange(!value)}
                    style={{
                        width: '51px',
                        height: '31px',
                        backgroundColor: value ? '#34C759' : '#E9E9EA',
                        borderRadius: '31px',
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
                        transform: value ? 'translateX(20px)' : 'translateX(0)',
                        transition: 'transform 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)'
                    }} />
                </div>
            );

        case MetricType.NUMBER:
             const numVal = parseFloat(value) || 0;
             return (
               <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#F2F2F7', borderRadius: '10px', padding: '2px' }}>
                   <button
                     type="button"
                     onClick={() => handleChange(Math.max(0, numVal - 1))}
                     style={{
                         width: '44px', height: '32px', borderRadius: '8px', border: 'none',
                         backgroundColor: '#FFFFFF', color: '#000000',
                         fontSize: '20px', fontWeight: '400', cursor: 'pointer',
                         boxShadow: '0 3px 8px rgba(0,0,0,0.12)', margin: '2px',
                         display: 'flex', alignItems: 'center', justifyContent: 'center',
                         touchAction: 'manipulation'
                     }}
                   >
                       −
                   </button>
                   <div style={{ minWidth: '40px', textAlign: 'center', fontSize: '17px', fontWeight: '600', color: '#000000' }}>
                       {numVal}
                   </div>
                    <button
                     type="button"
                     onClick={() => handleChange(numVal + 1)}
                     style={{
                         width: '44px', height: '32px', borderRadius: '8px', border: 'none',
                         backgroundColor: '#FFFFFF', color: '#000000',
                         fontSize: '20px', fontWeight: '400', cursor: 'pointer',
                         boxShadow: '0 3px 8px rgba(0,0,0,0.12)', margin: '2px',
                         display: 'flex', alignItems: 'center', justifyContent: 'center',
                         touchAction: 'manipulation'
                     }}
                   >
                       ＋
                   </button>
               </div>
            );

        case MetricType.RANGE:
            // Custom Slider Style
            const rangeVal = value !== undefined ? value : (metric.range?.min || 0);
            return (
                <div style={{ width: '100%', maxWidth: '200px', display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                            margin-top: -12px;
                        }
                        .custom-range::-webkit-slider-runnable-track {
                            width: 100%;
                            height: 4px;
                            background: #E5E5EA;
                            border-radius: 2px;
                        }
                    `}</style>
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
                            padding: '10px 0'
                        }}
                    />
                    <span style={{ fontSize: '17px', fontWeight: '600', color: '#007AFF', minWidth: '24px', textAlign: 'right' }}>
                        {rangeVal}
                    </span>
                </div>
            );

        case MetricType.SELECT:
            return (
                <div style={{ position: 'relative', width: '100%', minWidth: '160px' }}>
                    <select
                        value={value || ''}
                        onChange={(e) => handleChange(e.target.value)}
                        style={{
                            appearance: 'none',
                            WebkitAppearance: 'none',
                            width: '100%',
                            backgroundColor: '#F2F2F7',
                            border: 'none',
                            borderRadius: '12px',
                            padding: '12px 40px 12px 16px',
                            fontSize: '17px',
                            color: '#000000',
                            fontFamily: 'inherit',
                            fontWeight: '400',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="" disabled>Select</option>
                        {(metric.options || []).map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                    {/* Custom Chevron */}
                    <div style={{
                        position: 'absolute',
                        right: '16px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        pointerEvents: 'none',
                        color: '#C7C7CC'
                    }}>
                        <svg width="14" height="9" viewBox="0 0 14 9" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="1 1 7 7 13 1" />
                        </svg>
                    </div>
                </div>
            );

        case MetricType.DURATION:
            const hours = Math.floor(value || 0);
            const mins = Math.round(((value || 0) - hours) * 60);
            return (
               <div style={{ display: 'flex', gap: '8px' }}>
                   <div style={{ backgroundColor: '#F2F2F7', borderRadius: '8px', padding: '8px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '70px' }}>
                       <input
                           type="number"
                           value={hours}
                           min={0}
                           onChange={(e) => handleChange(parseFloat(e.target.value || 0) + (mins/60))}
                           style={{ fontSize: '20px', fontWeight: '600', textAlign: 'center', background: 'transparent', border: 'none', width: '100%', padding: 0, color: '#000000' }}
                       />
                       <span style={{ fontSize: '10px', fontWeight: '600', color: '#8E8E93', textTransform: 'uppercase' }}>Hours</span>
                   </div>
                   <div style={{ backgroundColor: '#F2F2F7', borderRadius: '8px', padding: '8px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '70px' }}>
                       <input
                           type="number"
                           value={mins}
                           min={0}
                           max={59}
                           onChange={(e) => handleChange(hours + (parseFloat(e.target.value || 0)/60))}
                           style={{ fontSize: '20px', fontWeight: '600', textAlign: 'center', background: 'transparent', border: 'none', width: '100%', padding: 0, color: '#000000' }}
                       />
                       <span style={{ fontSize: '10px', fontWeight: '600', color: '#8E8E93', textTransform: 'uppercase' }}>Mins</span>
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
                         backgroundColor: '#F2F2F7',
                         border: 'none',
                         borderRadius: '12px',
                         padding: '12px',
                         fontSize: '16px',
                         color: '#000000',
                         fontFamily: 'inherit',
                         resize: 'none',
                         minHeight: '80px'
                     }}
                 />
             );

        default:
            return null;
    }
  };

  return (
    <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: metric.type === MetricType.TEXT ? 'flex-start' : 'center',
        padding: '24px 0',
        borderBottom: '0.5px solid #C6C6C8',
        minHeight: '60px'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', paddingRight: '16px' }}>
          <span style={{ fontSize: '17px', fontWeight: '500', color: '#000000' }}>{metric.label}</span>
      </div>
      <div style={{
          flex: metric.type === MetricType.TEXT ? 1 : '0 0 auto',
          display: 'flex',
          justifyContent: 'flex-end',
          maxWidth: metric.type === MetricType.TEXT ? '100%' : '60%'
      }}>
        {renderInput()}
      </div>
    </div>
  );
};
