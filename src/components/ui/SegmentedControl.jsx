import React, { useEffect, useRef } from "react";
import "../styles/motion.css";

export default function SegmentedControl({
  options,
  value,
  onChange
}) {
  const indicatorRef = useRef(null);

  const index = options.findIndex(o => o.value === value);

  useEffect(() => {
    if (!indicatorRef.current) return;
    indicatorRef.current.style.transform = `translateX(${index * 100}%)`;
  }, [index]);

  return (
    <div className="segmented-wrap">
      <div
        className="seg-indicator"
        ref={indicatorRef}
        style={{ width: `calc((100% - 4px) / ${options.length})` }}
      />

      {options.map((opt, i) => (
        <div
          key={opt.value}
          className="seg-btn"
          style={{
            color:
              i === index
                ? "var(--text-primary)"
                : "var(--text-secondary)"
          }}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </div>
      ))}
    </div>
  );
}
