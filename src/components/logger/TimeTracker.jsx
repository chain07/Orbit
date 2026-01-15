import React, { useState, useEffect, useContext } from 'react';
import { StorageContext } from '../../context/StorageContext';

export const TimeTracker = ({ metricKey }) => {
  const { addLogEntry } = useContext(StorageContext);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0); // in seconds

  useEffect(() => {
    let timer;
    if (running) {
      timer = setInterval(() => setElapsed(prev => prev + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [running]);

  const handleStop = () => {
    setRunning(false);
    addLogEntry({
      metricKey,
      value: elapsed / 3600, // convert to hours
      timestamp: new Date(),
    });
    setElapsed(0);
  };

  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h}h ${m}m ${s}s`;
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span>{formatTime(elapsed)}</span>
      <button onClick={() => setRunning(!running)}>
        {running ? 'Pause' : 'Start'}
      </button>
      {running && <button onClick={handleStop}>Stop & Log</button>}
    </div>
  );
};
