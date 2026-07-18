# Accessible Frontend Design System Lab

## Portfolio purpose

A framework-aware but standards-first component system that proves advanced HTML, CSS, TypeScript, accessibility, visual quality, documentation, and testing.

This project is not considered complete when the UI looks good. It must demonstrate discovery, architecture, code quality, accessibility, security, performance, test design, deployment, recovery, documentation, and public communication.

## Getting started

Requires Node 20+ and pnpm (via `corepack enable`).

```bash
pnpm install
pnpm test        # vitest + jsdom + axe-core: ARIA wiring, keyboard nav, a11y scan
pnpm typecheck   # strict TypeScript
pnpm build       # emit dist/ (ESM + .d.ts)
```

## What is built today

Framework-agnostic, WAI-ARIA-correct **Tabs** and **Disclosure** patterns plus **design tokens**:

- `createTabs` (`src/tabs.ts`) progressively enhances semantic markup into the WAI-ARIA Tabs
  pattern: roles + `aria-selected`/`aria-controls` wiring, a **roving tabindex** (single tab
  stop), and **Arrow/Home/End** keyboard navigation with automatic activation. Horizontal and
  vertical orientations. Fully typed, no framework dependency.
- `createDisclosure` (`src/disclosure.ts`) progressively enhances a native `<button>` trigger
  and a region into the WAI-ARIA Disclosure pattern: `aria-expanded` on the trigger and
  `aria-controls` pointing at the region, whose `hidden` state stays in lock-step. Enter/Space
  activation comes from the platform button. Fully typed, no framework dependency.
- Design tokens (`tokens/tokens.css`) drive colour, spacing, radius, and focus. Every colour
  pair meets WCAG AA contrast in light and dark; focus rings are never removed; tab targets
  meet the 44px minimum.
- Tests (19): ARIA state, keyboard behaviour, click, programmatic control, lifecycle,
  malformed-markup errors, and automated `axe-core` scans (WCAG A/AA) for both patterns.
  Automation is a floor — manual keyboard and screen-reader checks are documented, not replaced.

The generally-useful patterns extract to the `block-a11y-pattern-lab` open-source repo.

## Documented boundary (not yet built)

Additional patterns (Accordion, Menu button, Dialog), the WordPress block wrappers,
a visual token playground, and the manual screen-reader test transcripts.

## PCAAP

### Problem

Many portfolios show pages but do not reveal whether the developer can build reusable, accessible, responsive components that survive multiple products and frameworks.

### Cost

Inconsistent interfaces, duplicated CSS, inaccessible controls, slow delivery, fragile redesigns, and visual regressions.

### Answer

Create a token-driven design system and component lab with semantic primitives, CSS architecture, TypeScript contracts, interactive examples, accessibility guidance, visual regression, and adapters for WordPress blocks and React.

### Advantage

The stable layer is browser standards and accessible behavior. Framework adapters remain thin, proving transferable frontend skill rather than dependency memorization.

### Proof required

- component documentation site
- keyboard and focus-order recordings
- manual assistive-technology notes
- axe and lint output with limitations stated
- visual regression baseline and intentional-change review
- responsive/container-query test matrix
- bundle and runtime performance report
- WordPress block and React adapter parity

### Ask

Use the keyboard-only and screen-reader demo path, inspect the component contracts, and review a visual-regression change.

## Intended audience

frontend platform team, design systems team, product company, agency, enterprise marketing group.

## Core stack and capabilities

- semantic HTML and modern CSS as the base
- design tokens in platform-neutral JSON/CSS variables
- TypeScript strict mode
- Web Components or headless behavior primitives only where justified
- React adapter and WordPress block adapter
- Storybook or an equivalent component workbench
- Playwright component/E2E and visual testing
- accessibility linting plus manual WCAG 2.2 testing
- package release, changesets and API documentation

## Product scope

- color, typography, spacing, motion and elevation tokens
- button, link, input, select, checkbox, radio and validation patterns
- dialog, popover, tabs, accordion, disclosure and menu behavior
- data table, pagination, filters, empty/error/loading states
- cards, media, content layout and responsive navigation
- reduced motion, forced colors, zoom and high-contrast support
- RTL and long-content resilience
- WordPress editor/frontend component mapping
- React examples and plain-HTML usage
- deprecation and migration policy

## Major risks

- recreating browser controls unnecessarily
- using ARIA to repair incorrect semantics
- claiming WCAG conformance from Storybook scans
- overgeneralized components with unusable APIs
- token names tied to one visual theme
- shipping a large runtime for simple content

## Milestone order

1. design principles and token model
2. form and content primitives
3. interactive components
4. responsive navigation and data patterns
5. accessibility manual validation
6. WordPress/React adapters
7. package and documentation release
8. community issue-driven improvements

## Public repository opportunity

Extract the generally useful portion as `block-a11y-pattern-lab`. The public repository must have an open-source license, contribution guide, security policy, support boundary, reproducible local setup, release notes, and a roadmap that distinguishes committed work from ideas.

## Definition of portfolio-ready

- a stranger can run the project from a fresh clone;
- every major claim links to a test, report, trace, screenshot, or explicit limitation;
- no production credentials, personal data, copied proprietary code, or fake testimonials exist;
- repository issues reflect honest known gaps;
- the demo includes at least one controlled failure and recovery;
- architecture decisions explain alternatives and tradeoffs;
- the case study can be understood by both technical and nontechnical readers;
- the latest tagged release passes the documented support matrix.
