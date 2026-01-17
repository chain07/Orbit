Orbit Audit Report - 2026-01-16

1. Executive Summary
Deployment Status: FAIL. The repository is currently missing critical configuration files (`package.json`, `vite.config.js`) preventing any build or development server startup.
Code Health: Moderate. While the "Zero Dependency" goal is largely met with vanilla JS logic, there are critical compliance violations including the use of banned libraries (`lucide-react`, `framer-motion`), naming convention breaches, and a critical syntax error in the core engine.
Adherence: The project has drifted from the documentation in key areas (Icons, Motion), requiring immediate remediation to align with the "Iron Laws".

2. Documentation Sync Status
[Status: Outdated]
- `docs/phase5_review.md`: Explicitly references `lucide-react` as the "consistent" icon standard, which contradicts the new "Zero Dependency" Icon Registry requirement.
- `docs/design-system.md`: Describes "Interaction Physics" matching `framer-motion` defaults, implying its usage, which conflicts with the strict "No external UI libraries" rule.
- `docs/naming-conventions.md`: References to `framer-motion` or external tools are absent, but the codebase uses them.

3. Critical Blockers (Must Fix)
 * [ ] [Config] Missing `package.json` (Critical: Cannot install or run)
 * [ ] [Config] Missing `vite.config.js` (Critical: Cannot build)
 * [ ] [Logic] Critical Syntax Error in `src/engine/MetricEngine.js`: Duplicate declaration of `const cutoffTime` in `getLastNDaysValues`.
 * [ ] [Dependency] Found `lucide-react` imports in multiple files (Must Migrate to Registry).
 * [ ] [Dependency] Found `framer-motion` imports (Must Migrate to CSS/Vanilla).

4. Compliance Violations
| File | Violation | Docs Reference | Severity |
|---|---|---|---|
| src/engine/MetricEngine.js | Syntax Error (Duplicate `const cutoffTime`) | N/A (JS Syntax) | Critical |
| src/engine/WidgetDataEngine.js | Logic Error: Returns normalized (0-1) data for Sparkline instead of raw/0-100 | naming-conventions.md | High |
| src/views/Horizon.jsx | Used `lucide-react` | Iron Laws | High |
| src/views/Horizon.jsx | Used `framer-motion` | Iron Laws | High |
| src/views/Horizon.jsx | Used undefined Tailwind classes (`bg-gradient-to-r`, etc.) | Iron Laws | Medium |
| src/engine/ReportEngine.js | Used abbreviation `val` as parameter | naming-conventions.md | Medium |
| src/components/ui/charts/Sparkline.jsx | Used abbreviation `val` as parameter | naming-conventions.md | Medium |
| src/components/logger/MetricInput.jsx | Used abbreviation `val` as parameter | naming-conventions.md | Medium |
| src/components/logger/DailyCheckInForm.jsx | Used abbreviation `val` as parameter | naming-conventions.md | Medium |
| src/lib/horizonAgent.js | Used abbreviation `val` as parameter | naming-conventions.md | Medium |

5. Feature Implementation Plan: Icon Registry
Create `src/components/ui/Icons.jsx` to replace `lucide-react`.

```javascript
import React from 'react';

// Standardized Icon Wrapper
const IconWrapper = ({ children, size = 24, color = "currentColor", className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {children}
  </svg>
);

// Raw SVG Paths (Lucide/Feather standard)
export const Icons = {
  X: (props) => (
    <IconWrapper {...props}>
      <path d="M18 6L6 18" />
      <path d="M6 6l12 12" />
    </IconWrapper>
  ),
  LayoutDashboard: (props) => (
    <IconWrapper {...props}>
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </IconWrapper>
  ),
  PenTool: (props) => (
    <IconWrapper {...props}>
      <path d="M12 19l7-7 3 3-7 7-3-3z" />
      <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-17" />
    </IconWrapper>
  ),
  Radio: (props) => (
    <IconWrapper {...props}>
      <circle cx="12" cy="12" r="2" />
      <path d="M16.24 7.76a6 6 0 0 1 0 8.49" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </IconWrapper>
  ),
  Settings: (props) => (
    <IconWrapper {...props}>
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </IconWrapper>
  ),
  GripVertical: (props) => (
    <IconWrapper {...props}>
      <circle cx="9" cy="12" r="1" />
      <circle cx="9" cy="5" r="1" />
      <circle cx="9" cy="19" r="1" />
      <circle cx="15" cy="12" r="1" />
      <circle cx="15" cy="5" r="1" />
      <circle cx="15" cy="19" r="1" />
    </IconWrapper>
  ),
  Eye: (props) => (
    <IconWrapper {...props}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </IconWrapper>
  ),
  EyeOff: (props) => (
    <IconWrapper {...props}>
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </IconWrapper>
  ),
  RotateCcw: (props) => (
    <IconWrapper {...props}>
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </IconWrapper>
  ),
  Copy: (props) => (
    <IconWrapper {...props}>
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </IconWrapper>
  ),
  Download: (props) => (
    <IconWrapper {...props}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </IconWrapper>
  ),
  Check: (props) => (
    <IconWrapper {...props}>
      <polyline points="20 6 9 17 4 12" />
    </IconWrapper>
  ),
  Save: (props) => (
    <IconWrapper {...props}>
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </IconWrapper>
  ),
  Archive: (props) => (
    <IconWrapper {...props}>
      <polyline points="21 8 21 21 3 21 3 8" />
      <rect x="1" y="3" width="22" height="5" />
      <line x1="10" y1="12" x2="14" y2="12" />
    </IconWrapper>
  ),
  Database: (props) => (
    <IconWrapper {...props}>
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </IconWrapper>
  )
};
```

List of Icons Currently Used: `X`, `LayoutDashboard`, `PenTool`, `Radio`, `Settings`, `GripVertical`, `Eye`, `EyeOff`, `RotateCcw`, `Copy`, `Download`, `Check`, `Save`, `Archive`.

6. Feature Implementation Plan: Data Management
Proposed location: `src/views/System.jsx` and `src/components/system/DataManagement.jsx`.

**Storage Calculator Logic (Pseudocode):**
```javascript
const calculateStorageUsage = () => {
  try {
    const db = localStorage.getItem('orbit_db') || '';
    const archive = localStorage.getItem('orbit_archive') || '';
    // Calculate byte size (UTF-16 chars = 2 bytes)
    const bytes = (db.length + archive.length) * 2;
    const megabytes = bytes / (1024 * 1024);
    const percent = (megabytes / 5) * 100; // Assuming 5MB limit

    return {
      usedMB: megabytes.toFixed(2),
      percent: Math.min(percent, 100).toFixed(1),
      isWarning: percent >= 80
    };
  } catch (e) {
    return { usedMB: 0, percent: 0, isWarning: false };
  }
};
```

**Archive & Delete Logic (Pseudocode):**
```javascript
const archiveOldData = () => {
  const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;
  const cutoffTime = Date.now() - ONE_YEAR_MS;
  const cutoffIso = new Date(cutoffTime).toISOString();

  // 1. Identify old data
  const oldLogs = logEntries.filter(l => l.timestamp < cutoffIso);
  const oldTimeLogs = timeLogs.filter(l => l.startTime < cutoffIso);

  if (oldLogs.length === 0 && oldTimeLogs.length === 0) {
    alert("No data older than 1 year found.");
    return;
  }

  // 2. Export to JSON
  const archivePayload = {
    meta: {
      type: 'ORBIT_ARCHIVE',
      exportedAt: new Date().toISOString(),
      range: { end: cutoffIso }
    },
    logEntries: oldLogs,
    timeLogs: oldTimeLogs
  };

  downloadJSON(archivePayload, `orbit-archive-${cutoffIso.split('T')[0]}.json`);

  // 3. Delete from State (Persistence handled by effect)
  const keepLogs = logEntries.filter(l => l.timestamp >= cutoffIso);
  const keepTimeLogs = timeLogs.filter(l => l.startTime >= cutoffIso);

  setLogEntries(keepLogs);
  setTimeLogs(keepTimeLogs);
  alert(`Archived and removed ${oldLogs.length} logs and ${oldTimeLogs.length} time logs.`);
};
```

7. Strategic Suggestions (Non-Blocking)
Optimization
 * Refactor `WidgetDataEngine` to use raw values and let Components handle normalization/scaling to allow for meaningful Y-axis labels.
UX Improvements
 * Replace `framer-motion` `layout` transitions in `SegmentedControl` with FLIP-based CSS transitions to achieve true Zero Dependency.

8. Deployment Checklist
 * [ ] Create `package.json` with `react`, `react-dom` dependencies and `vite` dev dependencies (excluding `lucide-react`, `framer-motion`).
 * [ ] Create `vite.config.js` configured for React.
 * [ ] Run `npm install`.
 * [ ] Fix `MetricEngine.js` syntax error.
 * [ ] Replace `lucide-react` imports with `Icons.jsx`.
 * [ ] Remove `framer-motion` imports and replace with CSS or `Icons.jsx` usage.
