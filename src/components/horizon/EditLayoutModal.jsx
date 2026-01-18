import React, { useState, useContext } from 'react';
import { StorageContext } from '../../context/StorageContext';
import { Icons } from '../../components/ui/Icons';
import { Glass } from '../../components/ui/Glass'; // L-03: Wrap in Glass for background

export const EditLayoutModal = ({ onClose, isOpen }) => {
  const { metrics, updateMetric } = useContext(StorageContext);
  const [localMetrics, setLocalMetrics] = useState([...metrics]);

  if (!isOpen) return null; // Added isOpen check for safety

  const toggleVisibility = (metricId) => {
    setLocalMetrics(prev =>
      prev.map(m =>
        m.id === metricId
          ? { ...m, dashboardVisible: !m.dashboardVisible !== false } // Default to true if undefined
          : m
      )
    );
  };

  const moveUp = (index) => {
    if (index === 0) return;
    const newMetrics = [...localMetrics];
    [newMetrics[index - 1], newMetrics[index]] = [newMetrics[index], newMetrics[index - 1]];
    setLocalMetrics(newMetrics);
  };

  const moveDown = (index) => {
    if (index === localMetrics.length - 1) return;
    const newMetrics = [...localMetrics];
    [newMetrics[index], newMetrics[index + 1]] = [newMetrics[index + 1], newMetrics[index]];
    setLocalMetrics(newMetrics);
  };

  const handleSave = () => {
    localMetrics.forEach((metric, index) => {
      updateMetric({
        ...metric,
        displayOrder: index
        // Note: Logic to actually save visibility needs to be supported by updateMetric schema
      });
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
      <Glass className="w-full max-w-lg h-[90vh] sm:h-auto sm:max-h-[90vh] rounded-t-2xl sm:rounded-2xl flex flex-col overflow-hidden shadow-2xl animate-fade-in p-0">
        {/* Header */}
        <div className="p-4 border-b border-separator flex justify-between items-center bg-transparent">
          <h2 className="text-lg font-bold">Edit Layout</h2>
          <button
            onClick={onClose}
            className="btn-liquid variant-ghost w-10 h-10 p-0 flex items-center justify-center"
          >
            <Icons.X size={18} />
          </button>
        </div>

        {/* Widget List */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex flex-col gap-2">
            {localMetrics.length === 0 ? (
              <div className="text-center text-secondary py-8 text-sm italic">
                No metrics to display. Add metrics in the System tab.
              </div>
            ) : (
              localMetrics.map((metric, index) => (
                <div
                  key={metric.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                    metric.dashboardVisible !== false
                      ? 'border-separator bg-card'
                      : 'border-separator bg-separator bg-opacity-10 opacity-60'
                  }`}
                >
                  {/* Drag Handle */}
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => moveUp(index)}
                      disabled={index === 0}
                      className="btn-liquid variant-ghost w-6 h-6 p-0 flex items-center justify-center text-secondary disabled:opacity-30"
                    >
                      <Icons.ChevronUp size={16} />
                    </button>
                    <button
                      onClick={() => moveDown(index)}
                      disabled={index === localMetrics.length - 1}
                      className="btn-liquid variant-ghost w-6 h-6 p-0 flex items-center justify-center text-secondary disabled:opacity-30"
                    >
                      <Icons.ChevronDown size={16} />
                    </button>
                  </div>

                  {/* Color Indicator */}
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: metric.color || '#8E8E93' }}
                  />

                  {/* Metric Name */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">
                      {metric.label || metric.name}
                    </div>
                    <div className="text-xs text-secondary">
                      {metric.widgetType || 'default'}
                    </div>
                  </div>

                  {/* Visibility Toggle */}
                  {/* Note: This is purely visual for now as dashboard visibility isn't fully implemented in engine, but UI is here */}
                  <button
                    onClick={() => toggleVisibility(metric.id)}
                    className="btn-liquid variant-ghost w-10 h-10 p-0 flex items-center justify-center"
                    title="Toggle Visibility"
                  >
                    {metric.dashboardVisible !== false ? (
                      <Icons.Eye size={20} className="text-blue" />
                    ) : (
                      <Icons.EyeOff size={20} className="text-secondary" />
                    )}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-separator bg-transparent flex gap-3">
          <button
            onClick={onClose}
            className="btn-liquid variant-glass flex-1"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="btn-liquid variant-primary flex-1"
          >
            Save Layout
          </button>
        </div>
      </Glass>
    </div>
  );
};
