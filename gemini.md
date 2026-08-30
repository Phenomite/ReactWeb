# AGENTS.md

This repository contains a modern React web application scaffolded with the latest Vite, React 19,
Tailwind CSS v4, Lucide React icons, and TypeScript.

---

## 🛠 Tech Stack

- **Framework**: [React 19](https://react.dev/) (`react`, `react-dom`)
- **Bundler & Build Tool**: [Vite](https://vite.dev/) (`vite`, `@vitejs/plugin-react`)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) via `@tailwindcss/vite`
- **Icon Suite**: [Lucide React](https://lucide.dev/) (`lucide-react`)
- **Language**: TypeScript (`strict` mode enabled, single consolidated `tsconfig.json`)
- **Package Manager**: [pnpm](https://pnpm.io/)
- **Class Utilities**: `clsx`, `tailwind-merge`

---

## 📁 Project Structure

```text
ReactWeb/
├── public/
│   └── vite.svg               # Application favicon
├── src/
│   ├── components/            # Modular UI components
│   │   ├── Sidebar.tsx        # Aside sidebar (w-72), Cuboid heading & theme switch
│   │   ├── Header.tsx         # Main header with matching height & theme toggle
│   │   └── MainContent.tsx    # Main body section container
│   ├── views/                 # View components & routing registry
│   │   ├── index.ts           # Views registry (APP_VIEWS) & hash helpers
│   │   ├── HomepageView.tsx   # Default landing view (#homepage)
│   │   ├── SettingsView.tsx   # Settings view (#settings)
│   │   ├── DebugView.tsx      # Protected diagnostics view (#debug)
│   │   └── LoginView.tsx      # Authentication view (#login)
│   ├── lib/
│   │   ├── auth.tsx           # Authentication provider & useAuth hook
│   │   └── utils.ts           # Class merge utility (cn helper)
│   ├── strings.ts             # Centralized application string constants
│   ├── vite-env.d.ts          # Vite client type definitions
│   ├── App.tsx                # 4-container layout, anchor routing & dark mode state
│   ├── index.css              # Tailwind CSS v4 import & root styles
│   └── main.tsx               # React root DOM mount
├── .editorconfig              # Editor configuration
├── .markdownlint.yaml         # Markdownlint configuration (120 char max line length)
├── AGENTS.md                  # Project instructions & guidelines
├── gemini.md                  # Symlink/hardlink to AGENTS.md
├── index.html                 # HTML entry point
├── package.json               # Package dependencies & scripts
├── tsconfig.json              # Consolidated TypeScript configuration
└── vite.config.ts             # Vite configuration with React + Tailwind plugins
```

---

## 🚀 Available Scripts

Use `pnpm` to run scripts:

| Command | Action |
| :--- | :--- |
| `pnpm install` | Install all project dependencies |
| `pnpm dev` | Launch the local Vite development server with instant HMR |
| `pnpm build` | Type-check with `tsc` and build production assets into `dist/` |
| `pnpm preview` | Locally preview the production build output |
| `pnpm run md:lint` | Lint all markdown files with `markdownlint-cli2` |

---

## 📐 Layout Architecture (4 Containers)

1. **Top-Left Heading (Container 1)**:
   - Sidebar aside header featuring the `Cuboid` icon from `lucide-react` and app title.
   - Header height matches the main header height exactly (`h-16` / 64px).

2. **Aside Sidebar (Container 2)**:
   - Fixed width of `w-72` on desktop viewports and a collapsible drawer overlay on mobile.
   - Houses the view navigation buttons without extra section headings.
   - Pinned at the bottom is an accessible on/off switch toggle for dark mode.

3. **Main Header (Container 3)**:
   - Top section of the main container matching the sidebar header height (`h-16`).
   - Displays the active view title, mobile sidebar toggle button, and authentication badge.

4. **Main Body Section (Container 4)**:
   - Primary content area (`flex-1 overflow-y-auto p-6`) rendering the active view component.

---

## 🧭 Views & Anchor Routing Paradigm

1. **Adding New Views**:
   - Create a view component in `src/views/` (e.g. `MyNewView.tsx`).
   - Add view metadata and strings to `src/strings.ts`.
   - Register the view in `src/views/index.ts` within the `APP_VIEWS` array with its title, hash (`#view-name`), and icon.
   - For protected views, set `requiresAuth: true`.
   - The view automatically appears in the sidebar and routes via its anchor.

2. **Anchor Routing & Authentication**:
   - The active view is synchronized with the browser's URL hash (e.g. `#homepage`).
   - The default landing route is `#homepage`.
   - Signing in via `#login` unlocks and exposes the `#debug` view in the sidebar.

---

## 🔘 Interactive Buttons & Accessibility (WCAG)

1. **Text Dragging**:
   - All sidebar buttons, headings, and toggle controls use `select-none` (`user-select: none`).

2. **Cursor & Animations**:
   - All interactive controls have `cursor-pointer`.
   - Micro-animations: Smooth hover background transitions and tactile click scaling (`active:scale-[0.98]`).

3. **WCAG & ARIA Standards**:
   - Buttons specify `type="button"` and `aria-label`.
   - Active view buttons use `aria-current="page"`.
   - Decorative icons use `aria-hidden="true"`.
   - High-visibility focus indicators use `focus-visible:outline-2 focus-visible:outline-offset-2`.
   - The sidebar theme switch uses `role="switch"` and `aria-checked={darkMode}`.

---

## ⚡ Performance & Code Hygiene

1. **React Optimizations**:
   - Wrap view components and layout containers in `React.memo`.
   - Wrap event handlers and navigation callbacks in `useCallback`.
   - Memoize context value objects in `src/lib/auth.tsx` with `useMemo`.

2. **Bundle Optimization**:
   - Configured `manualChunks` in `vite.config.ts` isolating `vendor-react` and `vendor-icons`.

3. **Comment Standards**:
   - Use standard ASCII hyphens (`-`) exclusively in comments and text (never em-dashes `—` or en-dashes `–`).
   - Comments must describe the concrete runtime *behavior* of the code rather than subjective intents.

4. **Strings**:
   - All text constants, titles, descriptions, accessibility labels, and storage keys reside in `src/strings.ts`.

---

## 🎨 Styling & Conventions

1. **Tailwind CSS v4**:
   - Tailwind is integrated directly via the `@tailwindcss/vite` plugin in `vite.config.ts`.
   - Global stylesheet imports `@import "tailwindcss";` in `src/index.css`.
   - Class-based dark mode uses `@variant dark (&:where(.dark, .dark *));`.

2. **Dark Mode**:
   - Dark mode is activated via the `dark` class on the root `<html>` element.
   - Use standard `dark:` variant utilities (e.g., `dark:bg-slate-950 dark:text-slate-100`).

3. **Class Merging**:
   - Use the `cn(...)` utility in `src/lib/utils.ts` when combining conditional classes with external class names.

4. **Icons**:
   - Prefer icons from `lucide-react`. Import individual icons to support optimal tree-shaking:

     ```tsx
     import { Bug, Cuboid, Home, LogIn, LogOut, Moon, Settings, Sun } from 'lucide-react';
     ```

5. **Component Guidelines**:
   - Place reusable components in `src/components/` and page-level views in `src/views/`.
   - Always define explicit TypeScript interfaces for component props.
   - Keep state colocated with components or lift up when shared.
