# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

GitHub Explorer — a React SPA that lists Anthropic's public repositories from the GitHub API, sorted by stars.
Stack: **React 19** + **TypeScript 6** for the UI, **Vite 8** for bundling, **Tailwind CSS v4** for styling, **shadcn/ui** for component primitives.

## Commands

```bash
npm run dev          # Start dev server (Vite HMR)
npm run build        # Typecheck (tsc -b) + Vite production build
npm run lint         # ESLint check
npm run lint:fix     # ESLint auto-fix
npm run format       # Prettier + lint:fix
npm run preview      # Serve production build locally
npm run test         # vitest run (CI)
npm run test:watch   # vitest in watch mode (development)
npm run typecheck    # tsc --noEmit
```

## Architecture

Full directory tree in `.claude/docs/ARCHITECTURE.md`.
Key dirs: `src/components/ui/` (shadcn/ui primitives), `src/components/` (app components), `src/lib/` (utilities).

## Code Conventions

### Language

- All code, variable names, function names, types, interfaces, comments, commit messages, and documentation must be in **English**
- UI-facing text (labels, messages, footers, placeholders) is in **Portuguese (pt-BR)** — keep this consistent

### TypeScript

- Strict flags enabled: `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`
- **Target**: ES2023 — **JSX**: `react-jsx`
- **Module resolution**: bundler (Vite) — no `.js` extensions needed on imports
- Never use explicit `any` — always provide proper types
- Unused variables/args that must exist: prefix with `_`
- Prefer `interface` for object shapes, `type` for unions and intersections

### React

- Components as **function declarations** with named exports
- Default export only for `App.tsx`
- Hooks for state and effects — no class components
- Type API responses as dedicated interfaces (see `GitHubRepo` in `repo-table.tsx` as reference)

### Imports

- Always use the **`@/*` path alias** for project imports (maps to `./src/*`)
- Never use relative paths like `../../`

### Formatting (Prettier)

- Single quotes, semicolons, trailing comma ES5
- Print width: 100
- Tab width: 2 spaces
- End of line: LF

### ESLint

- Base: `@eslint/js` recommended + `typescript-eslint` recommended
- Plugins: `react-hooks` (recommended) + `react-refresh` (vite)
- Ignored: `dist/`

## Styling

- **Tailwind CSS v4** via `@tailwindcss/vite` plugin — no `tailwind.config` file; theme is configured in `src/index.css` via `@theme inline`
- Always use **shadcn/ui design tokens** (`bg-background`, `text-foreground`, `text-muted-foreground`, `border`, `bg-card`, `bg-primary`, `text-destructive`, etc.) — never use raw Tailwind colors for themed elements
- Use `cn()` from `@/lib/utils` for conditional/merged class names
- Use **class-variance-authority (cva)** for component variants (see `badge.tsx`)
- Icons from **`lucide-react`** only — do not add other icon libraries
- Add new shadcn/ui components via CLI: `npx shadcn@latest add <component>`
- Never modify files inside `src/components/ui/` — these are generated primitives

## Commits

We follow **Conventional Commits**:

```
<type>(optional scope): <short imperative description>

[optional body]

[optional footer]
```

### Accepted types

| Type       | When to use                      |
| ---------- | -------------------------------- |
| `feat`     | New feature                      |
| `fix`      | Bug fix                          |
| `refactor` | Refactor without behavior change |
| `test`     | Add or fix tests                 |
| `chore`    | Build, dependencies, config      |
| `docs`     | Documentation only               |
| `style`    | Formatting, no logic change      |
| `perf`     | Performance improvement          |
| `ci`       | CI/CD changes                    |

### Rules

- **Small, atomic commits** — each commit should contain a single logical change (one feature, one fix, one refactor). Never bundle unrelated changes in the same commit
- Description in **English**, imperative mood, no period at end
- Optional scope in parentheses: `feat(table)`, `fix(api)`, `test(repo-table)`
- Breaking change commits: add `!` after type or `BREAKING CHANGE:` in footer

## Testing

**Vitest** + **@testing-library/react** for unit/component testing. Detailed patterns and guidelines in `.claude/docs/TESTING.md`.

**Playwright MCP** for visual verification after implementing UI features. Use the Playwright MCP tools (`browser_snapshot`, `browser_take_screenshot`, `browser_click`, etc.) to navigate the running dev server and validate the feature visually — check layout, responsiveness, interactive states, and theme consistency directly in the browser.

## Task Completion Checklist

Before marking any task as done, verify each step passes:

1. **Typecheck**: `npx tsc -b` — no errors
2. **Lint**: `npm run lint` — no warnings or errors
3. **Tests**: `npm run test` — all tests pass
4. **Build**: `npm run build` — completes successfully
5. **Visual check (Playwright MCP)**: start `npm run dev`, then use Playwright MCP tools to navigate to the app, take snapshots/screenshots, and verify the change — happy path + edge cases (loading, error, empty state, responsive breakpoints)
6. **No regressions**: use Playwright MCP to confirm existing functionality still works after the change
