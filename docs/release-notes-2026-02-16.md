# Release Notes — 2026-02-16

## Summary
This release delivers full mobile responsiveness across the product flow, from landing and onboarding through dashboard and idea workspace tabs. It introduces breakpoint-driven conditional UI using `react-responsive` and restructures key desktop-only layouts for mobile usability.

## Highlights

### 1) Responsive foundation
- Added `react-responsive` dependency.
- Added shared breakpoint hook: `lib/hooks/use-breakpoints.ts`.
- Standardized breakpoint checks for mobile/tablet/desktop rendering.

### 2) Onboarding mobile flow improvements
- Added mobile progress indicator with percentage and animated progress bar.
- Switched action controls to full-width touch-friendly buttons on small screens.
- Improved step navigation behavior and fixed onboarding rendering issues.

### 3) Landing + dashboard responsiveness
- Improved landing section spacing and typography scaling across viewport sizes.
- Updated responsive behavior in hero, section cards, CTA blocks, and footer wrapping.
- Improved dashboard header and action layout for narrow screens.

### 4) Idea workspace mobile UX overhaul
- Added mobile top bar + slide-in navigation for idea workspace.
- Preserved desktop sidebar behavior for larger screens.
- Made overview/evaluation/mvp/feature-lab tabs responsive:
  - Better panel spacing and stacking.
  - Mobile-friendly data presentation.
  - Conditional heavy visual rendering on mobile where appropriate.

## Commits included
- `e581c92` — feat: add react-responsive and shared breakpoint hook
- `279813b` — feat: improve landing page mobile responsiveness
- `55bb6d9` — feat: improve dashboard mobile header and list layout
- `6fb87ee` — feat: add mobile navigation and responsive tab layouts in idea workspace

## Validation
- Lint check passed successfully (`npm run lint`).

## Notes
- No backend/API contract changes.
- No data migration required.
- Scope is UI/responsive behavior and layout adaptation only.
