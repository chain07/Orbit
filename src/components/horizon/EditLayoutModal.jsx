import React, { useState, useContext } from 'react';
import { StorageContext } from '../../context/StorageContext';
import { X, GripVertical, Eye, EyeOff } from 'lucide-react';

export const EditLayoutModal = ({ onClose }) => {
  const { metrics, updateMetric } = useContext(StorageContext);
  const [localMetrics, setLocalMetrics] = useState([...metrics]);

  const toggleVisibility = (metricId) => {
    setLocalMetrics(prev =>
      prev.map(m =>
        m.id === metricId
          ? { ...m, dashboardVisible: !m.dashboardVisible }
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
    // Update all metrics with new visibility and order
    localMetrics.forEach((metric, index) => {
      updateMetric({
        ...metric,
        displayOrder: index
      });
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="bg-card w-full max-w-lg h-[90vh] sm:h-auto sm:max-h-[90vh] rounded-t-2xl sm:rounded-2xl flex flex-col overflow-hidden shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="p-4 border-b border-separator flex justify-between items-center bg-bg-color">
          <h2 className="text-lg font-bold">Edit Layout</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-separator bg-opacity-20 flex items-center justify-center hover:bg-opacity-30 transition-colors"
          >
            <X size={18} />
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
                    metric.dashboardVisible
                      ? 'border-separator bg-card'
                      : 'border-separator bg-separator bg-opacity-10 opacity-60'
                  }`}
                >
                  {/* Drag Handle */}
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => moveUp(index)}
                      disabled={index === 0}
                      className="text-secondary disabled:opacity-30 hover:text-primary transition-colors"
                    >
                      <GripVertical size={16} />
                    </button>
                    <button
                      onClick={() => moveDown(index)}
                      disabled={index === localMetrics.length - 1}
                      className="text-secondary disabled:opacity-30 hover:text-primary transition-colors"
                    >
                      <GripVertical size={16} />
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
                  <button
                    onClick={() => toggleVisibility(metric.id)}
                    className="p-2 rounded-lg hover:bg-bg-color transition-colors"
                  >
                    {metric.dashboardVisible ? (
                      <Eye size={20} className="text-blue" />
                    ) : (
                      <EyeOff size={20} className="text-secondary" />
                    )}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-separator bg-bg-color flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-separator font-bold"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 rounded-xl bg-blue text-white font-bold active:scale-95 transition-transform"
          >
            Save Layout
          </button>
        </div>
      </div>
    </div>
  );
};
