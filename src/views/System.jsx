// src/views/System.jsx
import React, { useContext, useState } from 'react';
import { StorageContext } from '../context/StorageContext';
import { Glass } from '../components/ui/Glass';
import { MetricBuilder } from '../components/ui/MetricBuilder';

export const System = () => {
  const { metrics, addMetric, updateMetric, deleteMetric, exportData, importData } = useContext(StorageContext);

  const [showBuilder, setShowBuilder] = useState(false);
  const [editingMetric, setEditingMetric] = useState(null);

  const handleEdit = (metric) => {
    setEditingMetric(metric);
    setShowBuilder(true);
  };

  const handleAdd = () => {
    setEditingMetric(null);
    setShowBuilder(true);
  };

  const handleExport = () => {
    const json = exportData();
    const blob = new Blob([JSON.stringify(json, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'orbit-data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        importData(data);
      } catch (err) {
        console.error("Invalid JSON", err);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      
      {/* Metrics List */}
      <Glass>
        <div className="flex justify-between items-center">
          <div className="text-lg font-bold">Metrics</div>
          <button onClick={handleAdd} className="py-2 px-3 rounded bg-blue text-white font-bold">Add Metric</button>
        </div>

        <div className="mt-3 flex flex-col gap-2">
          {metrics.map(m => (
            <div key={m.id} className="flex justify-between items-center p-2 rounded bg-white bg-opacity-5">
              <div>{m.name}</div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(m)} className="font-bold">Edit</button>
                <button onClick={() => deleteMetric(m.id)} className="font-bold text-red">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </Glass>

      {/* Export / Import */}
      <Glass>
        <div className="flex flex-col gap-3">
          <div className="text-lg font-bold">Data Management</div>
          <div className="flex gap-2">
            <button onClick={handleExport} className="py-2 px-3 rounded bg-blue text-white font-bold">Export JSON</button>
            <input type="file" accept="application/json" onChange={handleImport} />
          </div>
        </div>
      </Glass>

      {/* Metric Builder */}
      {showBuilder && (
        <MetricBuilder
          metric={editingMetric}
          onSave={(metric) => {
            if (editingMetric) updateMetric(metric);
            else addMetric(metric);
            setShowBuilder(false);
          }}
          onCancel={() => setShowBuilder(false)}
        />
      )}
    </div>
  );
};
