# CSS cleanup olan

You are an expert Frontend Systems Engineer. Your objective is to audit this codebase (React + Vite + Bun) and refactor
its styling architecture to adhere strictly to modern industry best practices for CSS cleanup and semantic multi-theme management.

Never serve index.html for missing assets. If the browser asks for a .js or .css file that doesn't exist,
you must return a 404 so the frontend can catch the error and force a reload, rather than silently swallowing a HTML file.
If a static asset exists, serve it safely with new Response (no-cache forces ETag revalidation)

## WORKFLOW / EXECUTION PHASES

### Phase 1: Audit & Discovery (Read-Only)

1. Scan the project for legacy styling:
   - Identify all standalone `.css`, `.scss`, and `*.module.css` files.
   - Inspect components using inline `style={{ ... }}` attributes.
   - Search for hardcoded color utilities (e.g., `text-black`, `bg-white`, `bg-slate-900`, `dark:bg-...`).
2. Run `bunx knip` (or check imports) to identify completely unreferenced CSS files and dead assets.
3. List your audit findings before modifying code.

### Phase 2: Foundational Theming Architecture

1. **Ensure Helper Utilities Exist:**
   - Verify or create `@/lib/utils.ts` (or equivalent) exporting:

     ```ts
     import { clsx, type ClassValue } from "clsx";
     import { twMerge } from "tailwind-merge";

     export function cn(...inputs: ClassValue[]) {
       return twMerge(clsx(inputs));
     }
     ```

2. **Establish Semantic Theme Tokens:**
   - Consolidate all global styling into a single entry stylesheet (e.g., `src/index.css`). Delete boilerplate like `App.css`.
   - Define semantic CSS variables in `:root` and `[data-theme="dark"]` (and optionally a secondary custom theme like `[data-theme="ocean"]`):
     - Backgrounds: `--background`, `--muted`, `--popover`, `--card`
     - Foregrounds: `--foreground`, `--muted-foreground`
     - Brand / Actions: `--primary`, `--primary-foreground`, `--border`, `--ring`
3. **Connect Variables to Tailwind:**
   - If Tailwind v4: Register variables using `@theme { --color-background: var(--background); ... }`.
   - If Tailwind v3: Extend `tailwind.config.js` colors using `var(--...)` tokens.

### Phase 3: Theme Provider & Persistence

1. Implement or update a lightweight `ThemeProvider` (or configure `next-themes` if installed):
   - Store selected theme in `localStorage`.
   - Apply the active theme as a `data-theme="<theme-name>"` attribute on `document.documentElement`
     (also toggle `.dark` for backward compatibility).
   - Prevent Flash of Unstyled Content (FOUC) by checking system preference (`prefers-color-scheme`) as a fallback.
     Local storage is used to persist the selected theme, while also handling the operating system's preferred color
     scheme if no theme is saved. To prevent Flash Of Unstyled Content (FOUC), a script may be added to index.html
     to apply the theme immediately upon page load. The ThemeProvider will be wrapped around the providers in App.tsx
     to enable access to the theme context.
2. Provide a clean `useTheme()` hook exposing `{ theme, setTheme, availableThemes }`.

### Phase 4: Component Refactoring & CSS Elimination

1. **Migrate CSS to Tailwind:**
   - Systematically convert custom CSS/module rules into Tailwind utility classes directly inside components.
   - Replace brittle string concatenations with the `cn()` utility.
   - Replace paired dark variants (e.g., `bg-white dark:bg-zinc-900`) with unified semantic tokens
     (e.g., `bg-background text-foreground`).
2. **Delete Redundant Stylesheets:**
   - Once a component is refactored, delete its corresponding `.css` / `.module.css` file and remove its imports.
3. **Normalize Class Order:**
   - Ensure classes follow logical ordering (layout -> sizing -> typography -> visual -> interactive).
     If `prettier-plugin-tailwindcss` is present, format files.

### Phase 5: Verification & Quality Gate

1. Run `bun run build` and ensure TypeScript and Vite build with **zero errors**.
2. Verify that:
   - There are no broken layouts or missing visual states (focus, hover, active).
   - Toggling `data-theme` changes all background, border, and text colors dynamically without page reload.
   - No orphan CSS files remain in `src/`.

## Implementation Summary & Verification Status

### Audit Findings

- **Stylesheets**: Single global entry stylesheet `src/index.css`. No legacy `.scss` or `*.module.css` existed.
- **Dead Code**: Dead hook `src/hooks/useTheme.ts` safely eliminated; Knip and Biome report 0 unused files.
- **Inline Styles**: Validated runtime progress percentages in `TenantCard.tsx`, `TenantLeaderboardChart.tsx`,
  and `ToastContainer.tsx`; dynamic hex swatches in `SettingsView.tsx`.
- **Hardcoded Colors**: All legacy slate pairs (`bg-white dark:bg-slate-900`, `text-slate-900 dark:text-white`,
  `border-slate-200 dark:border-slate-800`, `bg-slate-50 dark:bg-slate-950`) converted into semantic tokens.

### Architecture Implemented

1. **Semantic CSS Tokens**: Defined `--background`, `--foreground`, `--card`, `--card-foreground`, `--popover`,
   `--popover-foreground`, `--muted`, `--muted-foreground`, `--border`, `--ring`, `--primary`, `--primary-foreground`,
   and dynamic accent tokens across `:root` / `[data-theme="light"]`, `[data-theme="dark"]`, and `[data-theme="ocean"]`.
2. **Tailwind v4 Integration**: Tokens mapped into `@theme` in `src/index.css` with opacity modifier support.
3. **Multi-Theme Management**: Implemented `ThemeProvider` and `useTheme()` hook supporting `light`, `dark`, and `ocean`,
   synchronized with `localStorage`, system media queries, and `index.html` anti-FOUC initialization.
4. **Component Refactoring**: All page views (`HomepageView`, `MicrosoftView`, `SettingsView`, `DebugView`, `Sidebar`)
   and UI components (`Card`, `Button`, `Header`, `ThemeSwitch`, `CommandPalette`, `ShortcutsModal`, `ToastContainer`,
   `RealtimeBadge`, `TenantCard`, `TenantDetailModal`, `TenantLeaderboardChart`) migrated to semantic tokens.
5. **Quality Gates Passed**: `pnpm run check`, `pnpm run lint`, and `pnpm build` pass with zero errors.
