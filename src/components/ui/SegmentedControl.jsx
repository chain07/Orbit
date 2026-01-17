import React, { useMemo } from "react";
import "../../styles/motion.css";

export default function SegmentedControl({
  options = [],
  value,
  onChange,
  className = ""
}) {
  // Normalize options to ensure they are always objects { label, value, color }
  const normalizedOptions = useMemo(() => {
    if (!options || !Array.isArray(options) || options.length === 0) {
      return [];
    }
    return options.map(opt => {
      if (typeof opt === 'string') {
        return { label: opt, value: opt };
      }
      return opt;
    });
  }, [options]);

  const index = normalizedOptions.findIndex(o => o.value === value);

  // Prevent rendering constraints if no options exist
  if (normalizedOptions.length === 0) {
    return null;
  }

  return (
    <div className={`segmented-wrap ${className}`}>
      {/* Animated Indicator Piston - Native Fidelity Update */}
      <div
        className="seg-indicator"
        style={{
          width: `calc((100% - 4px) / ${normalizedOptions.length})`,
          transform: `translateX(${(index === -1 ? 0 : index) * 100}%)`,
          opacity: index === -1 ? 0 : 1,
          boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          position: 'absolute',
          top: '2px',
          bottom: '2px',
          left: '2px', // Base offset
          borderRadius: 'var(--radius-sm)', // Assuming standard radius
          backgroundColor: 'var(--card-bg)', // White/Card bg
          transition: 'transform 0.3s var(--ease-spring), opacity 0.2s ease'
        }}
      />
      
      {normalizedOptions.map((opt, i) => {
        const isSelected = i === index;
        let style = {};
        if (isSelected) {
            if (opt.color) {
                style.color = opt.color;
                style.fontWeight = 600;
            } else {
                style.color = "var(--text-primary)";
            }
        } else {
            style.color = "var(--text-secondary)";
        }
        return (
          <div
            key={opt.value}
            className="seg-btn active:scale-95 transition-transform duration-100 ease-out"
            style={{
                ...style,
                position: 'relative',
                zIndex: 1,
                cursor: 'pointer'
            }}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </div>
        );
      })}
    </div>
  );
}
