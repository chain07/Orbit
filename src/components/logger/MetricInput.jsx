import React from 'react';
import { MetricType } from '../../types/schemas';

export const MetricInput = ({ metric, value, onChange }) => {
  const handleChange = (e) => {
    let val = e.target.value;
    if (metric.type === MetricType.NUMBER || metric.type === MetricType.RANGE) {
        val = parseFloat(val);
    } else if (metric.type === MetricType.BOOLEAN) {
        val = e.target.checked;
    }
    onChange(val);
  };

  const renderInput = () => {
    switch (metric.type) {
        case MetricType.BOOLEAN:
            // Toggle Switch
            return (
                <label style={{ position: 'relative', display: 'inline-block', width: '51px', height: '31px' }}>
                    <input
                        type="checkbox"
                        checked={!!value}
                        onChange={handleChange}
                        style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span style={{
                        position: 'absolute',
                        cursor: 'pointer',
                        top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: value ? '#34C759' : '#e9e9ea',
                        borderRadius: '34px',
                        transition: '.4s'
                    }}></span>
                    <span style={{
                        position: 'absolute',
                        height: '27px',
                        width: '27px',
                        left: '2px',
                        bottom: '2px',
                        backgroundColor: 'white',
                        borderRadius: '50%',
                        transition: '.4s',
                        transform: value ? 'translateX(20px)' : 'translateX(0)',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}></span>
                </label>
            );

        case MetricType.RANGE:
            return (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ fontSize: '15px', fontWeight: '400', color: 'var(--blue)' }}>
                        {value || metric.range?.min || 0}/{metric.range?.max || 10}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                            type="range"
                            min={metric.range?.min || 1}
                            max={metric.range?.max || 10}
                            step={metric.range?.step || 1}
                            value={value || metric.range?.min || 0}
                            onChange={handleChange}
                            style={{ width: '120px', accentColor: 'var(--blue)' }}
                        />
                    </div>
                </div>
            );

        case MetricType.SELECT:
            return (
                <div style={{ position: 'relative', width: '100%' }}>
                    <select
                        value={value}
                        onChange={handleChange}
                        style={{
                            appearance: 'none',
                            WebkitAppearance: 'none',
                            width: '100%',
                            backgroundColor: 'var(--bg-color)',
                            border: 'none',
                            borderRadius: '12px',
                            padding: '14px 32px 14px 16px', // Right padding for icon
                            fontSize: '16px',
                            color: 'var(--text-primary)',
                            fontFamily: 'inherit'
                        }}
                    >
                        <option value="" disabled>Select</option>
                        {(metric.options || []).map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                    <div style={{
                        position: 'absolute',
                        right: '16px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        pointerEvents: 'none',
                        color: 'var(--text-secondary)'
                    }}>
                        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 1L6 6L11 1"/></svg>
                    </div>
                </div>
            );

        case MetricType.DURATION:
            // Split Duration (Hrs / Mins) if it was implemented fully, for now reusing Stepper but cleaner
            // Or ideally use the reference layout: 2 boxes.
            // Simplified for reliability: Single Number Stepper but with Duration Label
            return (
               <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--bg-color)', borderRadius: '12px', padding: '4px' }}>
                   <button
                     type="button"
                     onClick={() => onChange(Math.max(0, (parseFloat(value) || 0) - 0.5))}
                     style={{
                         width: '40px', height: '36px', borderRadius: '8px', border: 'none',
                         backgroundColor: 'var(--card-bg)', color: 'var(--text-primary)',
                         fontSize: '20px', fontWeight: '500', cursor: 'pointer',
                         boxShadow: '0 2px 5px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                     }}
                   >
                       −
                   </button>
                   <div style={{ minWidth: '50px', textAlign: 'center', fontSize: '17px', fontWeight: '600' }}>
                       {value || 0}<span style={{fontSize: '11px', color: 'var(--text-secondary)', marginLeft: '2px'}}>hr</span>
                   </div>
                    <button
                     type="button"
                     onClick={() => onChange((parseFloat(value) || 0) + 0.5)}
                     style={{
                         width: '40px', height: '36px', borderRadius: '8px', border: 'none',
                         backgroundColor: 'var(--card-bg)', color: 'var(--text-primary)',
                         fontSize: '20px', fontWeight: '500', cursor: 'pointer',
                         boxShadow: '0 2px 5px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                     }}
                   >
                       ＋
                   </button>
               </div>
            );

        case MetricType.NUMBER:
            return (
               <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--bg-color)', borderRadius: '12px', padding: '4px' }}>
                   <button
                     type="button"
                     onClick={() => onChange(Math.max(0, (parseFloat(value) || 0) - 1))}
                     style={{
                         width: '40px', height: '36px', borderRadius: '8px', border: 'none',
                         backgroundColor: 'var(--card-bg)', color: 'var(--text-primary)',
                         fontSize: '20px', fontWeight: '500', cursor: 'pointer',
                         boxShadow: '0 2px 5px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                     }}
                   >
                       −
                   </button>
                   <div style={{ minWidth: '50px', textAlign: 'center', fontSize: '17px', fontWeight: '600' }}>
                       {value || 0}
                   </div>
                    <button
                     type="button"
                     onClick={() => onChange((parseFloat(value) || 0) + 1)}
                     style={{
                         width: '40px', height: '36px', borderRadius: '8px', border: 'none',
                         backgroundColor: 'var(--card-bg)', color: 'var(--text-primary)',
                         fontSize: '20px', fontWeight: '500', cursor: 'pointer',
                         boxShadow: '0 2px 5px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                     }}
                   >
                       ＋
                   </button>
               </div>
            );

        case MetricType.TEXT:
             return (
                 <textarea
                     value={value}
                     onChange={handleChange}
                     placeholder="Notes..."
                     style={{
                         width: '100%',
                         backgroundColor: 'var(--bg-color)',
                         border: 'none',
                         borderRadius: '12px',
                         padding: '14px',
                         fontSize: '16px',
                         color: 'var(--text-primary)',
                         fontFamily: 'inherit',
                         resize: 'vertical',
                         minHeight: '80px'
                     }}
                 />
             );

        default:
            return (
                <input
                    type="text"
                    value={value}
                    onChange={handleChange}
                    placeholder="Value"
                    style={{
                        padding: '8px',
                        borderRadius: '8px',
                        border: '1px solid rgba(0,0,0,0.1)',
                        width: '100px',
                        textAlign: 'right'
                    }}
                />
            );
    }
  };

  return (
    <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px',
        borderBottom: '0.5px solid rgba(0,0,0,0.1)',
        minHeight: '56px'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '16px', fontWeight: '500' }}>{metric.label}</span>
          {metric.unit && <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{metric.unit}</span>}
      </div>
      <div>
        {renderInput()}
      </div>
    </div>
  );
};
