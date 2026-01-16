# ORBIT README

## Introduction

ORBIT is a high-fidelity, local-first Progressive Web App (PWA) designed to serve as a comprehensive **Life Operating System**. It bridges the gap between deep, schema-driven qualitative documentation and high-precision quantitative telemetry tracking. Built for users who prioritize data sovereignty and extreme privacy, ORBIT runs entirely in the browser with no backend, storing all information within the local environment.

Unlike traditional tracking apps that force users into rigid categories, ORBIT is built on a **Universal Metric Engine** where every data point, activity, and protocol is user-defined. The system is engineered to feel indistinguishable from a native iOS application, adhering strictly to Apple’s Human Interface Guidelines (HIG) for motion, geometry, and visual density. It provides an intelligent layer of **proactive dashboarding** that uses heuristic recipes to surface patterns, correlations, and momentum across your life data.

---

## Features

### 1. Horizon — Proactive Dashboard

The command center of the system, utilizing a dynamic bento-grid layout to surface the most relevant data at any given time.

- **Horizon Agent**: A core heuristic engine that scans rolling data windows (7, 30, and 90 days) to generate natural-language insights.
- **Recipe-Based Intelligence**: Insights are driven by rule objects rather than hardcoded strings, allowing the system to adapt to any user-defined metric.
- **Dynamic Bento Grid**: A fully modular widget registry that allows users to edit layouts, toggle visibility, and reorder widgets through a native-fidelity interface.
- **Momentum Visualization**: High-level status cards that show the speed and direction of progress across all system health categories.

### 2. Logger — Multi-Fidelity Input Engine

A centralized input hub designed for rapid data entry with minimal friction.

- **Daily Check-In**: A dynamic form engine that automatically generates input fields based on your defined metrics (Boolean, Number, Range, Select, etc.).
- **Time Tracker**: A dual-mode utility supporting both a live stopwatch (Start/Stop) and manual entry for duration-based activities.
- **Integrated Timeline**: A vertical visualization of the current day’s entries, providing immediate context for logged activities.

### 3. Intel — Advanced Analytics & Pattern Discovery

The deep-processing layer of ORBIT, focused on uncovering the “why” behind your data.

- **Engine-Driven Analytics**: Supports complex operations including rolling averages, trend deltas, and lagged correlations (O(N) complexity).
- **Custom SVG Charts**: A library of performance-optimized charting primitives, including Stacked Telemetry Bars, Activity Breakdowns, and Sparklines—all built without external charting libraries.
- **Report Generator**: A configurable tool that compiles system health, notable correlations, and averages into a permanent Markdown-formatted ledger.
- **Historical Archive**: A persistent storage system for historical reports, allowing you to track long-term trends and milestones.

### 4. Library — The Notion-Style Archive

A flexible, schema-driven reference layer for qualitative documentation.

- **Block-Based System**: Unlike metrics, the Library supports arbitrary content blocks including text, code snippets, and lists.
- **Protocol Storage**: Store your core principles, recipes, or operating frameworks in a navigable and expandable local library.
- **Quick-Link Feature**: Directly link library items to specific metrics, allowing for immediate navigation from a protocol to its corresponding log entry.

### 5. Native Interaction Fidelity

ORBIT is optimized for the “native feel,” ensuring that every interaction mimics high-end mobile software.

- **Apple HIG Adherence**: Features native-style Segmented Controls, pill-shaped navigation, and glassmorphic materials.
- **Physics-Based Motion**: High-tension spring physics drive all transitions, providing a bouncy, fluid user experience.
- **Zero-Latency UI**: All analytics calculations and rendering are optimized to maintain 60fps performance on mobile hardware.

---

## Requirements

ORBIT is designed to be lightweight and self-reliant, requiring only a modern web browser to function. The following technical requirements are necessary for development and production environments:

- **Runtime Environment**: Node.js (v18.0 or higher) for local development and build processes.
- **Web Framework**: React 19 (utilizing modern features like useActionState and optimized useMemo patterns).
- **Build Tool**: Vite (configured for ESM modules and high-speed Hot Module Replacement).

### Browser Capabilities

- **localStorage Support**: Essential for the local-first data persistence model.
- **Service Worker Support**: Required for offline PWA functionality and asset caching.
- **CSS Backdrop Filter**: Required for the glassmorphic UI effects (backdrop-filter: blur(20px)).

### Tech Stack Components

- **Tailwind CSS**: For utility-first styling and theme token management.
- **Lucide React**: For native-style iconography.
- **Self-Reliance**: Zero external charting libraries (e.g., Chart.js, Recharts) and zero external animation libraries (e.g., Framer Motion) are permitted for core telemetry; all visuals are custom SVG.

---

## Installation

To set up a local development environment for ORBIT, follow these steps:

### 1. Clone the Repository

git clone https://github.com/your-username/orbit-life-os.git  
cd orbit-life-os

### 2. Install Dependencies

Use your preferred package manager (npm is recommended) to install the necessary libraries defined in the project manifest.

npm install

### 3. Start the Development Server

Launch the Vite development environment to view the app in your browser at http://localhost:5173.

npm run dev

### 4. Production Build

To generate an optimized, production-ready version of the PWA, run the build script. The output will be located in the /dist directory.

npm run build

---

## Configuration

ORBIT requires minimal configuration due to its local-first architecture, but key files govern the system’s behavior:

- **Project Manifest (package.json)**: Defines the core dependencies and scripts. Note that framer-motion and charting libraries are explicitly excluded to maintain a “vanilla” build.
- **Build Configuration (vite.config.js)**: Configures the React 19 plugin and manages the PWA entry point via index.html.
- **Styling Tokens (src/styles/tokens.css)**: The single source of truth for the Apple HIG design system. All hex codes for system colors (Blue: #007AFF, Green: #34C759), radii (--radius-card: 20px), and blur intensities are defined here.
- **Tailwind Integration (tailwind.config.js)**: Extends the default Tailwind theme using the variables defined in tokens.css to ensure visual consistency across the UI.
- **PWA Assets (public/)**:
  - manifest.json: Configures the standalone display mode, background colors, and app icons for mobile installation.
  - sw.js: The Service Worker responsible for aggressive caching and offline-first performance.
- **Naming Conventions (docs/naming-conventions.md)**: A locked reference document that dictates strict naming for all props and data fields (e.g., metricId is mandatory, metricKey is banned).

---

## Usage

ORBIT is organized into a four-tab navigation system, each serving a specific phase of the data lifecycle: observation, collection, analysis, and configuration.

### 1. Horizon (Observe)

- **Daily Momentum**: Review the high-level cards at the top of the dashboard to see your 7-day rolling Momentum across key categories.
- **Proactive Insights**: Read the AI-generated insights provided by the Horizon Agent, which uses heuristic recipes to highlight streaks, warnings, and correlations.
- **Layout Customization**: Tap the Edit icon to enter layout mode, where you can toggle widget visibility and reorder your bento grid.

### 2. Logger (Collect)

- **Daily Check-In**: Use the dynamically generated forms to log your quantitative metrics. The UI adapts to the metric type (e.g., toggles for Booleans, sliders for Ranges).
- **Activity Tracking**: Start the Time Tracker for live sessions or manually log duration-based activities.
- **Timeline Review**: Scroll through the vertical timeline to see a chronological history of your entries for the current day.

### 3. Intel (Analyze)

- **Telemetry Exploration**: Use the custom SVG charts to visualize long-term trends and multi-metric overlays.
- **Report Generation**: Compile your data into a structured Markdown report for external review or personal archiving.
- **Archive Ledger**: Access the Report Archive to view snapshots of previous system health reports.

### 4. System (Configure)

- **Metric Builder**: Create and edit the schemas for what you track, including custom colors and widget types.
- **The Library**: Document your protocols, principles, and notes using the block-based editor.
- **Data Portability**: Use the Export feature to download your entire database as a JSON file, or Import to restore a previous backup.

---

## Architecture Overview

ORBIT follows a strict layered architecture to ensure that logic remains decoupled from the presentation layer and that data integrity is maintained across the local-first environment.

### 1. Storage Layer (StorageContext.jsx)

- **Single Source of Truth**: Manages the global state for metrics, logs, and library items.
- **Persistence**: Synchronizes all state changes to localStorage in real-time.
- **Migration**: Includes a migrateData utility to handle schema updates without data loss.

### 2. Engine Layer (Logic)

- **Metric Engine**: Handles basic quantitative calculations like completion rates and streaks.
- **Analytics Engine**: Processes complex data transformations, including O(N) momentum calculations and lagged correlations.
- **Widget Data Engine**: Separates data fetching and calculation from the UI widgets, ensuring components remain “dumb” and performant.

### 3. Presentation Layer (UI)

- **Registry-Driven Widgets**: Widgets are rendered dynamically based on the widgetType defined in the metric schema.
- **Atomic Primitives**: Reusable UI components (Glass, SegmentedControl, Button) enforce Apple HIG parity across the app.

---

## Contributing

Contributions to ORBIT must adhere to the project’s strict stabilization guidelines to prevent “Whack-a-Mole” bugs.

1. **Branching Strategy**: Use a dedicated branch for every stabilization step or feature (e.g., stabilization/step-1.1-schemas).
2. **Naming Conventions**: Consult docs/naming-conventions.md before adding any new properties to the data models.
3. **Atomic Refactoring**: Do not parallelize tasks. Complete one layer (e.g., Engine) fully before moving to the next (e.g., View).
4. **No Logic Leaks**: Ensure that no analytics or data transformation logic is placed within React components; all logic belongs in the src/engine/ directory.

---

## Governance & Architecture

Updated documentation coming soon! See /Docs.