# S1.1 — Filtro por linguagem de programação

**Jira:** [FLWP-56664](https://ciandtjira.atlassian.net/browse/FLWP-56664)
**Date:** 2026-04-23

## Summary

Add a language filter dropdown above the repository table in `RepoTable`, allowing users to filter Anthropic's public repos by programming language. Uses shadcn/ui Select with colored dots matching the existing `languageColors` map.

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Component structure | All inside `RepoTable` | Follows ticket spec; component is still manageable at this size |
| Dropdown component | shadcn/ui Select (`npx shadcn@latest add select`) | Accessible (Radix UI), styled with project design tokens, consistent with existing UI |
| Visual treatment | Color dots in each Select option | Reuses `languageColors` map, mirrors the language column in the table |
| Empty state message | Same for API-empty and filter-empty | Ticket spec says "Nenhum repositorio encontrado." for both cases |

## State & Data Derivation

All inside `RepoTable`, no new effects:

- **`selectedLanguage`** — `string | null`, default `null` (null = "Todas as linguagens")
- **`languages`** — derived via `useMemo` from loaded repos:
  ```ts
  [...new Set(repos.map(r => r.language).filter(Boolean))].sort()
  ```
  Alphabetically sorted, no duplicates, excludes `null`
- **`filteredRepos`** — derived via `useMemo`:
  - `selectedLanguage === null` → all `repos`
  - Otherwise → `repos.filter(r => r.language === selectedLanguage)`

## Select Component

### Position

Between the `space-y-4` wrapper and the `rounded-lg border` table container. Left-aligned.

### Structure

- `SelectTrigger`: `w-full sm:w-[220px]` — full-width on mobile (<640px), fixed 220px on `sm` and above
- `SelectValue`: placeholder "Todas as linguagens"
- `SelectContent`:
  1. First item: "Todas as linguagens" (value `"all"`, no color dot)
  2. Remaining items: one per unique language, alphabetically ordered, each with a color dot span using `languageColors[lang] || 'bg-gray-400'`

### Interaction

- `onValueChange`: if value is `"all"` → set `selectedLanguage` to `null`; otherwise set to the language string
- Filter applies in real-time (no "apply" button) — RN-04

### Visibility

- Only renders when `!loading && !error`
- During loading/error states, the Select is not shown

## Table Changes

- The `.map()` rendering table rows iterates over `filteredRepos` instead of `repos`
- Empty state check: `!loading && filteredRepos.length === 0`
- Message: "Nenhum repositorio encontrado." (unchanged text)

## Footer Changes

Current: `Mostrando {repos.length} de {repos.length} repositorios da org anthropics`

Updated: `Mostrando {filteredRepos.length} de {repos.length} repositorios da org anthropics`

- When "Todas" is selected, both values are equal — reads naturally
- When a language is selected, shows filtered vs total count (e.g., "Mostrando 8 de 30")

## Business Rules Coverage

| Rule | Implementation |
|------|---------------|
| RN-01: Dropdown lists all languages without duplicates | `useMemo` with `Set` + `filter(Boolean)` + `sort()` |
| RN-02: Default is "Todas as linguagens" | `selectedLanguage` starts as `null`, placeholder shows "Todas as linguagens" |
| RN-03: Repos with `language: null` shown in "Todas" | `null` filter returns all repos unfiltered |
| RN-04: Filter applied in real-time | `onValueChange` updates state, `filteredRepos` recomputes |
| RN-05: Footer reflects filtered count | Footer uses `filteredRepos.length` |

## Edge Cases Coverage

| Case | Handling |
|------|---------|
| EC-01: All repos same language | Dropdown shows 1 language + "Todas" — works naturally |
| EC-02: Repo with `language: null` | Not listed as dropdown option; included when "Todas" is selected |
| EC-03: Filter returns 0 repos | Shows "Nenhum repositorio encontrado." + footer "Mostrando 0 de N" |

## Tests

### Unit Tests (Vitest + Testing Library)

1. **Renders dropdown with unique sorted languages** — mock fetch with varied languages (including duplicates and `null`), verify options appear alphabetically with "Todas as linguagens" first
2. **Filter by language shows only matching repos** — select "TypeScript", verify only TypeScript rows render
3. **"Todas as linguagens" shows all repos including null-language** — select a language, switch back to "Todas", verify all repos reappear
4. **Footer reflects filtered count** — with filter active, verify "Mostrando X de Y" where X < Y
5. **Filter with no results shows empty message** — edge case where filter returns 0 matches

### Visual Verification (Playwright MCP)

- Select positioning and width (desktop and mobile)
- Color dots in dropdown options match table badges
- Table updates when changing filter selection
- Footer count updates correctly
- Responsive behavior (full-width on mobile)

## Files Modified

| File | Change |
|------|--------|
| `src/components/repo-table.tsx` | Add state, derived data, Select component, update table iteration and footer |
| `src/components/ui/select.tsx` | New file — generated via `npx shadcn@latest add select` |
| `src/components/repo-table.test.tsx` | New file — unit tests for the filter feature |

## Dependencies

- `npx shadcn@latest add select` — installs Select primitives (Radix UI `@radix-ui/react-select`)
