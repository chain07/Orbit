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
*   **`--material-border`**:
    *   `border: 1px solid rgba(0, 0, 0, 0.1)`

---

## 3. Typography (Geist Implementation)

*   **Primary Font:** `Geist` (Variable).
*   **Performance Mandate:**
    *   Must be self-hosted (served from `/public/fonts`).
    *   Must be preloaded in `index.html` to prevent CLS/FOIT.
    *   Use `font-display: swap` with size-adjust fallbacks.

---

## 4. Component Specs: The "CSS-Native" Segmented Control

We rely on CSS logic rather than React state for high-performance animations.

### 4.1 Implementation Strategy
*   **Pattern:** Radio Group + CSS `:has()` selector.
*   **Prohibition:** Do NOT use React state for animation positions.
*   **DOM Structure:**
    *   Wrapper container.
    *   Hidden `<input type="radio">` elements.
    *   Paired `<label>` elements for text.
    *   Single `.glider` div for the sliding background.

### 4.2 Animation Logic
*   Use sibling combinators: `.wrapper:has(input:nth-of-type(1):checked) ~ .glider { transform: translateX(0%); }`

### 4.3 Visuals
*   **Container:** `background: rgba(118, 118, 128, 0.12)`, Rounded (9px).
*   **Glider:** White, Shadow (`0px 3px 8px rgba(0,0,0,0.12)`), Rounded (7px).
*   **Timing:** `transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)`.

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
