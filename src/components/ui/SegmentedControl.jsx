import React, { useEffect, useRef, useMemo } from "react";
import "../../styles/motion.css";

export default function SegmentedControl({
  options = [],
  value,
  onChange,
  className = ""
}) {
  const indicatorRef = useRef(null);

  // Normalize options to ensure they are always objects { label, value, color }
  // Added validation to handle empty or invalid options arrays
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

  useEffect(() => {
    // Audit Requirement: Add fallback if indicatorRef.current is null
    if (!indicatorRef.current) return;

    // Handle case where value might not match any option (default to 0 or hide)
    // If index is -1 (not found), we hide the indicator by setting opacity to 0
    const safeIndex = index === -1 ? 0 : index;
    
    indicatorRef.current.style.transform = `translateX(${safeIndex * 100}%)`;
    indicatorRef.current.style.opacity = index === -1 ? 0 : 1;
  }, [index]);

  // Prevent rendering constraints if no options exist (avoids division by zero in calc)
  if (normalizedOptions.length === 0) {
    return null;
  }

  return (
    <div className={`segmented-wrap ${className}`}>
      {/* Animated Indicator Piston */}
      <div
        className="seg-indicator"
        ref={indicatorRef}
        style={{ width: `calc((100% - 4px) / ${normalizedOptions.length})` }}
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
            className="seg-btn"
            style={style}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </div>
        );
      })}
    </div>
  );
}
