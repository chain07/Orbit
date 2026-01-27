# ORBIT — System Architecture & Specification
**Status:** Unified Master Document  
**Goal:** Define the system requirements (Spec) and the implementation strictures (Architecture).

---

## 1. Vision & Mandate
ORBIT is a local-first, offline-capable Progressive Web App (PWA) designed as a **Life Operating System**.

It converges high-fidelity Apple-native UI/UX with a schema-driven, Notion-style data model. The system is built for users who require total data sovereignty, high performance, and absolute self-reliance.

**This document is binding.** Any implementation that violates these architectural layers or functional requirements is invalid.

---

## 2. High-Level Architecture (The 3-Layer Model)
To ensure long-term stability and testability, ORBIT follows a strict three-layer architecture.

### 2.1 Layer 1: Storage (Persistence & State)
The Storage Layer is the single source of truth.
* **Hybrid Persistence Model:**
    *   **IndexedDB (Heavy Data):** Metrics, Logs, and TimeLogs are stored in IndexedDB using a vanilla wrapper (`src/lib/db.js`) to support large datasets without blocking the main thread.
    *   **localStorage (Config):** Lightweight settings (Widget Layouts, Onboarding) remain in localStorage for synchronous access.
* **Optimistic UI:** The application state (React Context) is updated immediately for rendering. DB operations are side effects.
* **Safety:** Schema changes must be handled via a `migrateData` utility. Legacy data in localStorage is automatically migrated to IndexedDB on initialization.
* **Data Portability:** JSON import/export reads from and writes to the IndexedDB stores asynchronously.

### 2.2 Layer 2: Engine (Logic & Analytics)
The "Shared Brain" of the system.
* **Isolation:** Engines are pure TypeScript/JavaScript. **No React imports or UI libraries are allowed in this layer.**
* **Responsibility:** Handles all streak calculations, rolling averages, heuristic analysis, and data normalization.
* **Performance:**
    * **Momentum Logic:** Must calculate 7-day rolling window deltas using single-pass reduction ($O(N)$ complexity).
    * **Merged Stream:** The Analytics Engine consumes a unified `allLogs` array (Logs + Normalized TimeLogs).

### 2.3 Layer 3: Presentation (UI & Interaction)
The "Dumb" View Layer.
* **Constraint:** Components **never** perform analytics or data processing. They only consume and format Engine outputs.
* **Registry-Driven:** Dashboard layouts are generated dynamically via a `WidgetRegistry`.
* **Liquid Native:** Layouts are enforced via strict inline styles (flexbox/grid) to prevent external CSS cascading issues and ensure pixel-perfect rendering (e.g., Stacked Bar Chart layout).

---

## 3. Data Architecture (The Unified Contract)
The system operates on three primary schemas.

### 3.1 MetricConfig (Definition)
Defines quantitative tracking parameters.
* `id`: UUID (Primary Key)
* `label`: Human-readable display name
* `type`: `boolean` | `number` | `duration` | `range` | `select` | `text`
* `goal`: Optional daily target
* `widgetType`: `ring` | `sparkline` | `heatmap` | `stackedbar` | `progress` | `compound` | `history` | `streak`

### 3.2 LogEntry (The Stream)
The immutable record of events.
* `id`: UUID
* `metricId`: Foreign key to MetricConfig (Strictly enforced).
* `value`: Raw value (Number or String).
* `timestamp`: ISO string (UTC).

### 3.3 TimeLog (Duration)
Rich data for activity tracking.
* `id`: UUID
* `activityId`: Foreign key to metric (maps to `metricId` in logic).
* `startTime` / `endTime`: ISO timestamps.
* `duration`: Decimal hours.
* *Note:* Must resolve to the `LogEntry` stream for analytics via the `allLogs` merger.

### 3.4 The Library (Qualitative)
* **Structure:** Notion-style, block-based archive.
* **Content:** Supports arbitrary headings, lists, code blocks, and rich text.

---

## 4. Functional Structure (The 4-Tab System)
The application structure is fixed.

### 4.1 Tab 1: Horizon (Proactive Dashboard)
* **Daily Briefing:** A persisted, context-aware insight card (Tactical vs Strategic).
* **Dynamic Bento Grid:** User-editable layouts where widget visibility and order are persisted in localStorage.
* **Widgets:** Includes specialized visualizers like Reliability Rings, Segmented Bars (with auto-color assignment), and Consistency Heatmaps.

### 4.2 Tab 2: Logger (Input Engine)
* **Daily Check-In:** "Card Stack" form engine with native-fidelity inputs (Steppers, Toggles).
* **Time Tracker:** Stopwatch-style live tracking and manual entry.
* **Timeline:** Collapsible, date-grouped visualization of the log history.

### 4.3 Tab 3: Intel (Analytics)
* **Report Generator:** Compiles system health and correlations into exportable Markdown reports.
* **Telemetry:** Custom SVG stacked bars and overlays.

### 4.4 Tab 4: System (Configuration)
* **Data Management:** "God Mode" seeder, Backup/Restore (Async via IndexedDB), and Nuke functionality.
* **Metric Builder:** CRUD operations for schemas.

---

## 5. Technical Stack & Constraints

### 5.1 The Stack
* **Runtime:** React 19 + Vite.
* **Architecture:** Zero Dependency (Vanilla JS DB Wrapper).
* **Styling:** Standard CSS + Inline Styles ("Liquid Native" approach).
* **Icons:** Custom SVG Icons.
* **Motion:** CSS Transitions + Web Animations API.
* **Charting:** Custom SVG primitives only (No Recharts/Chart.js).

### 5.2 Scaling & Normalization
* **Storage Scale:** Raw values are stored unmodified.
* **Internal Scale:** Engines normalize data to `0–1` for math.
* **UI Return Scale:** All UI-facing outputs return `0–100` for consistency.

---

## 6. Maintenance & Operations

### 6.1 Build & Deploy
* **PWA:** Managed via `vite-plugin-pwa`.
* **Manifest:** Defined as a standalone tool with **portrait-locked** orientation.

### 6.2 Data Integrity
* **Versioning:** System includes a `migrateData` utility for schema updates.
* **Migration:** Legacy localStorage data is automatically migrated to IndexedDB on first load.
