# ORBIT Liquid Native Design System

## 1. The "Native Shell, Data Soul" Philosophy

The user interface of ORBIT is a "Liquid Native" application. It strictly adheres to iOS layout standards while maintaining a distinct, data-heavy "glass" aesthetic.

### 1.1 Core Directives

* **Structure**: Strictly follow iOS layout standards (Bottom Tab Bar, Large Title headers, Modal sheets).
* **Liquid Layouts**: Use **Inline Styles** (Flexbox/Grid) for critical widget layouts (e.g., Charts, Grids) to ensure structural integrity independent of external stylesheets.
* **Physics**: Native touch-action and overscroll-behavior-y: none are mandatory.
* **Density**: "Data Density" supersedes standard iOS whitespace. Reduce whitespace slightly to fit more metrics.
* **Zero External UI Libraries**: No Bootstrap, Material UI, or Ant Design.

## 2. The "Liquid Glass" Material Spec

We use a single, consistent glass token system.

### 2.1 Tokens

* **--material-glass**:
  * background: rgba(255, 255, 255, 0.75)
  * backdrop-filter: blur(20px) saturate(180%)
* **--material-border**:
  * border: 0.5px solid rgba(0, 0, 0, 0.1)

## 3. Typography (Geist Implementation)

* **Primary Font**: Geist (Variable).
* **Formatting**:
  * **Headers**: Tight tracking (negative letter-spacing).
  * **Data Numbers**: Monospaced formatting (tabular-nums).

## 4. Color & Semantic Signals

### 4.1 Base Palette & System Colors

* **Monochrome**: Slate/Zinc 50-900.
* **System Palette (12-Color)**: Used for Stacked Bar Charts and categorization.
    * Blue, Purple, Pink, Red, Orange, Yellow, Green, Teal, Cyan, Indigo, Brown, Gray.

### 4.2 Semantic Signals

* **Negative (Error/Critical)**: #FF3B30
* **Notice (Warning/Pending)**: #FF9500
* **Positive (Success/Complete)**: #34C759
* **Informative (Active/Neutral)**: #007AFF

## 5. Scroll & Layout Rules

### 5.1 The "Liquid Native" Scroll Rule

* html, body: overflow-y: auto, overscroll-behavior-y: none.
* #root: min-height: 100dvh.

### 5.2 Widget Layouts

* **Absolute Headers**: Widget titles must be absolutely positioned (`top: 12px`, `left: 12px`, `zIndex: 20`) to allow charts to fill the container.
* **Zero Padding**: Widget containers must have `padding: 0` to prevent double-padding issues.

## 6. Geometry & Interaction Physics

* **Motion**: Use CSS Transitions or Web Animations API. No Framer Motion.
* **Spring Physics**: Stiffness: 400, Damping: 30.
* **Touch Feedback**: `scale(0.95)` on press.

## 7. Component-Specific Standards

### 7.1 Input Cards (Logger)

* **Design**: "Inset Grouped" style (Card Stack).
* **Controls**: Native-style Steppers, Toggles, and Sliders utilizing system colors.

### 7.2 Dynamic Bento Grid

* **Grid**: CSS Grid with aspect ratio enforcement (`1/1` or `2/1`).
* **Wide Widgets**: `progress`, `compound`, `stackedbar`, `history` span 2 columns.

## 8. Iconography

* **Library**: `src/components/ui/Icons.jsx` (Custom SVG).
* **Stroke Width**: Fixed at 2px.

## 9. Charts & Visualization (Zero-Dependency)

All charts are custom SVG primitives.

### 9.1 Supported Widget Types

* **Ring**: Circular progress (`ReliabilityRing`).
* **Sparkline**: Smooth bezier curves (`TrendSparkline`).
* **Heatmap**: GitHub-style density grids (`ConsistencyHeatmap`).
* **Stacked Bar**: Segmented composition bars with right-aligned Y-axis (`SegmentedBarWidget`).
* **Compound Bar**: Distribution bar for Select metrics (`CompoundBarWidget`).
* **Progress Bar**: Linear track with labels (`ProgressBarWidget`).
* **Streak**: Typographic counters with bottom-right positioning (`CurrentStreak`).
* **History**: List-based view (`RecentHistory`).

### 9.2 Data Normalization & Rendering

* **Input**: Charts receive data on a 0–100 scale (from the Engine) or raw values.
* **Layout**: Charts typically use `position: relative` containers with absolute positioning for grids and labels to ensure precision.

## 10. Universal Button System (OrbitButton)

* **Structure**: Nested Shell (`.btn-orbit`) and Core (`.btn-core`) architecture.
* **Variants**: Primary (Blue), Secondary (Glass/Gray), Destructive (Red).
