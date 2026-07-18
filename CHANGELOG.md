# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project adheres
to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Repository scaffolding: governance files, docs, and CI skeleton.
- Accessible WAI-ARIA Tabs pattern (createTabs): roles, roving tabindex, Arrow/Home/End keyboard nav, horizontal + vertical orientation.
- Design tokens (tokens/tokens.css) with WCAG AA colour pairs (light + dark) and 44px targets.
- 11 tests (vitest + jsdom) including an axe-core WCAG A/AA scan; strict TypeScript.
- CI on Node 20 and 22 via pnpm/corepack.
