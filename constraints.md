## SYSTEM GUARANTEES

### Data Model
- All systems are schema-driven
- No metric meaning is assumed
- Metric types must be extendable
- Categories are user-defined strings

### Analytics (REQUIRED)
Must explicitly support:
- Rolling averages
- Trend deltas
- Lagged correlations
- Multi-metric normalization
- Time-window comparisons
- Adaptive insight generation

### UI & Interaction
- Segmented controls are animated and reusable
- Bottom navigation is pill-shaped and animated
- Charts animate on data and state change
- Hover and focus states are required

### Architecture
- Engines contain logic, not components
- Views assemble; engines compute
- Widgets must be registry-based
- No single-pass assumptions

### Prohibited Optimizations
- Simplifying by removing optionality
- Hardcoding metric relationships
- Enum-locking categories or widget types
