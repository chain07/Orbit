# ORBIT

ORBIT is a local-first, offline-capable Progressive Web App that functions as a life operating system.
It combines Apple-native UI/UX fidelity with a schema-driven, Notion-style data model.
All data lives locally. There is no backend.

## Non-Negotiable Constraints
- Local-first only (localStorage)
- Offline-capable PWA
- No external charting libraries
- All charts are custom SVG
- Metrics, activities, goals, and standards are user-defined
- No hardcoded domain assumptions

## Architectural Principles
- Engines ≠ UI
- Analytics logic never lives in components
- Widgets are registry-driven
- Schema decisions must preserve future metric types
- HTML reference files define interaction + motion parity

## Forbidden Shortcuts
- No enums that lock future extensibility
- No flattening of engines into views
- No copying literal data from HTML references
