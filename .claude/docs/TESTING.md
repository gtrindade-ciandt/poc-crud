# Testing — poc-crud (GitHub Explorer)

## Stack

- **Vitest** as test runner (shares Vite config for path aliases and transforms)
- **@testing-library/react** for component rendering and queries
- **@testing-library/user-event** for simulating user interactions
- **@testing-library/jest-dom** for extended matchers (`toBeInTheDocument`, `toHaveTextContent`, etc.)

## File Naming & Location

- Test files: `*.test.ts` / `*.test.tsx`
- Co-locate tests next to source files or place in a `tests/` directory mirroring `src/`
- Mock files in `tests/__mocks__/` when centralized mocks are needed

## Patterns

### Component Tests

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ComponentName } from '@/components/component-name'

describe('ComponentName', () => {
  it('renders expected content', () => {
    render(<ComponentName />)
    expect(screen.getByText('expected text')).toBeInTheDocument()
  })
})
```

### Async Data (Loading / Error / Success)

Components that fetch data should test all three states:

1. **Loading** — verify skeletons or loading indicators render
2. **Error** — mock a failed fetch, verify error message displays
3. **Success** — mock API response, verify data renders correctly

Use `vi.fn()` or `vi.spyOn(globalThis, 'fetch')` to mock the fetch API.

### Utility Tests

Pure functions in `src/lib/` should have straightforward input/output tests — no DOM needed.

## Coverage

- Aim for coverage on **all modified lines** in each PR
- Run with: `npx vitest run --coverage`

## Visual Verification (Playwright MCP)

After implementing any UI feature or fix, use the **Playwright MCP tools** to visually verify the result in the browser. This complements unit tests — unit tests validate logic, Playwright MCP validates what the user actually sees.

### Workflow

1. Ensure the dev server is running (`npm run dev`)
2. Use `browser_snapshot` to capture the accessibility tree and inspect rendered content
3. Use `browser_take_screenshot` to capture the visual state for layout/styling checks
4. Interact with the page using `browser_click`, `browser_type`, `browser_hover` to test interactive features
5. Use `browser_resize` to verify responsive breakpoints (mobile, tablet, desktop)

### What to verify

- **Layout**: elements are positioned correctly, no overflow or clipping
- **Theme tokens**: colors match the shadcn/ui design system (no raw color mismatches)
- **States**: loading skeletons, error banners, empty states all render properly
- **Responsiveness**: hidden columns appear/disappear at the correct breakpoints (`sm`, `md`, `lg`)
- **Interactions**: hover effects, links opening correctly, focus styles visible
- **Regressions**: existing features still work after changes

## Guidelines

- Reset any global mocks in `beforeEach` / `afterEach`
- Prefer `screen.getByRole` and `screen.getByText` over test IDs
- Do not test shadcn/ui primitives (`src/components/ui/`) — they are third-party generated code
- Test application components (`src/components/`) and utilities (`src/lib/`)
