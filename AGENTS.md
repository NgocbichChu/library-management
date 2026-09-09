# Repository Guidelines

## Project Structure & Module Organization

This is a React 19 + TypeScript frontend built with Vite, Tailwind CSS, and shadcn/ui. `src/main.tsx` bootstraps the app; `src/App.tsx` defines routes.

- `src/features/`: feature screens and auth route guards.
- `src/components/ui/`: UI primitives; `src/components/common/`: reusable application components.
- `src/layouts/` and `src/config/`: page shells and navigation configuration.
- `src/stores/`, `src/services/`, and `src/api/`: Zustand state, service logic, and HTTP endpoints. Follow the existing Form → Store → Service → API flow.
- `src/schemas/`, `src/types/`, `src/hooks/`, and `src/lib/`: validation, shared types, hooks, and utilities.
- `public/` and `src/assets/`: static and imported assets. `dist/` is generated output.

## Build, Test, and Development Commands

Use pnpm and keep `pnpm-lock.yaml` updated when dependencies change.

- `pnpm install`: install dependencies.
- `pnpm dev`: start the Vite development server.
- `pnpm lint`: run ESLint, including React Hooks and React Refresh rules.
- `pnpm typecheck`: run TypeScript project checks.
- `pnpm build`: type-check and build production assets into `dist/`.
- `pnpm preview`: serve the production build locally.
- `pnpm format`: format all TypeScript/TSX files with Prettier; review the resulting diff.

## Coding Style & Naming Conventions

Use two-space indentation, double quotes, no semicolons, LF endings, and Prettier's 80-column target. The Tailwind plugin sorts utility classes. TypeScript uses strict checking; prefer explicit types over `any` and use `import type` for type-only imports.

Follow existing kebab-case filenames, PascalCase component names, and `use`-prefixed hooks/stores, such as `use-auth-store.ts`. Use the `@/` alias for imports from `src/`.

## Testing Guidelines

No automated test framework, test script, coverage threshold, or test naming convention is configured. Before submitting, run `pnpm lint`, `pnpm typecheck`, and `pnpm build`. Manually verify affected flows, especially login validation, protected navigation, logout, and responsive layouts. Record verification steps in the PR.

## Commit & Pull Request Guidelines

History currently contains only `feat: initial commit`. Follow that Conventional Commit style with concise prefixes such as `feat:`, `fix:`, or `docs:`. Keep changes focused. PRs should describe the behavior changed, link relevant issues, list validation results, and include screenshots for visual changes.

## Configuration Tips

Copy `.env.example` to `.env.local`; restart development after changes. Mock authentication is enabled unless `VITE_USE_MOCK_API=false`. Configure `VITE_API_BASE_URL` for backend integration. Never put secrets in public `VITE_*` variables. See `src/api/README.md` for backend assumptions.
