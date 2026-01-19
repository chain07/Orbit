import React, { useContext, useState, useEffect } from 'react';
import { StorageContext } from '../../context/StorageContext';
import { Icons } from '../ui/Icons';
import { OrbitButton } from '../ui/OrbitButton';
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

  const percent = storageStats.percent.toFixed(1);

  return (
    <div className="card">
      <div className="section-label">Storage</div>
      {/* Storage Meter */}
      <div className="flex flex-col gap-2 mb-6">
        <div className="flex justify-between text-sm text-secondary font-medium">
          <span>Local Storage</span>
          <span>{percent}%</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden dark:bg-gray-800">
          <div
            className={`h-full transition-all duration-500 ${percent > 80 ? 'bg-red-500' : 'bg-blue-500'}`}
            style={{
              width: `${percent}%`,
              backgroundColor: percent > 80 ? 'var(--red)' : 'var(--blue)'
            }}
          />
        </div>
        <div className="text-xs text-secondary text-right">
          {storageStats.mb} MB / 5.00 MB
        </div>
      </div>

      <div className="section-label">Archival Engine</div>
      <p className="text-secondary text-sm mb-6 mt-1 leading-relaxed">
        Offload data older than 1 year to a JSON file and remove it from local storage to free up space.
      </p>

      <OrbitButton
        onClick={handleArchiveOldData}
        variant="secondary"
        className="w-full mb-6"
        icon={<Icons.Archive size={16} />}
      >
        Archive Old Data
      </OrbitButton>

      <div className="section-label mt-6">Universal Export</div>
      <div className="flex flex-col gap-3">
         <OrbitButton
            onClick={handleExportJSON}
            variant="primary"
            className="w-full"
            icon={<Icons.Download size={16} />}
          >
            JSON Backup
          </OrbitButton>

          <OrbitButton
            onClick={handleExportCSV}
            variant="secondary"
            className="w-full"
            icon={<Icons.Download size={16} />}
          >
            CSV Export
          </OrbitButton>
      </div>

      <div className="border-t border-separator/50 my-6" />

      <div className="flex gap-3">
           <OrbitButton
             onClick={handleImportClick}
             variant="secondary"
             className="flex-1"
             icon={<Icons.Upload size={16} />}
           >
             Import
           </OrbitButton>

           <input
             type="file"
             id="import-file"
             accept="application/json"
             className="hidden"
             onChange={handleImportFile}
           />

           <OrbitButton
             onClick={handleNuke}
             variant="destructive"
             className="flex-1"
           >
             Reset
           </OrbitButton>
      </div>
    </div>
  );
};
