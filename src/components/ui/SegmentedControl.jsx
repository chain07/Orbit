import React, { useEffect, useRef, useMemo } from "react";
import "../styles/motion.css";

/**
 * SegmentedControl
 * iOS-style segmented control with animated indicator and color support.
 * * Props:
 * - options: Array of strings OR objects { label, value, color? }
 * - value: Current selected value
 * - onChange: Callback (value) => void
 * - className: Optional wrapper class
 */
export default function SegmentedControl({
  options = [],
  value,
  onChange,
  className = ""
}) {
  const indicatorRef = useRef(null);

  // Normalize options to ensure they are always objects { label, value, color }
  const normalizedOptions = useMemo(() => {
    return options.map(opt => {
      if (typeof opt === 'string') {
        return { label: opt, value: opt };
      }
      return opt;
    });
  }, [options]);

  const index = normalizedOptions.findIndex(o => o.value === value);

  useEffect(() => {
    if (!indicatorRef.current) return;
    // Handle case where value might not match any option (default to 0 or hide?)
    // Here we default to 0 position if not found, or hide if index is -1
    const safeIndex = index === -1 ? 0 : index;
    indicatorRef.current.style.transform = `translateX(${safeIndex * 100}%)`;
    indicatorRef.current.style.opacity = index === -1 ? 0 : 1;
  }, [index]);

  return (
    <div className={`segmented-wrap ${className}`}>
      {/* Animated Indicator Piston */}
      <div
        className="seg-indicator"
        ref={indicatorRef}
        style={{ width: `calc((100% - 4px) / ${normalizedOptions.length})` }}
      />

      {/* Buttons */}
      {normalizedOptions.map((opt, i) => {
        const isSelected = i === index;
        
        // Determine text color style
        let style = {};
        if (isSelected) {
            // If the option has a specific color (e.g., from Gatekeeper logic), use it
            if (opt.color) {
                style.color = opt.color; // e.g. 'var(--green)' or '#34C759'
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
