# ORBIT Naming Conventions

**Version:** 1.2.0
**Last Updated:** 2026-05-20
**Status:** 🔒 LOCKED - Changes require architecture review

---

## Purpose

This document is the **single source of truth** for naming across the ORBIT codebase. Every variable, property, function parameter, and component prop must follow these conventions.

**Rule #1:** When in doubt, check this document.  
**Rule #2:** If this document doesn't cover it, update this document first, then write code.

---

## Core Principles

1. **Consistency Over Cleverness** - Use the boring, predictable name
2. **Explicit Over Implicit** - `metricId` not `id`, `startDate` not `start`
3. **Singular vs Plural Matters** - `metric` = one thing, `metrics` = array of things
4. **No Abbreviations** - `metric` not `met`, `value` not `val` (exception: common acronyms like `id`, `url`)
5. **Zero External Dependencies** - Use internal utilities and standards over external libraries.

---

## Icons (Zero Dependency)

All icons must be imported from the internal Icon Registry.

```javascript
// ✅ CORRECT
import { Icons } from '../components/ui/Icons';
<Icons.Settings size={24} />

// ❌ WRONG
import { Settings } from 'lucide-react'; // Banned
```

---

## Schema-Level Naming (The Foundation)

### MetricConfig Object

**Purpose:** Represents a user-defined metric configuration.

| Property | Type | Description | Usage Example |
|----------|------|-------------|---------------|
| `id` | string (UUID) | Unique identifier | `metric.id` |
| `name` | string | Internal machine-readable key | `metric.name` (used in code logic) |
| `label` | string | Human-readable display name | `metric.label` (shown in UI) |
| `type` | string | Data type: `'boolean'` \| `'number'` \| `'duration'` \| `'range'` \| `'select'` \| `'text'` | `metric.type` |
| `goal` | number \| null | Target value for this metric | `metric.goal` |
| `color` | string | Hex color code | `metric.color` (e.g., `'#007AFF'`) |
| `widgetType` | string | Widget rendering type | `metric.widgetType` (e.g., `'ring'`, `'sparkline'`) |
| `dashboardVisible` | boolean | Show on Horizon dashboard | `metric.dashboardVisible` |
| `unit` | string (optional) | Display unit | `metric.unit` (e.g., `'hrs'`, `'reps'`) |
| `displayOrder` | number (optional) | Sort order in UI | `metric.displayOrder` |
| `range` | object | Range config ({min, max, step}) | `metric.range.min` |
| `options` | string[] | Options for select type | `metric.options` |

**CRITICAL RULES:**
- ✅ Always use `metric.id` when filtering logs
- ✅ Use `metric.label` for UI display
- ✅ Use `metric.name` only for internal logic keys
- ❌ NEVER use `metricKey` - this is deprecated

---

### LogEntry Object

**Purpose:** Represents a single data point logged by the user.

| Property | Type | Description | Usage Example |
|----------|------|-------------|---------------|
| `id` | string (UUID) | Unique identifier | `log.id` |
| `metricId` | string (UUID) | Foreign key to metric | `log.metricId` |
| `value` | any | The logged value (type depends on metric.type) | `log.value` |
| `timestamp` | string (ISO) | When this was logged | `log.timestamp` |

**CRITICAL RULES:**
- ✅ Always use `metricId` to associate logs with metrics
- ❌ NEVER use `metricKey` - this is deprecated
- ✅ `value` type must match the parent metric's `type`:
  - `type: 'boolean'` → `value: true/false`
  - `type: 'number'` → `value: number`
  - `type: 'duration'` → `value: number` (hours as decimal)
  - `type: 'range'` → `value: number`
  - `type: 'select'` → `value: string`
  - `type: 'text'` → `value: string`

---

### TimeLog Object

**Purpose:** Represents a time-tracked activity session.

| Property | Type | Description | Usage Example |
|----------|------|-------------|---------------|
| `id` | string (UUID) | Unique identifier | `timeLog.id` |
| `activityId` | string (UUID) | Foreign key to metric | `timeLog.activityId` |
| `activityLabel` | string | Display name of activity | `timeLog.activityLabel` |
| `startTime` | string (ISO) | Session start timestamp | `timeLog.startTime` |
| `endTime` | string (ISO) | Session end timestamp | `timeLog.endTime` |
| `duration` | number | Duration in hours (decimal) | `timeLog.duration` |
| `notes` | string (optional) | User notes | `timeLog.notes` |

**CRITICAL RULES:**
- ✅ `duration` is always in hours as a decimal (e.g., `1.5` = 1 hour 30 minutes)
- ✅ Use `activityId` to link to a metric
- ✅ `activityLabel` is denormalized for display convenience

---

## Function Parameter Naming

### Collections (Always Plural)

| Parameter Name | Type | Description |
|---------------|------|-------------|
| `metrics` | MetricConfig[] | Array of metric configurations |
| `logEntries` | LogEntry[] | Array of log entries |
| `logs` | LogEntry[] | Array of log entries (shorthand, use in Engines only) |
| `timeLogs` | TimeLog[] | Array of time logs |
| `entries` | any[] | Generic array when type is obvious from context |

**NEVER use:** `metricList`, `logArray`, `metricData` (redundant suffixes)

---

### Single Items (Always Singular)

| Parameter Name | Type | Description |
|---------------|------|-------------|
| `metric` | MetricConfig | A single metric configuration |
| `logEntry` | LogEntry | A single log entry |
| `log` | LogEntry | A single log entry (shorthand) |
| `timeLog` | TimeLog | A single time log |
| `entry` | any | Generic single item |

---

### Filter Parameters (Be Explicit)

| Parameter Name | Type | Description | Example |
|---------------|------|-------------|---------|
| `metricId` | string (UUID) | Filter by specific metric | `currentStreak(logs, metricId)` |
| `startDate` | string (ISO) | Filter by start date | `getLogsInRange(logs, startDate, endDate)` |
| `endDate` | string (ISO) | Filter by end date | `getLogsInRange(logs, startDate, endDate)` |
| `windowDays` | number | Number of days to look back | `rollingAverage(logs, metricId, windowDays)` |
| `segment` | string | Time period (`'Daily'` \| `'Weekly'` \| `'Monthly'`) | `generateWidgets(metrics, logs, segment)` |

**NEVER use:** `id` (ambiguous), `start`, `end`, `window`, `period` (unclear units)

---

## Value Normalization & Scaling

### The 0-1 vs 0-100 Problem

**RULE:** Different layers use different scales. Know which layer you're in.

| Layer | Scale | Example | Used In |
|-------|-------|---------|---------|
| **Storage Layer** | Raw values (as logged) | `value: 8` for "8 reps" | `LogEntry.value` |
| **Engine Layer (Internal)** | 0-1 (normalized) | `0.8` for "80% of goal" | `MetricEngine.normalizeValue()` |
| **Engine Layer (External API)** | 0-100 (percentage) | `80` for "80% completion" | `MetricEngine.goalCompletion()` |
| **Widget Data Layer** | 0-100 (percentage) | `80` for "80% completion" | `WidgetDataEngine` output |
| **Widget Display Layer** | 0-100 (percentage) | "80%" string | React components |

**Function Naming Convention:**
- `normalize*()` functions → return 0-1
- `*Completion()` functions → return 0-100
- `*Percentage()` functions → return 0-100

**Example:**
```javascript
// ✅ CORRECT
MetricEngine.normalizeValue(metric, 8) // Returns 0.8 (80% of goal)
MetricEngine.goalCompletion(metric, logs) // Returns 80 (as percentage)

// ❌ WRONG - Don't mix scales
const normalized = MetricEngine.goalCompletion(metric, logs) / 100 // NO!
```

---

## Component Prop Naming

### Widget Component Props (Standard Interface)

All widget components must accept these props:

| Prop Name | Type | Description | Required |
|-----------|------|-------------|----------|
| `data` | object | Widget-specific data shape | ✅ Yes |
| `title` | string | Widget title for display | ✅ Yes |
| `className` | string | Additional CSS classes | ❌ No |

**Widget-Specific Data Shapes:**

#### RingChart Data Shape
```javascript
{
  value: number,        // 0-100 (percentage)
  label: string,        // e.g., "85%" or "8/10"
  color: string,        // Hex color
  size: number,         // Optional, defaults handled by component
  strokeWidth: number   // Optional
}
```

#### Sparkline Data Shape
```javascript
{
  data: number[],       // Array of values
  lineColor: string,    // Hex color
  fillColor: string,    // Hex color (optional)
  labels: string[],     // Optional x-axis labels
  showDots: boolean     // Optional
}
```

#### HeatMap Data Shape
```javascript
{
  values: object,       // { 'YYYY-MM-DD': number } (0-1 normalized)
  startDate: string,    // ISO date string
  endDate: string,      // ISO date string
  colorScale: function  // Optional custom color function
}
```

#### StackedBar Data Shape
```javascript
{
  entries: array,       // [{ label: string, values: { [category]: number } }]
  colors: object,       // { [category]: hexColor }
  maxValue: number,     // Optional max Y value
  height: number        // Optional chart height
}
```

**CRITICAL RULES:**
- ✅ Sparkline uses `data` prop (NOT `values`)
- ✅ HeatMap uses `values` prop (NOT `data`) - it's a key/value map
- ✅ All colors are hex strings (e.g., `'#007AFF'`)
- ✅ All percentages in widget data are 0-100

---

## React Component Naming

### Component Files
- PascalCase for components: `DailyCheckInForm.jsx`
- Descriptive, not abbreviated: `MetricBuilder` not `MetBuilder`

### Component Function Names
```javascript
// ✅ CORRECT
export const DailyCheckInForm = ({ metrics, onSubmit }) => { ... }

// ❌ WRONG
export default function Form() { ... }  // Too generic
export const DailyForm = () => { ... }  // Abbreviated
```

### Event Handler Props
| Pattern | Example | Usage |
|---------|---------|-------|
| `on[Event]` | `onChange`, `onClick`, `onSubmit` | Callback props |
| `handle[Event]` | `handleChange`, `handleClick` | Internal functions |

```javascript
// ✅ CORRECT
const MetricInput = ({ value, onChange }) => {
  const handleChange = (e) => {
    onChange(e.target.value);
  };
  return <input value={value} onChange={handleChange} />;
};

// ❌ WRONG
const MetricInput = ({ value, change }) => { ... }  // Inconsistent naming
```

---

## Engine & Utility Naming

### File Naming
- PascalCase with `Engine` suffix: `MetricEngine.js`
- PascalCase for utilities: `HorizonAgent.js`
- camelCase for pure utility files: `dateUtils.js`

### Export Patterns

**For Engines (singleton object with methods):**
```javascript
// ✅ CORRECT
export const MetricEngine = {
  currentStreak: (logs, metricId) => { ... },
  goalCompletion: (metric, logs) => { ... }
};

// ❌ WRONG
export default { ... }  // Don't use default export for engines
```

**For Utilities (named functions):**
```javascript
// ✅ CORRECT
export const dateUtils = {
  formatDate: (date) => { ... },
  diffDays: (dateA, dateB) => { ... }
};
```

### Function Naming in Engines

| Pattern | Returns | Example |
|---------|---------|---------|
| `get*()` | A value or object | `getTotal(logs)` |
| `calculate*()` | A computed value | `calculateCurrentStreak(logs)` |
| `normalize*()` | 0-1 value | `normalizeValue(metric, value)` |
| `*Completion()` | 0-100 percentage | `goalCompletion(metric, logs)` |
| `generate*()` | New data structure | `generateWidgets(metrics, logs)` |

---

## State Management Naming

### Context Values
```javascript
// ✅ CORRECT
const { metrics, logEntries, addMetric, updateMetric } = useContext(StorageContext);

// ❌ WRONG
const { data, entries, add, update } = useContext(StorageContext); // Too generic
```

### Local State Variables
```javascript
// ✅ CORRECT
const [selectedMetricId, setSelectedMetricId] = useState('');
const [isEditingLayout, setIsEditingLayout] = useState(false);
const [formData, setFormData] = useState({});

// ❌ WRONG
const [selected, setSelected] = useState('');  // What is being selected?
const [editing, setEditing] = useState(false); // What is being edited?
const [data, setData] = useState({});          // Too generic
```

### Boolean State Naming
Use `is*`, `has*`, `should*` prefixes:

```javascript
// ✅ CORRECT
const [isLoading, setIsLoading] = useState(false);
const [hasError, setHasError] = useState(false);
const [shouldShowModal, setShouldShowModal] = useState(false);

// ❌ WRONG
const [loading, setLoading] = useState(false);  // Ambiguous
const [error, setError] = useState(false);      // Could be error object
```

---

## CSS Class Naming

### Utility Classes (Tailwind-style)
- Use existing Tailwind conventions: `flex`, `items-center`, `gap-4`
- Custom utilities follow same pattern: `safe-bottom`, `fade-in`

### Component-Specific Classes
- kebab-case: `metric-builder`, `daily-checkin-form`
- BEM-style for modifiers: `card--highlighted`, `btn--primary`

```css
/* ✅ CORRECT */
.metric-input { ... }
.metric-input--disabled { ... }
.metric-input__label { ... }

/* ❌ WRONG */
.metricInput { ... }        /* Don't use camelCase */
.metric_input { ... }       /* Don't use snake_case */
```

---

## Constants & Enums

### Naming Convention
- SCREAMING_SNAKE_CASE for true constants
- PascalCase for enum-like objects

```javascript
// ✅ CORRECT - True constants
const MAX_STREAK_DAYS = 365;
const DEFAULT_WIDGET_HEIGHT = 200;

// ✅ CORRECT - Enum-like objects
export const MetricType = Object.freeze({
  BOOLEAN: 'boolean',
  NUMBER: 'number',
  DURATION: 'duration'
});

export const WidgetType = Object.freeze({
  RING: 'ring',
  SPARKLINE: 'sparkline',
  HEATMAP: 'heatmap'
});

// ❌ WRONG
const metricType = { ... };           // Should be PascalCase
const METRIC_TYPE = { ... };          // Confusing (looks like constant)
```

### Usage in Code
```javascript
// ✅ CORRECT
if (metric.type === MetricType.BOOLEAN) { ... }

// ❌ WRONG
if (metric.type === 'boolean') { ... }  // Magic string
```

---

## File & Folder Naming

### Folder Structure
```
src/
  components/
    ui/           # Lowercase for utility categories
    widgets/      # Lowercase for categories
    horizon/      # Lowercase for view-specific components
  engine/         # Lowercase singular (it's a category, not a collection)
  views/          # Lowercase plural (collection of views)
  lib/            # Lowercase (utilities/helpers)
  context/        # Lowercase (providers)
  styles/         # Lowercase (assets)
```

### File Naming Patterns

| Type | Pattern | Example |
|------|---------|---------|
| React Component | PascalCase.jsx | `MetricBuilder.jsx` |
| Engine/Utility | PascalCase.js | `MetricEngine.js` |
| Context Provider | PascalCase.jsx | `StorageContext.jsx` |
| Utility Module | camelCase.js | `dateUtils.js` |
| Style File | kebab-case.css | `motion.css` |

---

## Import/Export Patterns

### Named Exports (Preferred)
```javascript
// ✅ CORRECT - File: MetricEngine.js
export const MetricEngine = { ... };

// ✅ CORRECT - File: MetricBuilder.jsx
export const MetricBuilder = ({ ... }) => { ... };

// Usage
import { MetricEngine } from '../engine/MetricEngine';
import { MetricBuilder } from '../components/system/MetricBuilder';
```

### Default Exports (Use Sparingly)
Only for main App component or single-purpose files:

```javascript
// ✅ ACCEPTABLE - File: App.jsx
export const App = () => { ... };
// OR
export default App;

// ❌ AVOID for utilities and engines
export default MetricEngine;  // Prefer named export
```

---

## Deprecation List

**These names are BANNED. Do not use them anywhere.**

| Deprecated | Use Instead | Reason |
|------------|-------------|--------|
| `metricKey` | `metricId` | Inconsistent with schema |
| `key` | `id` or `metricId` | Too ambiguous |
| `data` (as param) | `metrics`, `logs`, `entries` | Too generic |
| `val` | `value` | Abbreviation |
| `idx` | `index` or `i` (in loops only) | Unclear |
| `bool` | `boolean` | Not JavaScript type name |
| `num` | `number` | Abbreviation |
| `str` | `string` | Abbreviation |
| `lucide-react` | `Icons` | External dependency banned |
| `framer-motion` | `CSS Transitions` | External dependency banned |

---

## Quick Reference Cheat Sheet

```javascript
// ✅ THE GOLDEN PATTERNS

// 1. Metric Properties
metric.id         // UUID
metric.name       // Internal key
metric.label      // Display name
metric.type       // 'boolean' | 'number' | 'duration'
metric.goal       // Target number
metric.color      // Hex string

// 2. Log Properties
log.id            // UUID
log.metricId      // Foreign key (NOT metricKey)
log.value         // Any type
log.timestamp     // ISO string

// 3. Function Parameters
(metrics, logs, metricId, windowDays, segment)

// 4. Return Values
// Normalized: 0-1
MetricEngine.normalizeValue(metric, value)

// Percentage: 0-100
MetricEngine.goalCompletion(metric, logs)

// 5. State Variables
const [selectedMetricId, setSelectedMetricId] = useState('');
const [isEditingLayout, setIsEditingLayout] = useState(false);

// 6. Event Handlers
const handleChange = (value) => { ... };  // Internal
onChange={handleChange}                    // Prop

// 7. Widget Props
<RingChart 
  data={{ value: 85, label: "85%", color: "#007AFF" }}
  title="Completion"
/>
```

---

## Enforcement & Verification

### Pre-Commit Checklist
Before committing code, verify:
- [ ] No `metricKey` usage (grep for it)
- [ ] All function params match naming conventions
- [ ] All widget data shapes documented
- [ ] All new constants added to appropriate enum

### Code Review Checklist
When reviewing PRs:
- [ ] Variable names follow conventions
- [ ] No magic strings (use enums)
- [ ] Return values match documented scales (0-1 vs 0-100)
- [ ] Widget props match registry definitions

---

## Change Log

| Date | Version | Change | Author |
|------|---------|--------|--------|
| 2026-05-20 | 1.2.0 | Removed external dependencies (lucide, framer-motion). Updated Icon guidelines. | Jules |
| 2026-01-20 | 1.1.0 | Added RANGE, SELECT, TEXT metric types. Expanded TimeLog schema. | Jules |
| 2026-01-16 | 1.0.0 | Initial creation from stabilization audit | System Architect |

---

**END OF NAMING CONVENTIONS**

When in doubt, ask: "Is this name consistent with existing usage in this document?"
If no, update your code. If the pattern doesn't exist here, update this document first.
