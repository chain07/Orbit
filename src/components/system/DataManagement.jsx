import React, { useContext, useState, useEffect, useMemo } from 'react';
import { StorageContext } from '../../context/StorageContext';
import { Glass } from '../ui/Glass';
import { Icons } from '../ui/Icons';
import '../../styles/index.css';

export const DataManagement = () => {
  const {
    metrics,
    logEntries,
    timeLogs,
    exportData,
    importData,
    clearAllData
  } = useContext(StorageContext);

  const [storageStats, setStorageStats] = useState({ usedBytes: 0, percent: 0, mb: '0.00' });

  useEffect(() => {
    const calculateUsage = () => {
      try {
        const db = localStorage.getItem('orbit_db') || '';
        const archive = localStorage.getItem('orbit_archive') || '';
        const totalBytes = (db.length + archive.length) * 2;
        const limitBytes = 5242880; // 5MB limit
        const percent = Math.min((totalBytes / limitBytes) * 100, 100);

        setStorageStats({
          usedBytes: totalBytes,
          percent: percent,
          mb: (totalBytes / (1024 * 1024)).toFixed(2)
        });
      } catch (e) {
        console.error("Storage calculation failed", e);
      }
    };

    calculateUsage();
    const interval = setInterval(calculateUsage, 2000);
    return () => clearInterval(interval);
  }, [logEntries, timeLogs]);

  const getMeterColor = (p) => {
    if (p >= 80) return 'bg-red';
    if (p >= 60) return 'bg-orange';
    return 'bg-green';
  };

  const handleArchiveOldData = () => {
    const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;
    const cutoffTime = Date.now() - ONE_YEAR_MS;
    const cutoffIso = new Date(cutoffTime).toISOString();

    const oldLogs = logEntries.filter(l => l.timestamp < cutoffIso);
    const oldTimeLogs = timeLogs.filter(l => l.startTime < cutoffIso);

    const count = oldLogs.length + oldTimeLogs.length;

    if (count === 0) {
      alert("No data older than 1 year found.");
      return;
    }

    if (!window.confirm(`This will archive ${count} items (older than 1 year) to a JSON file and remove them from this device to free up space.\n\nContinue?`)) {
      return;
    }

    const archivePayload = {
      meta: {
        type: 'ORBIT_ARCHIVE',
        exportedAt: new Date().toISOString(),
        range: { end: cutoffIso },
        version: "1.0.0"
      },
      logEntries: oldLogs,
      timeLogs: oldTimeLogs
    };

    const blob = new Blob([JSON.stringify(archivePayload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orbit-archive-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    const fullData = exportData();
    fullData.logEntries = logEntries.filter(l => l.timestamp >= cutoffIso);
    fullData.timeLogs = timeLogs.filter(l => l.startTime >= cutoffIso);

    importData(fullData);
    alert("Archive complete. Old data removed.");
  };

  const handleExportJSON = () => {
    const data = exportData();
    const json = { ...data };
    const blob = new Blob([JSON.stringify(json, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orbit-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    if (logEntries.length === 0) {
      alert("No logs to export.");
      return;
    }
    let csvContent = "Date,Metric,Value\n";
    logEntries.forEach(log => {
      const metric = metrics.find(m => m.id === log.metricId);
      const metricName = metric ? (metric.label || metric.name) : 'Unknown Metric';
      const date = log.timestamp;
      const value = log.value;
      csvContent += `${date},"${metricName}",${value}\n`;
    });
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orbit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    document.getElementById('import-file').click();
  };

  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        importData(data);
        alert('Import successful!');
      } catch (err) {
        console.error("Invalid JSON", err);
        alert('Failed to parse JSON');
      }
    };
    reader.readAsText(file);
  };

  const handleNuke = () => {
    if (window.confirm("⚠️ DANGER: This will wipe ALL data from this device. Are you sure?")) {
      if (window.confirm("Really? This cannot be undone.")) {
        clearAllData();
      }
    }
  };

  return (
    <Glass className="flex flex-col gap-6 p-5">
      <div className="flex items-center gap-2">
        <Icons.Database size={24} className="text-blue" />
        <h2 className="text-xl font-bold">Data Management</h2>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-xs font-bold text-secondary uppercase tracking-wide">
          <span>Local Storage</span>
          <span>{storageStats.mb} / 5.00 MB ({storageStats.percent.toFixed(1)}%)</span>
        </div>
        <div className="w-full h-3 bg-separator/20 rounded-full overflow-hidden relative">
          <div
            className={`h-full transition-all duration-500 ${getMeterColor(storageStats.percent)}`}
            style={{ width: `${storageStats.percent}%` }}
          />
        </div>
        {storageStats.percent >= 80 && (
          <div className="text-xs text-red font-bold flex items-center gap-1 mt-1">
            <Icons.Database size={12} />
            Storage approaching capacity. Please archive old data.
          </div>
        )}
      </div>

      <div className="border-t border-separator/50" />

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-primary font-bold">
          <Icons.Archive size={18} className="text-purple" />
          <h3>Archival Engine</h3>
        </div>
        <p className="text-xs text-secondary leading-relaxed">
          Offload data older than 1 year to a JSON file and remove it from local storage to free up space.
        </p>
        <button
          onClick={handleArchiveOldData}
          className="w-full py-3 rounded-xl bg-bg-color border border-separator/50 font-bold text-sm text-primary hover:bg-separator/10 transition-colors flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <Icons.Archive size={16} />
          Archive Old Data
        </button>
      </div>

      <div className="border-t border-separator/50" />

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-primary font-bold">
          <Icons.Save size={18} className="text-green" />
          <h3>Universal Export</h3>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={handleExportJSON}
            className="py-3 rounded-xl bg-blue text-white font-bold text-sm shadow-lg shadow-blue/20 active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            <Icons.Download size={16} />
            JSON Backup
          </button>

          <button 
            onClick={handleExportCSV}
            className="py-3 rounded-xl bg-green text-white font-bold text-sm shadow-lg shadow-green/20 active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            <Icons.Download size={16} />
            CSV Export
          </button>
        </div>

        <div className="flex gap-3 mt-2">
           <button
             onClick={handleImportClick}
             className="flex-1 py-3 rounded-xl border border-dashed border-separator bg-bg-color/50 text-secondary font-bold text-sm hover:text-primary hover:border-primary hover:bg-bg-color transition-all active:scale-95 transition-transform flex items-center justify-center gap-2"
           >
             <Icons.Upload size={16} />
             Import JSON
           </button>

           {/* Fixed: Hidden input relying on index.css .hidden */}
           <input
             type="file"
             id="import-file"
             accept="application/json"
             className="hidden"
             onChange={handleImportFile}
           />

           {/* Fixed: Reset All button overflow and styling */}
           <button
             onClick={handleNuke}
             className="flex-1 py-3 px-2 rounded-xl border border-red/30 text-red font-bold text-sm hover:bg-red/5 transition-colors active:scale-95 transition-transform text-center"
           >
             Reset All
           </button>
        </div>
      </div>
    </Glass>
  );
};
