# UX Remediation Plan

This document outlines the strategic plan for addressing identified UI/UX issues within the ORBIT application. The focus is on strictly adhering to the "Liquid Native" design system, ensuring mobile-first usability, and maintaining high accessibility standards.

## Issue Tracking Matrix

The following issues have been identified from recent UI audits.

### Test Data & Debugging

| ID | Issue Description | Impact | Proposed Solution |
| :--- | :--- | :--- | :--- |
| T-01 | **Missing Debug/Test Data Tools:** No prompt or interface to implement test data, debug mode, seed data, or export archive tests. Comprehensive edge case testing is hindered. | High | Implement a "Developer/Debug Mode" toggle in Settings (hidden or explicit). Include actions for "Seed Test Data" and "Export Archive Test". Ensure all widgets are stress-tested with this data. |

### Visual Hierarchy & Layout

| ID | Issue Description | Impact | Proposed Solution |
| :--- | :--- | :--- | :--- |
| L-01 | **Dashboard Header Clipping:** The date above the title on the home dashboard is positioned in the top bar, clipping underneath the phone's Time display. | Medium | Adjust the top margin/padding of the dashboard header to respect the device Safe Area (`env(safe-area-inset-top)`). |
| L-02 | **Tab Title Clipping:** Tab titles are positioned too close to the top edge, cutting into the Dynamic Island/status bar area. | Medium | Increase the top padding of the Tab View container to ensure titles are rendered below the status bar/Dynamic Island. |
| L-03 | **Edit Layout Background:** The "Edit Layout" view lacks a background card, causing visual merging with the base layer. | Low | Wrap the Edit Layout controls in a standard `.glass` card container to provide separation and depth. |
| L-04 | **Onboarding Overlay Persistence:** The "Create Metric" (or Onboarding) view persists at the bottom of every view. Buttons (Yes/No, Next, Skip, Color Selector) are broken, unformatted, or too small. | High | Refactor the Onboarding/Create flow to be a dedicated Modal or separate route, not a persistent overlay. Apply standard button styles (`.btn-primary`, etc.) and ensure touch targets are accessible (>44px). |
| L-05 | **Report Timeframe Alignment:** The timeframe text (Daily/Weekly/Monthly) in the Report Generator floats awkwardly next to the box icon. | Low | Align the timeframe text vertically with the icon or encapsulate it in a labeled badge to anchor it visually. |
| L-06 | **Library/Settings Toggle Clipping:** The Library/Settings toggle is positioned underneath the battery display in the top right, rendering it inaccessible. | High | Move the toggle downwards to clear the Safe Area inset. Ensure it does not overlap with system status indicators. |
| L-07 | **Metric Configuration Styling:** The "Add New Metric" component underneath the configuration section is not styled correctly. | Medium | Apply consistent card or list item styling to the "Add New Metric" element to match the rest of the configuration list. |
| L-08 | **Library Manifest Icon:** An unclear orange square appears next to the Library Manifest. Its purpose (icon vs. status) is ambiguous. | Low | Clarify the purpose of this element. If it is an icon, use a semantic SVG from the Icon Registry. If a status, provide a label or tooltip. |
| L-09 | **Typography Inconsistency:** Font weights are inconsistent (e.g., Headers are heavy bold, "Hi, Captain" is different). Section headers like "INCLUDE SECTIONS" are too small and lost against the black background. | Medium | Standardize typography using the Design System tokens. Ensure headers use consistent weights. Increase size or brightness of section headers for better legibility. |
| L-10 | **New Item Modal Visibility:** The text "Block editor available in detailed view..." is dark grey on black (invisible). Input placeholders look like pre-filled values. | High | Increase contrast of help text to meet WCAG AA standards. Lighten placeholder text to clearly distinguish it from user input values. |

### Navigation

| ID | Issue Description | Impact | Proposed Solution |
| :--- | :--- | :--- | :--- |
| N-01 | **Logger Segmented Control:** The Logger view is missing the segmented toggle for switching between "Check-in" (Metrics) and "Time Tracking". | High | Restore or add the Segmented Control to the Logger view header to enable navigation between Metric Logging and Time Logging modes. |
| N-02 | **Library Manifest Navigation:** The Accordion menu structure for the Library Manifest is confusing. It is unclear how to view detailed entries. | Medium | Replace the Accordion with a clear List View. Tapping an item should navigate to a dedicated Detail/Edit view. |
| N-03 | **Bottom Navigation Clarity:** The persistent "Create Metric" overlay sits on top of the Bottom Nav's glass blur, creating a visual stack issue. Active tab state is unclear. | High | Ensure the Bottom Navigation has the highest Z-Index (except for Modals). Remove the persistent overlay (see L-04). Enhance the active tab indicator (e.g., color or highlight) for better feedback. |

### Styling & Theming

| ID | Issue Description | Impact | Proposed Solution |
| :--- | :--- | :--- | :--- |
| S-01 | **Intelligence Toggle Spacing:** The Segmented Toggle in Intelligence is visually appealing but positioned too close to the System Health card. | Low | Add `margin-bottom` to the Segmented Toggle or `margin-top` to the System Health card to create breathing room. |
| S-02 | **System Health Formatting:** The System Health card looks poorly rendered or unformatted. It is unclear if it represents a sparkline or other data. | Medium | Refine the System Health visualization. If a chart, ensure axes and lines are crisp. If a summary, use clear typography and spacing. |
| S-03 | **Report Generator Toggles:** Section toggles in the Report Generator use default browser styling, clashing with the app's aesthetic. | Medium | Replace default checkboxes/radios with the custom `Switch` component (CSS-only animation) defined in the Design System. |
| S-04 | **Report Generator Buttons:** Copy, Save, and Download buttons in the Report Generator are not styled correctly. | Medium | Apply the standard `.btn-secondary` or `.btn-primary` classes to these actions to ensure consistency. |
| S-05 | **Dark Mode Contrast (Create Protocol):** In Dark Mode, the "Create Protocol" menu blends into the background. Input fields and buttons (Delete, Close, Save) are too small or unstyled. | High | Audit the "Create Protocol" view in Dark Mode. Increase background contrast for the modal/card. Ensure all buttons have standard padding and clear boundaries. |
| S-06 | **System Menu Styling:** The System Menu contains multiple unstyled elements and broken alignments. | Medium | Apply the global layout and design tokens to the System Menu. Ensure lists, buttons, and text align with the standard grid. |
| S-07 | **Empty State Inconsistency:** Home shows a "Rocket" card; Logger shows a generic "No Metrics" card. Lack of visual consistency. | Low | specific `EmptyState` component. Use consistent iconography and messaging styles across all views (Home, Logger, etc.) when no data is present. |

### Functionality & Logic

| ID | Issue Description | Impact | Proposed Solution |
| :--- | :--- | :--- | :--- |
| F-01 | **Block Editor Availability:** The app states "Block editor available in detailed view (simplified here)" on mobile. As a Mobile-First PWA, this is a regression. | High | Enable the full Block Editor functionality in the mobile view. Remove the "Simplified View" restriction. |
| F-02 | **Library Manifest Item Logic:** Tapping an item (with "system protocol" subtitle) prefills the "New Item" menu instead of "Edit". Switching between New/Edit seems broken. | High | Fix the state management for Library Items. Tapping an existing item should trigger `Edit Mode` with pre-filled data. Tapping "New" should clear the form for `Create Mode`. |
