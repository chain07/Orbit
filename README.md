# ORBIT - Full Overview

## Introduction

ORBIT is a high-fidelity, local-first Progressive Web App (PWA) designed to serve as a comprehensive **Life Operating System**. It bridges the gap between deep, schema-driven qualitative documentation and high-precision quantitative telemetry tracking.

Built for users who prioritize data sovereignty and extreme privacy, ORBIT runs entirely in the browser with no backend, utilizing a hybrid persistence model (IndexedDB for heavy data, localStorage for configuration).

Unlike traditional tracking apps that force users into rigid categories, ORBIT is built on a **Universal Metric Engine** where every data point, activity, and protocol is user-defined. The system is engineered to feel indistinguishable from a native iOS application, adhering strictly to Apple’s Human Interface Guidelines (HIG) for motion, geometry, and visual density.

---

## Features

### 1. Horizon — Proactive Dashboard

The command center of the system, utilizing a dynamic bento-grid layout to surface the most relevant data at any given time.

* **Horizon Agent:** A core heuristic engine that scans rolling data windows to generate "Tactical" and "Strategic" insights.
* **Daily Briefing:** A context-aware message system that persists throughout the day to prevent context switching jitter.
* **Dynamic Bento Grid:** A fully modular widget registry supporting reorderable layouts and a wide variety of visualizations (Heatmaps, Stacked Bars, Streaks).
* **Liquid Native UI:** Widgets use strict inline layout rules to ensure pixel-perfect rendering across devices without layout shifts.

### 2. Logger — Multi-Fidelity Input Engine

A centralized input hub designed for rapid data entry with minimal friction.

* **Daily Check-In:** A "Card Stack" form engine that automatically generates native-fidelity inputs (Steppers, Toggles, Sliders) based on your metric schema.
* **Time Tracker:** A dual-mode utility supporting both a live stopwatch and manual entry, integrated directly into the analytics stream.
* **Timeline:** A collapsible, date-grouped vertical visualization of your history with sticky headers.

### 3. Intel — Advanced Analytics & Pattern Discovery

The deep-processing layer of ORBIT, focused on uncovering the "why" behind your data.

* **Engine-Driven Analytics:** Supports complex operations including rolling averages, trend deltas, and lagged correlations.
* **Merged Data Streams:** The engine seamlessly combines point-in-time logs with duration-based time logs for unified analysis.
* **Custom SVG Charts:** A library of performance-optimized charting primitives, including the Segmented Bar Chart with auto-color assignment.

### 4. Library — The Notion-Style Archive

A flexible, schema-driven reference layer for qualitative documentation.

* **Block-Based System:** Supports arbitrary content blocks including text, code snippets, and lists.
* **Protocol Storage:** Store your core principles, recipes, or operating frameworks in a navigable local library.

### 5. Native Interaction Fidelity

ORBIT is optimized for the **native feel**, ensuring that every interaction mimics high-end mobile software.

* **Optimistic UI:** State updates instantly while database operations (`IndexedDB`) occur asynchronously in the background.
* **Physics-Based Motion:** High-tension spring physics drive transitions.
* **Zero-Latency UI:** All analytics calculations are optimized to maintain 60fps performance.

---

## Requirements

ORBIT is designed to be lightweight and self-reliant, requiring only a modern web browser to function.

### Development Environment

* **Runtime:** Node.js (v18.0 or higher)
* **Framework:** React 19 + Vite
* **Build Tool:** Vite (ESM, HMR)

### Browser Capabilities

* **IndexedDB:** Required for the primary data store (Logs, Metrics).
* **localStorage:** Used for lightweight configuration (Layouts, Settings).
* **Service Worker:** Required for offline PWA functionality.
* **CSS Backdrop Filter:** Required for glassmorphic UI effects.

### Tech Stack Components

* **Vanilla CSS & Inline Styles:** Enables custom, responsive layouts ("Liquid Native") built from scratch, explicitly overriding external frameworks when necessary for layout precision.
* **OrbitDB (Internal):** A custom, zero-dependency wrapper for IndexedDB.
* **Strict Constraint:** Zero external charting libraries and zero external animation libraries.

---

## Installation

To set up a local development environment for ORBIT:

### Clone the Repository

```bash
git clone https://github.com/your-username/orbit-life-os.git
cd orbit-life-os
```

### Install Dependencies

```bash
npm install
```

### Start Development Server

Launch the app at `http://localhost:5173`.

```bash
npm run dev
```

### Production Build

Generate the optimized PWA in the `/dist` directory.

```bash
npm run build
```

---

## Architecture Overview

ORBIT follows a strict layered architecture to ensure logic remains decoupled from presentation.

### 1. Storage Layer (`StorageContext.jsx` + `src/lib/db.js`)

* **Hybrid Persistence:**
    *   **IndexedDB (`OrbitDB`):** Stores heavy user data (Metrics, Logs, TimeLogs) to bypass localStorage quotas and improve performance.
    *   **localStorage:** Stores lightweight configuration (Widget Layouts, Onboarding status) for synchronous access.
* **Optimistic UI:** The UI updates React state immediately, treating it as the "Source of Truth" for rendering, while persisting to DB in the background.
* **Migration:** Includes logic to migrate legacy localStorage data to IndexedDB on startup.

### 2. Engine Layer (Logic)

* **Metric Engine:** Handles quantitative calculations (completion, streaks).
* **Analytics Engine:** Processes complex transformations (O(N) momentum, correlations) on the unified `allLogs` stream.
* **Widget Data Engine:** Transforms raw data into specific formats required by UI components (`entries`, `breakdown`, `segments`).

### 3. Presentation Layer (UI)

* **Registry-Driven:** Widgets rendered dynamically based on schema `widgetType`.
* **Liquid Native:** Components use strict inline styles to enforce visual stability and layout constraints (e.g., zero padding, absolute headers).

---

## Contributing

Contributions must adhere to the project's strict stabilization guidelines.

* **Branching:** Use dedicated branches.
* **Conventions:** Consult `docs/naming-conventions.md`.
* **Atomic Refactoring:** Complete one layer (Engine) fully before moving to the next (View).
