import React from 'react';
import { StackedBar } from '../ui/charts/StackedBar';

/**
 * SegmentedBarWidget
 * Wrapper around StackedBar for displaying categorical distributions.
 * * Refactored Phase 4.14: Increased Min-Height to 320px.
 */
export const SegmentedBarWidget = ({ data, title }) => {
  if (!data || !data.entries || data.entries.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '12px', color: 'var(--text-secondary)', fontStyle: 'italic', opacity: 0.5 }}>
        No data available
      </div>
    );
  }
  
  const { entries, colors = {} } = data;

  return (
    <div style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '320px' // Increased breathing room per Phase 4.14
    }}>
      {/* Strict Header */}
      <div style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            margin: 0,
            fontSize: '11px',
            fontWeight: '700',
            textTransform: 'uppercase',
            color: 'var(--text-secondary)',
            zIndex: 20
      }}>
        {title || data.title || 'Distribution'}
      </div>

      <div style={{
          width: '100%',
          height: '100%',
          padding: '40px 20px 20px 20px',
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          marginTop: '20px' // Additional clearance
      }}>
        <div style={{ width: '100%' }}>
            <StackedBar
            data={entries}
            colors={colors}
            height={220} // Increased internal chart height
            />
        </div>
      </div>
    </div>
  );
};
