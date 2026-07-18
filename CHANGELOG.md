# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project adheres
to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Repository scaffolding: governance files, docs, and CI skeleton.
- Accessible WAI-ARIA Tabs pattern (createTabs): roles, roving tabindex, Arrow/Home/End keyboard nav, horizontal + vertical orientation.
- Accessible WAI-ARIA Disclosure pattern (createDisclosure): aria-expanded trigger, aria-controls region wiring, hidden state in lock-step, native-button Enter/Space activation, programmatic toggle, and destroy() cleanup.
- Accessible WAI-ARIA Accordion pattern (createAccordion): per-header aria-expanded/aria-controls, panels as role=region labelled by their header, Down/Up/Home/End focus movement, single-expand by default with opt-in multiple, and destroy() cleanup.
- Accessible WAI-ARIA Menu Button pattern (createMenuButton): aria-haspopup/aria-expanded/aria-controls trigger, role=menu with role=menuitem children, roving focus, ArrowDown/ArrowUp/Home/End navigation, Escape and outside-click dismissal with focus return, and destroy() cleanup.
- Accessible WAI-ARIA modal Dialog pattern (createDialog): role=dialog + aria-modal, initial focus, Tab/Shift+Tab focus trap, Escape and [data-dialog-close] to close, focus returned to the prior element, inert background, and destroy() cleanup.
- Design tokens (tokens/tokens.css) with WCAG AA colour pairs (light + dark) and 44px targets.
- 56 tests (vitest + jsdom) including axe-core WCAG A/AA scans for every pattern; strict TypeScript.
- CI on Node 20 and 22 via pnpm/corepack.
