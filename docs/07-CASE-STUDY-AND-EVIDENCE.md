# Public Case Study — Accessible Frontend Design System Lab

## Headline

Use an outcome that can be proven. Avoid “revolutionary,” “perfect,” “unbreakable,” or “enterprise-grade” without defined criteria.

## Required structure

### 1. Context

Describe the reference organization and clearly label it as a fixture, fictional scenario, internal project, client-approved case, or production system.

### 2. PCAAP

- **Problem:** Many portfolios show pages but do not reveal whether the developer can build reusable, accessible, responsive components that survive multiple products and frameworks.
- **Cost:** Inconsistent interfaces, duplicated CSS, inaccessible controls, slow delivery, fragile redesigns, and visual regressions.
- **Answer:** Create a token-driven design system and component lab with semantic primitives, CSS architecture, TypeScript contracts, interactive examples, accessibility guidance, visual regression, and adapters for WordPress blocks and React.
- **Advantage:** The stable layer is browser standards and accessible behavior. Framework adapters remain thin, proving transferable frontend skill rather than dependency memorization.
- **Proof:** link directly to reports and tagged code.
- **Ask:** Use the keyboard-only and screen-reader demo path, inspect the component contracts, and review a visual-regression change.

### 3. Your contribution

State what you personally designed, implemented, tested, documented, and reviewed. Credit collaborators and upstream projects.

### 4. Architecture decisions

Show one high-level diagram and three decisions with alternatives and tradeoffs.

### 5. Evidence

- component documentation site
- keyboard and focus-order recordings
- manual assistive-technology notes
- axe and lint output with limitations stated
- visual regression baseline and intentional-change review
- responsive/container-query test matrix
- bundle and runtime performance report
- WordPress block and React adapter parity

For each metric, include date, version/commit, environment, test data, tooling, sample size, and limitations.

### 6. Failures and changes

Describe at least one design or implementation decision that failed, what evidence exposed it, and how it changed. Honest correction demonstrates senior judgment.

### 7. What remains

List known gaps, deferred work, unsupported use cases, and the evidence needed before expanding claims.

## Evidence directory convention

```text
docs/evidence/
├── release-<version>/
│   ├── test-summary.md
│   ├── compatibility.json
│   ├── accessibility.md
│   ├── performance.md
│   ├── security-review.md
│   ├── screenshots/
│   └── traces/
└── README.md
```
