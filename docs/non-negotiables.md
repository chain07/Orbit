# Non-Negotiable Constraints
These rules are absolute. Any implementation violating these is considered architecturally invalid.

---

## 1. Architectural Sovereignty
- **Local-First Only:** 100% of data resides in `localStorage`.
- **Zero Backend:** No cloud databases, no mandatory external API calls.
- **Offline-Capable:** Must function completely without internet connectivity (PWA).
- **Data Portability:** JSON import/export must be always available.

## 2. Engineering Constraints
- **Complexity Cap:** Momentum and Rolling Window calculations must maintain **O(N)** complexity via single-pass reduction.
- **Heuristic Degradation:** Horizon Agent recipes must degrade gracefully to simple trend analysis when sample size **N < 50**.
- **Engine Isolation:** Analytics logic **never** lives in React components (UI). Engines must be pure TS/JS.

## 3. Technology Mandates
- **Runtime:** React 19 + Vite.
- **Styling:** Stsndard CSS only. NO TAILWIND!
- **Iconography:** Must use `src/components/ui/Icons.jsx`. **No external icon dependencies (lucide-react, etc) allowed.**
- **Motion:** CSS Transitions or Web Animations API only. **No Framer Motion**.
- **Charts:** Custom SVG primitives only. **No external charting libraries (Recharts, Chart.js, etc).**

## 4. UI/UX "Laws"
- **Native Parity:** Interaction must mimic iOS (Spring physics, Haptics/Scale, Glassmorphism).
- **Portrait Lock:** The application manifest must enforce portrait orientation.
- **Registry-Driven:** Dashboard layouts must be generated from the `WidgetRegistry`, not hardcoded JSX.

## 5. Safety Protocols
- **Destructive Confirmation:** Any "Nuke Data" or "Reset" action requires a mandatory confirmation flow.
- **Migration Safety:** Schema changes must be accompanied by a `migrateData` utility; data loss during updates is unacceptable.
