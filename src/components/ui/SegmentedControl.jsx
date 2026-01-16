import React, { useMemo } from "react";
import { motion } from "framer-motion";
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
      <motion.div
        className="seg-indicator"
        initial={false}
        animate={{
          x: `${(index === -1 ? 0 : index) * 100}%`,
          opacity: index === -1 ? 0 : 1
        }}
        transition={{ type: "spring", stiffness: 500, damping: 35, mass: 1 }}
        style={{
          width: `calc((100% - 4px) / ${normalizedOptions.length})`,
          boxShadow: '0 2px 8px rgba(0,0,0,0.12)'
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
          <motion.div
            key={opt.value}
            className="seg-btn"
            style={style}
            onClick={() => onChange(opt.value)}
            whileTap={{ scale: 0.97 }}
          >
            {opt.label}
          </motion.div>
        );
      })}
    </div>
  );
}
