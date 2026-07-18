# Stack commands

Canonical commands the tooling and pre-commit gate run. One authoritative
command per task.

lint: pnpm exec tsc --noEmit
type-check: pnpm exec tsc --noEmit
test-unit: pnpm exec vitest run

## Toolchain

- Language: TypeScript (strict), ESM.
- Test: vitest + jsdom + axe-core.
- Package manager: pnpm (via `corepack enable`).
