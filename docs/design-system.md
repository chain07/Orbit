# Design System & HIG Compliance

## Interaction Physics
All interactive elements using spring animations must adhere to the following Apple HIG-inspired physics configuration to ensure consistency and a "tight" feel:

```javascript
// Standard Spring Configuration
{
  type: "spring",
  stiffness: 500,
  damping: 35,
  mass: 1
}
```

## Visual Standards

### Glass Material
Glass components (modals, tab bars, overlays) must use the following specific styles instead of generic Tailwind classes:
- **Blur**: `blur(20px)` (Standard `blur-xl` is too heavy)
- **Border**: `0.5px solid rgba(255,255,255,0.1)`

### Touch Feedback
Interactive elements should provide haptic-like visual feedback on tap:
- **Scale**: `0.97` (Subtle contraction)
