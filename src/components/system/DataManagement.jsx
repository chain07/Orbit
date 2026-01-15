// src/views/system/DataManagement.jsx
import React, { useContext, useState } from 'react';
import { StorageContext } from '../../context/StorageContext';
import { Glass } from '../../components/ui/Glass';

export const DataManagement = () => {
  const { metrics, logs, importJSON, exportJSON, clearAllData } = useContext(StorageContext);
  const [importText, setImportText] = useState('');
  const [message, setMessage] = useState('');

  const handleImport = () => {
    try {
      const parsed = JSON.parse(importText);
      importJSON(parsed);
      setMessage('Import successful!');
    } catch (e) {
      setMessage('Invalid JSON');
    }
  };

  const handleExport = () => {
    const data = exportJSON();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orbit_data_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to delete all data? This cannot be undone.')) {
      clearAllData();
      setMessage('All data cleared.');
    }
  };

  return (
    <Glass>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h2>Data Management</h2>

        <div>
          <button onClick={handleExport}>Export Data</button>
        </div>

        <div>
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder="Paste JSON here"
            rows={6}
            style={{ width: '100%' }}
          />
          <button onClick={handleImport}>Import Data</button>
        </div>

        <div>
          <button onClick={handleClear} style={{ color: 'red' }}>Clear All Data</button>
        </div>

        {message && <div>{message}</div>}
      </div>
    </Glass>
  );
};
