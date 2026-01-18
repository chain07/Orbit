# ORBIT - Full Overview

## Introduction

ORBIT is a high-fidelity, local-first Progressive Web App (PWA) designed to serve as a comprehensive **Life Operating System**. It bridges the gap between deep, schema-driven qualitative documentation and high-precision quantitative telemetry tracking.

Built for users who prioritize data sovereignty and extreme privacy, ORBIT runs entirely in the browser with no backend, storing all information within the local environment (`localStorage`).

Unlike traditional tracking apps that force users into rigid categories, ORBIT is built on a **Universal Metric Engine** where every data point, activity, and protocol is user-defined. The system is engineered to feel indistinguishable from a native iOS application, adhering strictly to Apple’s Human Interface Guidelines (HIG) for motion, geometry, and visual density.

---

## Features

### 1. Horizon — Proactive Dashboard

The command center of the system, utilizing a dynamic bento-grid layout to surface the most relevant data at any given time.

* **Horizon Agent:** A core heuristic engine that scans rolling data windows (7, 30, and 90 days) to generate natural-language insights.
* **Recipe-Based Intelligence:** Insights are driven by rule objects rather than hardcoded strings, allowing the system to adapt to any user-defined metric.
* **Dynamic Bento Grid:** A fully modular widget registry that allows users to edit layouts, toggle visibility, and reorder widgets through a native-fidelity interface.
* **"Momentum" Visualization:** High-level status cards that show the speed and direction of progress across all system health categories.

### 2. Logger — Multi-Fidelity Input Engine

A centralized input hub designed for rapid data entry with minimal friction.

* **Daily Check-In:** A dynamic form engine that automatically generates input fields based on your defined metrics (Boolean, Number, Range, Select, etc.).
* **Time Tracker:** A dual-mode utility supporting both a live stopwatch (Start/Stop) and manual entry for duration-based activities.
* **Integrated Timeline:** A vertical visualization of the current day’s entries, providing immediate context for logged activities.

### 3. Intel — Advanced Analytics & Pattern Discovery

The deep-processing layer of ORBIT, focused on uncovering the "why" behind your data.

* **Engine-Driven Analytics:** Supports complex operations including rolling averages, trend deltas, and lagged correlations (O(N) complexity).
* **Custom SVG Charts:** A library of performance-optimized charting primitives, including Stacked Telemetry Bars, Activity Breakdowns, and Sparklines—all built without external charting libraries.
* **Report Generator:** A configurable tool that compiles system health, notable correlations, and averages into a permanent Markdown-formatted ledger.
* **Historical Archive:** A persistent storage system for historical reports, allowing you to track long-term trends and milestones.

### 4. Library — The Notion-Style Archive

A flexible, schema-driven reference layer for qualitative documentation.

* **Block-Based System:** Unlike metrics, the Library supports arbitrary content blocks including text, code snippets, and lists.
* **Protocol Storage:** Store your core principles, recipes, or operating frameworks in a navigable and expandable local library.
* **Quick-Link Feature:** Directly link library items to specific metrics, allowing for immediate navigation from a protocol to its corresponding log entry.

### 5. Native Interaction Fidelity

ORBIT is optimized for the **native feel**, ensuring that every interaction mimics high-end mobile software.

* **Apple HIG Adherence:** Features native-style Segmented Controls, pill-shaped navigation, and glassmorphic materials.
* **Physics-Based Motion:** High-tension spring physics (Stiffness: 400, Damping: 30) drive all transitions, providing a bouncy, fluid user experience.
* **Zero-Latency UI:** All analytics calculations and rendering are optimized to maintain 60fps performance on mobile hardware.

---

## Requirements

ORBIT is designed to be lightweight and self-reliant, requiring only a modern web browser to function.

### Development Environment

* **Runtime:** Node.js (v18.0 or higher)
* **Framework:** React 19 (utilizing `useActionState` and optimized patterns)
* **Build Tool:** Vite (ESM, HMR)

### Browser Capabilities

* **localStorage:** Essential for the local-first data persistence model.
* **Service Worker:** Required for offline PWA functionality.
* **CSS Backdrop Filter:** Required for glassmorphic UI effects.

### Tech Stack Components

* **Standard CSS:** Enables custom, responsive layouts and designs built from scratch, entirely free from external dependencies or pre-built component restrictions. 
* **Icon Library:** Polished, custom iconography drawn without Lucide (no external dependencies). 
* **Strict Constraint:** Zero external charting libraries (e.g., Chart.js) and zero external animation libraries (e.g., Framer Motion) are permitted.

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

## Configuration

ORBIT requires minimal configuration due to its local-first architecture, but key files govern the system's behavior:

* **package.json:** Defines core dependencies. Note the explicit exclusion of `framer-motion` and charting libraries.
* **src/styles/tokens.css:** The single source of truth for the Apple HIG design system. Defines colors (`#007AFF`, `#34C759`), radii (`20px`), and physics variables.
* **public/manifest.json:** Configures the standalone display mode and portrait lock.
* **public/sw.js:** The Service Worker for offline-first performance.
* **docs/naming-conventions.md:** A locked reference document that dictates strict naming for props (e.g., `metricId` is mandatory, `metricKey` is banned).

---

## Architecture Overview

ORBIT follows a strict layered architecture to ensure logic remains decoupled from presentation.

### 1. Storage Layer (`StorageContext.jsx`)

* **Single Source of Truth:** Manages global state for metrics, logs, and library.
* **Persistence:** Synchronizes state to `localStorage` in real-time.
* **Migration:** Includes `migrateData` utility for safe schema updates.

### 2. Engine Layer (Logic)

* **Metric Engine:** Handles quantitative calculations (completion, streaks).
* **Analytics Engine:** Processes complex transformations (O(N) momentum, correlations).
* **Widget Data Engine:** Separates data fetching from UI widgets.

### 3. Presentation Layer (UI)

* **Registry-Driven:** Widgets rendered dynamically based on schema `widgetType`.
* **Atomic Primitives:** Components like `Glass` and `SegmentedControl` enforce HIG parity.

---

## Contributing

Contributions must adhere to the project's strict stabilization guidelines to prevent "Whack-a-Mole" bugs.

* **Branching:** Use dedicated branches for stabilization steps (e.g., `stabilization/step-1.1-schemas`).
* **Conventions:** Consult `docs/naming-conventions.md` before adding properties.
* **Atomic Refactoring:** Complete one layer (Engine) fully before moving to the next (View).
* **No Logic Leaks:** Analytics logic must never reside inside React components.
