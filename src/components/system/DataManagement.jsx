import React, { useContext, useState } from 'react';
import { StorageContext } from '../../context/StorageContext';
import { Glass } from '../ui/Glass';

export const DataManagement = () => {
  const { importJSON, exportJSON, clearAllData } = useContext(StorageContext);
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
      <div className="flex flex-col gap-4">
        <div className="text-lg font-bold">Data Management</div>

        <div>
          <button 
            onClick={handleExport}
            className="py-2 px-4 rounded bg-blue text-white font-bold"
          >
            Export Data
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder="Paste JSON here"
            rows={6}
            className="w-full p-2 rounded border border-separator bg-transparent font-mono text-sm"
          />
          <button 
            onClick={handleImport}
            className="py-2 px-4 rounded border border-blue text-blue font-bold"
          >
            Import Data
          </button>
        </div>

        <div className="border-t border-separator pt-4">
          <button 
            onClick={handleClear} 
            className="text-red font-bold text-sm"
          >
            Clear All Data
          </button>
        </div>

        {message && (
          <div className="text-sm text-secondary text-center mt-2">
            {message}
          </div>
        )}
      </div>
    </Glass>
  );
};
