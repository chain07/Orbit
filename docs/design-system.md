# ORBIT Design System & Interface Specification

## 1. Mandate & Philosophy

The user interface of **ORBIT** must be indistinguishable from a native iOS application. This is a **strict functional requirement**, not a stylistic suggestion. The system strictly adheres to **Apple Human Interface Guidelines (HIG)** regarding geometry, typography, physics, and haptic-like visual feedback.

Any implementation that utilizes *web-like* default inputs, generic shadows, or linear animations is considered a **specification violation**.

### 1.1 Core Constraints

* **Native Parity:** Interaction must mimic iOS (Spring physics, Haptics/Scale, Glassmorphism).
* **Orientation:** The application is strictly **Portrait-locked**.
* **Zero External UI Libraries:** No Bootstrap, Material UI, or Ant Design. Styling is exclusively TailwindCSS + CSS Variables.

---

## 2. Typography & Hierarchy

### 2.1 Font Stack

To ensure native parity, the system strictly utilizes the **system font stack**. External web fonts are prohibited unless they map perfectly to iOS system dimensions.

* **Primary Family:**

```css
font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif;
```

### 2.2 Tracking & Leading

* **Headers:** Must use tight tracking (negative `letter-spacing`) to match the compact aesthetic of iOS headers.
* **Body Text:** Uses standard tracking to ensure readability for long-form entries (e.g., Library blocks).
* **Data Numbers:** Monospaced formatting (`tabular-nums`) is required for all ticking numbers, timers, and financial-style metrics.

---

## 3. Geometry & Layout

### 3.1 Card & Container Radii

* **Standard Card:** Fixed at `20px – 22px`.
* **Nested Elements:** Radii must follow concentric corner smoothing (e.g., if container is `22px`, padded child is `~16px`).
* **Buttons:** Full pill shape (`rounded-full`) or matching card radius depending on context.

### 3.2 Border Fidelity

High-density displays require **sub-pixel rendering** for separation lines.

* **Width:** Fixed at `0.5px` (never `1px`).
* **Color Strategy:** Variable-driven to adapt between light/dark modes (e.g., `rgba(0,0,0,0.1)` vs `rgba(255,255,255,0.1)`).

---

## 4. Materials & Glassmorphism

The **Glass** effect is the primary material for navigation, overlays, and sticky headers. It must strictly follow these values to avoid a "cheap" CSS look.

### 4.1 Glass Token

* **Backdrop Filter:** `blur(20px)` (standard `blur-xl` is insufficient; must be explicit `20px`).
* **Background Opacity:** `0.72` (semi-transparent).
* **Border:** `0.5px solid rgba(255,255,255,0.1)`.

#### CSS Implementation Reference

```css
.glass-panel {
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  background: rgba(var(--bg-base), 0.72);
  border: 0.5px solid rgba(var(--border-color), 0.1);
}
```

## 5. Interaction Physics

Standard linear CSS transitions are forbidden for interactive states. All motion must utilize spring physics to create a "tight" and "heavy" feel.

**Prohibition:** External animation libraries like Framer Motion are explicitly forbidden for core chart telemetry and basic interactions to maintain self-reliance. Use CSS Transitions or the Web Animations API.

### 5.1 Spring Configuration (Global Standard)

All spring animations (e.g., Segmented Controls, Bottom Nav indicators) must use high-tension physics.

* **Stiffness:** 400
* **Damping:** 30
* **Mass:** 1

### 5.2 Touch Feedback (Haptics Mimicry)

Every primary interactive element (cards, buttons, segments) must provide visual feedback on press.

* **Transform:** `scale(0.95)`
* **Duration:** Instant response (no lag)

#### Code Reference

```css
.interactive-element:active {
  transform: scale(0.95);
  transition: transform 0.1s cubic-bezier(0.2, 0.8, 0.2, 1);
}
```

---

## 6. Color System & Theming

The system utilizes a variable-driven semantic color map to ensure perfect consistency across Light and Dark modes without component-level conditional logic.

### 6.1 Semantic Token Map

Do not use raw hex codes in components. Use CSS variables mapped to Tailwind utilities.

| Token            | Light Mode (Reference)  | Dark Mode (Reference)   | Usage                  |
| ---------------- | ----------------------- | ----------------------- | ---------------------- |
| --bg-base        | #F2F2F7 (System Gray 6) | #000000 (Pure Black)    | App background         |
| --bg-card        | #FFFFFF                 | #1C1C1E (System Gray 6) | Bento cards, panels    |
| --text-primary   | #000000                 | #FFFFFF                 | Headings, primary data |
| --text-secondary | #8E8E93                 | #98989D                 | Labels, subtitles      |
| --border-subtle  | rgba(0,0,0,0.1)         | rgba(255,255,255,0.1)   | Separators, borders    |

### 6.2 Data Visualization Colors

Chart colors must be consistent.

* **Signature Blue:** #007AFF (Action, Primary Metric)
* **Success Green:** #34C759 (Goal Met)
* **Destructive Red:** #FF3B30 (Errors, Alerts)
* **Neutral Graph:** #E5E5EA (Light) / #3A3A3C (Dark) for empty tracks

---

## 7. Iconography

* **Library:** Internal Icon Registry (`src/components/ui/Icons.jsx`) is the exclusive source. External libraries like Lucide React are **BANNED**.
* **Stroke Width:** Fixed at 2px for a balanced, readable weight.
* **Size Standard:**

  * **Tab Bar:** 24px
  * **Lists / Cards:** 20px or 16px (context dependent)
* **Animation:** Icons in the Bottom Navigation must support active-state transitions (e.g., solid fill or slight scale bump) on selection.

---

## 8. Component-Specific Standards

### 8.1 Segmented Control (The "Pill" Switch)

A critical UI element for the Logger and Dashboard views.

* **Physics:** The active indicator ("thumb") must slide using the 400 / 30 spring configuration.
* **Inertia:** The animation must feel like it has physical weight, slightly overshooting before settling.
* **Interaction:** Pressing a segment triggers a scale(0.95) on the text/icon label.

### 8.2 Bottom Navigation

* **Material:** Must use the strict Glass Token (blur(20px), 0.72 opacity).
* **Placement:** Fixed at `bottom: calc(30px + env(safe-area-inset-bottom))` to respect iOS Home Indicator.
* **Active State:** The background "pill" behind the active icon slides with spring motion; it does not fade in/out.
* **Transition:** Switching tabs triggers a subtle elastic scale or fade-in for the new view.

### 8.3 Dynamic Bento Grid

* **Edit Mode:** Users must be able to reorder widgets. The drag physics must be constrained to the grid (no free-form floating).
* **Content Padding:** Standardized at p-4 or p-5 to maintain breathable whitespace inside cards.

---

## 9. Charts & Visualization (Zero-Dependency)

All charts are custom SVG primitives. External libraries (Recharts, Chart.js) are strictly prohibited.

### 9.1 Supported Widget Types

The system renders data via the WidgetRegistry. The following types must be supported with distinct visual languages:

* **Ring:** Circular progress with stroke-linecap="round".
* **Sparkline:** Smooth bezier curves (no jagged polylines).
* **Heatmap:** GitHub-style density grids.
* **Stacked Bar:** Segmented composition bars.
* **Streak:** Typographic/Icon based counters.
* **Number:** Large, high-impact typography.
* **History:** List-based or chronological view.

### 9.2 Data Normalization & Rendering

* **Input:** Charts receive data on a 0–100 scale (from the Engine).
* **Internal Rendering:** SVG math normalizes this to 0–1 to calculate stroke-dasharray and coordinate paths.
* **Ring Charts:** Background tracks must be distinct from the value path (using --neutral-graph color).
* **Animation:** Chart entries must animate via CSS transitions or the native Web Animations API (no heavy JS animation libraries).
