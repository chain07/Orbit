import React, { useMemo } from 'react';

export default function SegmentedControl({
  options = [],
  value,
  onChange,
  name
}) {
  // Ensure a stable unique name if not provided, using useMemo
  const groupName = useMemo(() =>
    name || "sc-" + Math.random().toString(36).substr(2, 9),
  [name]);

  if (!options || !Array.isArray(options) || options.length === 0) {
    return null;
  }

  // Normalize options
  const normalizedOptions = options.map(opt =>
    typeof opt === 'string' ? { label: opt, value: opt } : opt
  );

  return (
    <div className="segmented-control-wrapper w-full" data-count={normalizedOptions.length}>
       {normalizedOptions.map((opt) => (
         <React.Fragment key={opt.value}>
           <input
             type="radio"
             name={groupName}
             id={`${groupName}-${opt.value}`}
             value={opt.value}
             checked={value === opt.value}
             onChange={() => onChange(opt.value)}
           />
           <label htmlFor={`${groupName}-${opt.value}`}>
             {opt.label}
           </label>
         </React.Fragment>
       ))}
       <div className="glider" />
    </div>
  );
}
