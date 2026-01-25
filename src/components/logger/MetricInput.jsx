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
            return (
                <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        checked={!!value}
                        onChange={handleChange}
                        className="w-6 h-6 rounded border-gray-300 text-blue focus:ring-blue"
                    />
                    <span className="text-sm text-secondary">{value ? 'Done' : 'Not Done'}</span>
                </div>
            );

        case MetricType.RANGE:
            return (
                <div className="flex flex-col gap-2 w-full">
                    <div className="flex justify-between text-xs text-secondary">
                        <span>{metric.range?.min || 1}</span>
                        <span className="font-bold text-primary text-lg">{value || metric.range?.min || 0}</span>
                        <span>{metric.range?.max || 10}</span>
                    </div>
                    <input
                        type="range"
                        min={metric.range?.min || 1}
                        max={metric.range?.max || 10}
                        step={metric.range?.step || 1}
                        value={value || metric.range?.min || 0}
                        onChange={handleChange}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                </div>
            );

        case MetricType.SELECT:
            return (
                <select
                    value={value}
                    onChange={handleChange}
                    className="w-full p-2 rounded border border-separator bg-transparent text-sm"
                >
                    <option value="" disabled>Select option</option>
                    {(metric.options || []).map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
            );

        case MetricType.NUMBER:
        case MetricType.DURATION:
            return (
               <div className="flex items-center gap-2">
                   <button
                     type="button"
                     onClick={() => onChange(Math.max(0, (parseFloat(value) || 0) - 1))}
                     className="w-10 h-10 rounded border border-separator flex items-center justify-center text-lg font-bold active:bg-gray-100"
                   >
                       -
                   </button>
                   <input
                        type="number"
                        value={value}
                        onChange={handleChange}
                        placeholder="0"
                        className="flex-1 p-2 text-center rounded border border-separator text-lg font-mono bg-transparent"
                    />
                    <button
                     type="button"
                     onClick={() => onChange((parseFloat(value) || 0) + 1)}
                     className="w-10 h-10 rounded border border-separator flex items-center justify-center text-lg font-bold active:bg-gray-100"
                   >
                       +
                   </button>
               </div>
            );

        default:
            return (
                <input
                    type="text"
                    value={value}
                    onChange={handleChange}
                    placeholder="Enter value"
                    className="w-full p-2 rounded border border-separator text-sm bg-transparent"
                />
            );
    }
  };

  return (
    <div className="flex flex-col gap-2 p-3 border border-separator/50 rounded-xl bg-card/50">
      <div className="flex justify-between items-center">
          <label className="font-bold text-sm">{metric.label}</label>
          {metric.unit && <span className="text-xs text-secondary">{metric.unit}</span>}
      </div>
      {renderInput()}
    </div>
  );
};
