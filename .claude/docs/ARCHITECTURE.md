# Architecture — poc-crud (GitHub Explorer)

```
src/
├── main.tsx                   # Entry point — mounts React app with StrictMode
├── App.tsx                    # App root — layout (header, main, footer) + renders RepoTable
├── index.css                  # Tailwind v4 config + shadcn/ui design tokens (light/dark)
├── assets/
│   ├── hero.png               # Hero image asset
│   ├── react.svg              # React logo
│   └── vite.svg               # Vite logo
├── components/
│   ├── repo-table.tsx         # Main feature — fetches GitHub API, renders repo list with stats
│   └── ui/                    # shadcn/ui primitives (do not modify)
│       ├── badge.tsx           # Badge with cva variants (default, secondary, destructive, outline)
│       ├── input.tsx           # Text input with ring focus styles
│       ├── skeleton.tsx        # Loading placeholder (pulse animation)
│       └── table.tsx           # Table, TableHeader, TableBody, TableRow, TableHead, TableCell
└── lib/
    └── utils.ts               # cn() — clsx + tailwind-merge utility
```

## Data Flow

Single-direction flow, no routing:

1. `main.tsx` renders `<App />` inside `StrictMode`
2. `App.tsx` renders layout chrome (header with `lucide-react` icon, footer) and `<RepoTable />`
3. `RepoTable` fetches `https://api.github.com/orgs/anthropics/repos?sort=stars&per_page=30` on mount
4. Three render states: loading (skeleton rows), error (destructive banner), success (data table)
5. Repos are sorted client-side by `stargazers_count` descending

## Key Patterns

- **Path alias**: `@/*` → `./src/*` (configured in `tsconfig.app.json` + `vite.config.ts`)
- **Component primitives**: shadcn/ui in `src/components/ui/` — generated via CLI, never hand-edited
- **Design tokens**: CSS custom properties with oklch colors in `src/index.css` — supports light/dark themes
- **Class merging**: all components use `cn()` from `@/lib/utils` for conditional Tailwind classes
- **Variant system**: `class-variance-authority` (cva) for multi-variant components (see `badge.tsx`)
