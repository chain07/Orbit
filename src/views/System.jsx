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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
      
      {/* Metrics List */}
      <Glass>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 600 }}>Metrics</div>
          <button onClick={handleAdd} style={{ padding: '6px 12px', borderRadius: 6, background: '#4f46e5', color: '#fff', fontWeight: 600 }}>Add Metric</button>
        </div>

        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {metrics.map(m => (
            <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 6, borderRadius: 6, background: 'rgba(0,0,0,0.03)' }}>
              <div>{m.name}</div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => handleEdit(m)} style={{ fontWeight: 600 }}>Edit</button>
                <button onClick={() => deleteMetric(m.id)} style={{ fontWeight: 600, color: 'red' }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </Glass>

      {/* Export / Import */}
      <Glass>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 16, fontWeight: 600 }}>Data Management</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleExport} style={{ padding: '6px 12px', borderRadius: 6, background: '#4f46e5', color: '#fff', fontWeight: 600 }}>Export JSON</button>
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
