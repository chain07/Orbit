# ORBIT Liquid Native Design System

## 1. The "Native Shell, Data Soul" Philosophy

The user interface of ORBIT is a "Liquid Native" application. It strictly adheres to iOS layout standards while maintaining a distinct, data-heavy "glass" aesthetic.

### 1.1 Core Directives

* **Structure**: Strictly follow iOS layout standards (Bottom Tab Bar, Large Title headers, Modal sheets).
* **Physics**: Native touch-action and overscroll-behavior-y: none (with overflow-y: auto) are mandatory. The app must "breathe" (rubber-band) on scroll.
* **Density**: "Data Density" supersedes standard iOS whitespace. Reduce whitespace slightly to fit more metrics, but maintain 44pt touch targets.
* **Zero External UI Libraries**: No Bootstrap, Material UI, or Ant Design. Styling utilizes a custom manual utility class system (mirroring Tailwind syntax) + CSS Variables to maintain zero build dependencies.

## 2. The "Liquid Glass" Material Spec

We use a single, consistent glass token system. Do not allow deviations or "cheap" CSS opacity hacks.

### 2.1 Tokens

* **--material-glass**:

  * background: rgba(255, 255, 255, 0.75)
  * backdrop-filter: blur(20px) saturate(180%)
  * Note: The "saturate" is key for the premium feel.
* **--material-border**:

  * border: 0.5px solid rgba(0, 0, 0, 0.1)
  * Purpose: Subtle separation, essential for glass on white.

### CSS Implementation Reference

```css
.glass-panel {
  background: var(--material-glass);
  /* Ensure backdrop-filter is supported */
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: var(--material-border);
}
```

## 3. Typography (Geist Implementation)

* **Primary Font**: Geist (Variable).
* **Performance Mandate**:

  * Must be self-hosted (served from /public/fonts).
  * Must be preloaded in index.html to prevent CLS/FOIT.
  * Use font-display: swap with size-adjust fallbacks.
* **Formatting**:

  * **Headers**: Tight tracking (negative letter-spacing) to match the compact aesthetic.
  * **Data Numbers**: Monospaced formatting (tabular-nums) is required for all ticking numbers, timers, and financial-style metrics.

## 4. Color & Semantic Signals

### 4.1 Base Palette

* **Monochrome**: Slate/Zinc 50-900 for all text and surfaces.

### 4.2 Semantic Signals (The "Instrument Panel")

These colors are tuned to be legible against glass and white backgrounds. Do not use for decoration; strictly for status indication.

* **Negative (Error/Critical)**: #FF3B30 (System Red)

  * Usage: Destructive actions, critical failures.
* **Notice (Warning/Pending)**: #FF9500 (System Orange)

  * Usage: Alerts that do not block functionality.
* **Positive (Success/Complete)**: #34C759 (System Green)

  * Usage: Completion states, positive trends.
* **Informative (Active/Neutral)**: #007AFF (Orbit Blue)

  * Usage: Active states, links, neutral info.

### 4.3 Data Visualization Colors

Chart colors must be consistent with the semantic map or the following neutral tones.

* **Signature Blue**: #007AFF (Action, Primary Metric)
* **Neutral Graph**: #E5E5EA (Light) / #3A3A3C (Dark) for empty tracks.

## 5. Scroll & Layout Rules

### 5.1 The "Liquid Native" Scroll Rule

To prevent scroll freeze while allowing native rubber-banding:

* html, body: overflow-y: auto, overscroll-behavior-y: none.
* #root: min-height: 100dvh.

### 5.2 Layout Clipping (Safe Areas)

Content must never be clipped by the notch or home indicator.

* **Use global variables**:

  * --safe-area-top: env(safe-area-inset-top)
  * --safe-area-bottom: env(safe-area-inset-bottom)
  * --nav-height: 60px
* **Main Container Padding**: padding-bottom: calc(var(--safe-area-bottom) + var(--nav-height) + 20px)

## 6. Geometry & Interaction Physics

Standard linear CSS transitions are forbidden for interactive states. All motion must utilize spring physics to create a "tight" and "heavy" feel.

**Prohibition**: External animation libraries like Framer Motion are explicitly forbidden for core chart telemetry and basic interactions to maintain self-reliance. Use CSS Transitions or the Web Animations API.

### 6.1 Spring Configuration (Global Standard)

All spring animations (e.g., Segmented Controls, Bottom Nav indicators) must use high-tension physics to match the "Liquid Native" feel.

* **Stiffness**: 400
* **Damping**: 30
* **Mass**: 1

### 6.2 Touch Feedback (Haptics Mimicry)

Every primary interactive element (cards, buttons, segments) must provide visual feedback on press.

* **Transform**: scale(0.95)
* **Duration**: Instant response (no lag)

### 6.3 Card & Container Radii

* **Standard Card**: Fixed at 20px – 22px.
* **Nested Elements**: Radii must follow concentric corner smoothing.
* **Border Fidelity**: High-density displays require sub-pixel rendering. Width must be fixed at 0.5px (never 1px).

## 7. Component-Specific Standards

### 7.1 Segmented Control (The "Pill" Switch)

A critical UI element for the Logger and Dashboard views.

* **Physics**: The active indicator ("thumb") must slide using the 400/30 spring configuration.
* **Inertia**: The animation must feel like it has physical weight, slightly overshooting before settling.
* **Interaction**: Pressing a segment triggers a scale(0.95) on the text/icon label.

### 7.2 Bottom Navigation

* **Material**: Must use the strict "Liquid Glass" Token.
* **Active State**: The background "pill" behind the active icon slides with spring motion; it does not fade in/out.
* **Transition**: Switching tabs triggers a subtle elastic scale or fade-in for the new view.

### 7.3 Dynamic Bento Grid

* **Edit Mode**: Users must be able to reorder widgets. The drag physics must be constrained to the grid (no free-form floating).
* **Content Padding**: Standardized at p-4 or p-5 to maintain breathable whitespace inside cards.

## 8. Iconography

* **Library**: Lucide React is the exclusive icon set.
* **Stroke Width**: Fixed at 2px for a balanced, readable weight.
* **Size Standard**:

  * **Tab Bar**: 24px
  * **Lists / Cards**: 20px or 16px (context dependent)

## 9. Charts & Visualization (Zero-Dependency)

All charts are custom SVG primitives. External libraries (Recharts, Chart.js) are strictly prohibited.

### 9.1 Supported Widget Types

The system renders data via the WidgetRegistry. The following types must be supported with distinct visual languages:

* **Ring**: Circular progress with stroke-linecap="round".
* **Sparkline**: Smooth bezier curves (no jagged polylines).
* **Heatmap**: GitHub-style density grids.
* **Stacked Bar**: Segmented composition bars.
* **Streak**: Typographic/Icon based counters.
* **Number**: Large, high-impact typography.
* **History**: List-based or chronological view.

### 9.2 Data Normalization & Rendering

* **Input**: Charts receive data on a 0–100 scale (from the Engine).
* **Internal Rendering**: SVG math normalizes this to 0–1 to calculate stroke-dasharray and coordinate paths.
* **Ring Charts**: Background tracks must be distinct from the value path (using --neutral-graph color).
* **Animation**: Chart entries must animate via CSS transitions or the native Web Animations API (no heavy JS animation libraries).

## 10. Universal Button System (OrbitButton)

The Orbit Button architecture uses a nested shell-and-core strategy to ensure consistent physics (squash-and-stretch) and visual weight across the application.

### 10.1 Architecture
The component is split into two layers:
1.  **Wrapper (`.btn-orbit`)**: Handles the bounding box, layout positioning, and touch target compliance (min-height: 48px).
2.  **Core (`.btn-core`)**: Handles the visual presentation (background, border-radius, typography) and the inner content.

This separation allows the inner core to perform `scale(0.95)` animations without affecting the outer layout flow of the parent container.

### 10.2 Tokens & Physics
*   **Radius**: `--radius-btn: 14px`
*   **Press Scale**: `--scale-press: 0.95`
*   **Transition (Release)**: `cubic-bezier(0.19, 1, 0.22, 1)` (High tension spring back)
*   **Transition (Press)**: `cubic-bezier(0, 0, 0.2, 1)` (Instant squish)

### 10.3 Variants
All buttons must use one of the strict semantic variants. Custom overrides are discouraged.

*   **Primary**:
    *   **Background**: `var(--blue)` (Orbit Blue)
    *   **Text**: White
    *   **Shadow**: Inner bevel `inset 0 1px 0.5px rgba(255,255,255,0.25)`
    *   **Usage**: Main Call-to-Action (Save, Create, Submit).

*   **Secondary**:
    *   **Background**: `rgba(0, 0, 0, 0.08)` (Light Mode) / `rgba(255, 255, 255, 0.1)` (Dark Mode)
    *   **Text**: `var(--text-primary)`
    *   **Usage**: Alternative actions (Cancel, Back, Edit).

*   **Destructive**:
    *   **Background**: `rgba(255, 59, 48, 0.1)` (Red Tint)
    *   **Text**: `var(--red)`
    *   **Usage**: Dangerous actions (Delete, Reset, Clear).

### 10.4 Implementation
Buttons are implemented via the `<OrbitButton />` component (`src/components/ui/OrbitButton.jsx`), which automatically handles the nested structure and interaction states (`onPointerDown`, `onKeyDown`).

```jsx
<OrbitButton variant="primary" icon={<Icons.Save size={18} />}>
  Save Changes
</OrbitButton>
```
