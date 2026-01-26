import React from 'react';

/**
 * ProgressBarWidget
 * Use Case: Duration or Range metrics.
 * Refactor Phase 4.12: Layout Finalization & Empty State Logic.
 */
export const ProgressBarWidget = ({ data, title }) => {
  if (!data) return null;

  const { value = 0, max = 100, unit = '', color = '#007AFF' } = data;

  // Empty State Logic: Ensure percent is calculable even if value is null
  const percent = value ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;

  // Status Text Logic (Gap Filler)
  let statusText = "Get Started";
  if (percent >= 100) statusText = "Goal Met";
  else if (percent > 50) statusText = "On Track";
  else if (percent > 0) statusText = "In Progress";

  return (
    <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end', // Push content to bottom
        height: '100%',
        width: '100%',
        boxSizing: 'border-box',
        position: 'relative',
        paddingBottom: '20px' // Visual Balance
    }}>

      {/* Atomic Header Fix: Strict Positioning */}
      <div style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            margin: 0,
            fontSize: '11px',
            fontWeight: '700',
            textTransform: 'uppercase',
            color: 'var(--secondary)',
            zIndex: 20
      }}>
        {title || data.label}
      </div>

      {/* Value Stack - Top Right (Absolute to match others) */}
      <div style={{
          position: 'absolute',
          top: '16px',
          right: '20px',
          textAlign: 'right'
      }}>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#007AFF' }}>
              {value}
          </div>
          <span style={{ fontSize: '11px', fontWeight: '500', color: '#8E8E93', display: 'block' }}>
              / {max} {unit}
          </span>
      </div>

      {/* Bar Container - With Side Padding for Visual Balance inside the full-width container */}
      <div style={{ width: '100%', paddingLeft: '20px', paddingRight: '20px', boxSizing: 'border-box' }}>
          <div style={{
              height: '24px', // Thicker track
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '12px',
              overflow: 'hidden',
              width: '100%'
          }}>
              <div style={{
                  height: '100%',
                  width: `${percent}%`,
                  borderRadius: '12px',
                  backgroundColor: color || '#007AFF',
                  transition: 'width 0.5s ease-out',
                  minWidth: percent > 0 ? '6px' : '0px' // Ensure visibility if non-zero
              }} />
          </div>

          {/* Gap Filler: Status Text */}
          <div style={{
              marginTop: '8px',
              fontSize: '11px',
              fontWeight: '600',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
          }}>
              <span>{statusText}</span>
              <span style={{ fontSize: '10px', opacity: 0.7 }}>{Math.round(percent)}%</span>
          </div>
      </div>
    </div>
  );
};
