import React, { useContext, useState, useEffect } from 'react';
import { StorageContext } from '../../context/StorageContext';
import { OrbitDB } from '../../lib/db';
import { Icons } from '../ui/Icons';
import { OrbitButton } from '../ui/OrbitButton';
import { createMetric, createLog, createTimeLog, MetricType, WidgetType } from '../../types/schemas';
import '../../styles/index.css';

export const DataManagement = () => {
  const {
    metrics,
    logEntries,
    timeLogs,
    importData,
    clearAllData
  } = useContext(StorageContext);

  const [stats, setStats] = useState({ items: 0 });
  const [isSeeding, setIsSeeding] = useState(false);

  useEffect(() => {
    // Count items (simple sync check from context state which mirrors DB)
    const count = metrics.length + logEntries.length + timeLogs.length;
    setStats({ items: count });
  }, [metrics, logEntries, timeLogs]);

  const handleArchiveOldData = async () => {
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

    if (!window.confirm(`This will archive ${count} items (older than 1 year) to a JSON file and remove them from this device.\n\nContinue?`)) {
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

    try {
        for (const l of oldLogs) await OrbitDB.delete('logs', l.id);
        for (const t of oldTimeLogs) await OrbitDB.delete('timeLogs', t.id);
        alert("Archive complete. Old data removed.");
        window.location.reload();
    } catch (e) {
        console.error(e);
        alert("Error removing archived data.");
    }
  };

  const handleExportJSON = async () => {
    const dbMetrics = await OrbitDB.getAll('metrics');
    const dbLogs = await OrbitDB.getAll('logs');
    const dbTimeLogs = await OrbitDB.getAll('timeLogs');
    const layout = JSON.parse(localStorage.getItem('orbit_widget_layout') || '{}');
    const onboarding = JSON.parse(localStorage.getItem('orbit_onboarding') || 'false');

    const data = {
      metrics: dbMetrics,
      logEntries: dbLogs,
      timeLogs: dbTimeLogs,
      widgetLayout: layout,
      onboardingComplete: onboarding,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
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
      csvContent += `${log.timestamp},"${metricName}",${log.value}\n`;
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
    reader.onload = async (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        await importData(data);
        alert('Import successful!');
      } catch (err) {
        console.error("Invalid JSON", err);
        alert('Failed to parse JSON');
      }
    };
    reader.readAsText(file);
  };

  const handleNuke = async () => {
    if (window.confirm("⚠️ DANGER: This will wipe ALL data. Are you sure?")) {
      if (window.confirm("Really? This cannot be undone.")) {
        await clearAllData();
        window.location.reload();
      }
    }
  };

  const seedTestData = async () => {
      if (!window.confirm("Inject 30 days of test data? This replaces existing data.")) return;

      setIsSeeding(true);
      try {
          await clearAllData();

          // 1. Create Metrics
          const m1 = createMetric({ name: 'read_30', label: 'Read 30 mins', type: MetricType.BOOLEAN, color: '#34C759', widgetType: WidgetType.STREAK, goal: 1 });
          const m2 = createMetric({ name: 'water', label: 'Water (oz)', type: MetricType.NUMBER, color: '#007AFF', widgetType: WidgetType.RING, goal: 100, unit: 'oz' });
          // Coding -> Progress Bar
          const m3 = createMetric({ name: 'coding', label: 'Coding', type: MetricType.DURATION, color: '#AF52DE', widgetType: WidgetType.PROGRESS, goal: 4, unit: 'hrs' });
          const m4 = createMetric({ name: 'energy', label: 'Energy', type: MetricType.RANGE, color: '#FF9500', widgetType: WidgetType.HEATMAP, range: {min:1, max:10}, goal: 8 });
          // Mood -> Compound Bar
          const m5 = createMetric({ name: 'mood', label: 'Mood', type: MetricType.SELECT, color: '#FF2D55', widgetType: WidgetType.COMPOUND, options: ['Good', 'Neutral', 'Bad'], goal: null });
          // New Metric for History Widget testing
          const m6 = createMetric({ name: 'journal', label: 'Journal', type: MetricType.TEXT, color: '#5AC8FA', widgetType: WidgetType.HISTORY, goal: null });

          const newMetrics = [m1, m2, m3, m4, m5, m6];

          // 2. Create Logs (30 days)
          const newLogs = [];
          const newTimeLogs = [];

          const now = new Date();

          for (let i = 0; i < 30; i++) {
              const date = new Date(now);
              date.setDate(date.getDate() - i);
              const isoDate = date.toISOString();

              // M1: Read (Random boolean)
              if (Math.random() > 0.3) {
                  newLogs.push(createLog({ metricId: m1.id, value: true, timestamp: isoDate }));
              }

              // M2: Water (Random 0-120)
              const waterVal = Math.floor(Math.random() * 120);
              newLogs.push(createLog({ metricId: m2.id, value: waterVal, timestamp: isoDate }));

              // M3: Coding (TimeLog)
              if (Math.random() > 0.2) {
                  const durationHrs = 1 + Math.random() * 5;
                  const start = new Date(date);
                  start.setHours(10, 0, 0);
                  const end = new Date(start.getTime() + durationHrs * 60 * 60 * 1000);

                  newTimeLogs.push(createTimeLog({
                      activityId: m3.id,
                      activityLabel: 'Coding Session',
                      startTime: start.toISOString(),
                      endTime: end.toISOString(),
                      duration: durationHrs
                  }));
              }

              // M4: Energy (1-10)
              const energyVal = Math.floor(Math.random() * 10) + 1;
              newLogs.push(createLog({ metricId: m4.id, value: energyVal, timestamp: isoDate }));

              // M5: Mood
              const moods = ['Good', 'Neutral', 'Bad'];
              const moodVal = moods[Math.floor(Math.random() * moods.length)];
              newLogs.push(createLog({ metricId: m5.id, value: moodVal, timestamp: isoDate }));

              // M6: Journal
              if (i < 5) { // Only last 5 days
                  newLogs.push(createLog({ metricId: m6.id, value: "Logged entry...", timestamp: isoDate }));
              }
          }

          // Bulk Insert
          await OrbitDB.clear('metrics');
          for (const m of newMetrics) await OrbitDB.put('metrics', m);

          await OrbitDB.clear('logs');
          for (const l of newLogs) await OrbitDB.add('logs', l);

          await OrbitDB.clear('timeLogs');
          for (const t of newTimeLogs) await OrbitDB.add('timeLogs', t);

          // Layout
          const layout = { Horizon: newMetrics.map(m => m.id) };
          localStorage.setItem('orbit_widget_layout', JSON.stringify(layout));
          localStorage.setItem('orbit_onboarding', JSON.stringify(true));

          alert("Seeding complete. Reloading...");
          window.location.reload();

      } catch (e) {
          console.error(e);
          alert("Seeding failed: " + e.message);
      } finally {
          setIsSeeding(false);
      }
  };

  return (
    <div className="card" style={{ transform: 'none', transition: 'none' }}>
      <div className="section-label">Database Status</div>
      <div className="flex flex-col gap-2 mb-6">
        <div className="flex justify-between text-sm text-secondary font-medium">
          <span>Total Items</span>
          <span className="font-mono">{stats.items}</span>
        </div>
        <div className="text-xs text-secondary opacity-60">
          Powered by IndexedDB (Local)
        </div>
      </div>

      <div className="section-label section-archival">Archival Engine</div>
      <p className="text-secondary text-sm archival-description leading-relaxed">
        Offload data older than 1 year to a JSON file and remove it from local storage.
      </p>

      <OrbitButton
        onClick={handleArchiveOldData}
        variant="secondary"
        className="w-full mb-6"
        icon={<Icons.Archive size={16} />}
      >
        Archive Old Data
      </OrbitButton>

      <div className="section-label section-export">Universal Export</div>
      <div style={{ display: 'flex', gap: '12px' }}>
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

      <div className="flex flex-col gap-3">
           <OrbitButton
             onClick={handleImportClick}
             variant="secondary"
             className="w-full"
             icon={<Icons.Upload size={16} />}
           >
             Import Backup
           </OrbitButton>

           <input
             type="file"
             id="import-file"
             accept="application/json"
             className="hidden"
             onChange={handleImportFile}
           />

           <div className="flex gap-3 mt-2">
               <OrbitButton
                 onClick={seedTestData}
                 variant="secondary"
                 className="flex-1"
                 disabled={isSeeding}
               >
                 {isSeeding ? "Seeding..." : "Seed Data"}
               </OrbitButton>

               <OrbitButton
                 onClick={handleNuke}
                 variant="destructive"
                 className="flex-1"
               >
                 Reset DB
               </OrbitButton>
           </div>
      </div>
    </div>
  );
};
