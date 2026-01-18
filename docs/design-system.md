# ORBIT Liquid Native Design System

## 1. The "Native Shell, Data Soul" Philosophy

The user interface of ORBIT is a "Liquid Native" application. It strictly adheres to iOS layout standards while maintaining a distinct, data-heavy "glass" aesthetic.

### 1.1 Core Directives
*   **Structure:** Strictly follow iOS layout standards (Bottom Tab Bar, Large Title headers, Modal sheets).
*   **Physics:** Native touch-action and `overscroll-behavior-y: auto` are mandatory. The app must "breathe" (rubber-band) on scroll.
*   **Density:** "Data Density" supersedes standard iOS whitespace. Reduce whitespace slightly to fit more metrics, but maintain 44pt touch targets.

---

## 2. The "Liquid Glass" Material Spec

We use a single, consistent glass token system. Do not allow deviations.

### 2.1 Tokens
*   **`--material-glass`**:
    *   `background: rgba(255, 255, 255, 0.75)`
    *   `backdrop-filter: blur(20px) saturate(180%)`
    *   *Note: The "saturate" is key for the premium feel.*
*   **`--material-border`**:
    *   `border: 1px solid rgba(0, 0, 0, 0.1)`
    *   *Purpose: Subtle separation, essential for glass on white.*

---

## 3. Typography (Geist Implementation)

*   **Primary Font:** `Geist` (Variable).
*   **Performance Mandate:**
    *   Must be self-hosted (served from `/public/fonts`).
    *   Must be preloaded in `index.html` to prevent CLS/FOIT.
    *   Use `font-display: swap` with size-adjust fallbacks.

---

## 4. Color & Semantic Signals

### 4.1 Base Palette
*   **Monochrome:** Slate/Zinc 50-900 for all text and surfaces.

### 4.2 Semantic Signals (The "Instrument Panel")
These colors are tuned to be legible against glass and white backgrounds. Do not use for decoration; strictly for status indication.

*   **Negative (Error/Critical):** `#FF3B30` (System Red)
    *   *Usage:* Destructive actions, critical failures.
*   **Notice (Warning/Pending):** `#FF9500` (System Orange)
    *   *Usage:* Alerts that do not block functionality.
*   **Positive (Success/Complete):** `#34C759` (System Green)
    *   *Usage:* Completion states, positive trends.
*   **Informative (Active/Neutral):** `#007AFF` (Orbit Blue)
    *   *Usage:* Active states, links, neutral info.

---

## 5. Scroll & Layout Rules

### 5.1 The "Liquid Native" Scroll Rule
To prevent scroll freeze while allowing native rubber-banding:
*   `html, body`: `overflow-y: auto`, `overscroll-behavior-y: none`.
*   `#root`: `min-height: 100dvh`.

### 5.2 Layout Clipping (Safe Areas)
Content must never be clipped by the notch or home indicator.
*   Use global variables:
    *   `--safe-area-top: env(safe-area-inset-top)`
    *   `--safe-area-bottom: env(safe-area-inset-bottom)`
    *   `--nav-height: 60px`
*   **Main Container Padding:** `padding-bottom: calc(var(--safe-area-bottom) + var(--nav-height) + 20px)`
