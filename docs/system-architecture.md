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
* **Sovereignty:** 100% of user data resides in `localStorage` as raw JSON. No cloud databases.
* **Persistence:** Real-time persistence.
* **Safety:** Schema changes must be handled via a `migrateData` utility to preserve user history.
* **Data Portability:** JSON import/export is a core, mandatory feature.

### 2.2 Layer 2: Engine (Logic & Analytics)
The "Shared Brain" of the system.
* **Isolation:** Engines are pure TypeScript/JavaScript. **No React imports or UI libraries are allowed in this layer.**
* **Responsibility:** Handles all streak calculations, rolling averages, heuristic analysis, and data normalization.
* **Performance:**
    * **Momentum Logic:** Must calculate 7-day rolling window deltas using single-pass reduction ($O(N)$ complexity).
    * **Heuristics:** The Horizon Agent must degrade gracefully to simple trend analysis if the sample size is low ($N < 50$).

### 2.3 Layer 3: Presentation (UI & Interaction)
The "Dumb" View Layer.
* **Constraint:** Components **never** perform analytics or data processing. They only consume and format Engine outputs.
* **Registry-Driven:** Dashboard layouts are generated dynamically via a `WidgetRegistry`, not hardcoded JSX.
* **Parity:** Must strictly adhere to Apple Human Interface Guidelines (HIG) regarding physics, haptics, and layout (see Design System).

---

## 3. Data Architecture (The Unified Contract)
The system operates on three primary schemas.

### 3.1 MetricConfig (Definition)
Defines quantitative tracking parameters.
* `id`: UUID (Primary Key)
* `label`: Human-readable display name
* `type`: `boolean` | `number` | `duration` | `range` | `select` | `text`
* `goal`: Optional daily target
* `widgetType`: `ring` | `sparkline` | `heatmap` | `stackedbar`

### 3.2 LogEntry (The Stream)
The immutable record of events.
* `id`: UUID
* `metricId`: Foreign key to MetricConfig (Strictly enforced).
* `value`: Raw value.
* `timestamp`: ISO string.

### 3.3 TimeLog (Duration)
Rich data for activity tracking.
* `activityId`: Foreign key to metric.
* `startTime` / `endTime`: ISO timestamps.
* `duration`: Decimal hours.
* *Note:* Must resolve to the `LogEntry` stream for analytics.

### 3.4 The Library (Qualitative)
* **Structure:** Notion-style, block-based archive.
* **Content:** Supports arbitrary headings, lists, code blocks, and rich text.
* **Legacy:** Must include logic to migrate older "Standards" text entries into blocks.

---

## 4. Functional Structure (The 4-Tab System)
The application structure is fixed.

### 4.1 Tab 1: Horizon (Proactive Dashboard)
* **Horizon Agent:** A heuristic engine that scans data windows (7, 30, 90 days) to generate natural-language insights.
* **Dynamic Bento Grid:** User-editable layouts where widget visibility and order are persisted.
* **Momentum Tracking:** Visualizes performance deltas.

### 4.2 Tab 2: Logger (Input Engine)
* **Daily Check-In:** Dynamically generated forms based on active MetricConfigs.
* **Time Tracker:** Stopwatch-style live tracking and manual entry.
* **Timeline:** Chronological visualization of the day's logs.

### 4.3 Tab 3: Intel (Analytics)
* **Report Generator:** Compiles system health and correlations into exportable Markdown reports.
* **Report Archive:** Persistent storage for historical report snapshots.
* **Telemetry:** Custom SVG stacked bars and overlays.

### 4.4 Tab 4: System (Configuration)
* **Metric Builder:** CRUD operations for schemas.
* **Library Manager:** The interface for the block-based archive.
* **Onboarding:** Dismissible setup wizard.

---

## 5. Technical Stack & Constraints

### 5.1 The Stack
* **Runtime:** React 19 + Vite.
* **Styling:** TailwindCSS with Apple HIG tokens.
* **Icons:** Lucide React.
* **Motion:** CSS Transitions + Web Animations API (No Framer Motion).
* **Charting:** Custom SVG primitives only (No Recharts/Chart.js).

### 5.2 Scaling & Normalization
* **Storage Scale:** Raw values are stored unmodified (e.g., "8 hours", "10 reps").
* **Internal Scale:** Engines normalize data to `0–1` for math.
* **UI Return Scale:** All UI-facing outputs return `0–100` for consistency.

---

## 6. Maintenance & Operations

### 6.1 Build & Deploy
* **PWA:** Custom Service Worker (`sw.js`) handles aggressive caching for zero-connectivity.
* **Manifest:** Defined as a standalone tool with **portrait-locked** orientation.

### 6.2 Data Integrity
* **Versioning:** System must include a `migrateData` utility for schema updates.
* **Safety Nets:** A mandatory "Nuke Data" confirmation flow is required to prevent accidental data loss.
