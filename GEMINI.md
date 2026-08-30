# GEMINI.md

This repository contains a modern React web application scaffolded with Vite 8, React 19,
Tailwind CSS v4, Lucide React icons, and TypeScript.

---

## 🛠 Tech Stack

- **Framework**: [React 19](https://react.dev/) (`react`, `react-dom`)
- **Bundler & Build Tool**: [Vite 8](https://vite.dev/) (`vite`, `@vitejs/plugin-react`)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) via `@tailwindcss/vite`
- **Icon Suite**: [Lucide React](https://lucide.dev/) (`lucide-react`)
- **Language**: TypeScript (`strict` mode enabled, `@/*` path mapping)
- **Package Manager**: [pnpm](https://pnpm.io/)
- **Class Utilities**: `clsx`, `tailwind-merge`

---

## 📁 Project Structure

```text
ReactWeb/
├── public/
│   └── vite.svg               # Application favicon
├── src/
│   ├── components/            # Reusable UI components
│   │   ├── Button.tsx         # Accessible interactive button with variant & tactile feedback
│   │   ├── Card.tsx           # Standard surface card container with heading & icon badge
│   │   ├── Header.tsx         # Main header with matching height, theme toggle & auth button
│   │   ├── InputField.tsx     # Accessible form input with icon prefix & dark focus styles
│   │   ├── ThemeSwitch.tsx    # Accessible dark mode toggle switch control
│   │   └── UserBadge.tsx      # Authenticated user identity badge with shield icon
│   ├── context/               # React Context providers & hooks
│   │   └── AuthContext.tsx    # AuthProvider & useAuth hook implementation
│   ├── hooks/                 # Reusable custom React hooks
│   │   ├── useTheme.ts        # Theme detection, media query & storage sync
│   │   └── useHashRouting.ts  # URL hash routing & navigation synchronization
│   ├── lib/                   # Libraries & helper utilities
│   │   ├── crypto.ts          # Pure PBKDF2-HMAC-SHA256 & constant-time crypto
│   │   └── utils.ts           # Class merge utility (cn helper with clsx & twMerge)
│   ├── views/                 # View components & layout views
│   │   ├── HomepageView.tsx   # Default landing view (#homepage) & view metadata
│   │   ├── SettingsView.tsx   # Settings view (#settings) & view metadata
│   │   ├── DebugView.tsx      # Protected diagnostics view (#debug) & view metadata
│   │   ├── LoginView.tsx      # Authentication view (#login) & view metadata
│   │   ├── Sidebar.tsx        # Aside sidebar view (w-72), Cuboid heading & navigation
│   │   └── views.ts           # Aggregated view registry & navigation lookup helpers
│   ├── vite-env.d.ts          # Vite client type definitions
│   ├── App.tsx                # 4-container layout, custom hooks integration
│   ├── constants.ts           # Centralized constants & user registry
│   ├── index.css              # Tailwind CSS v4 import & root styles
│   ├── main.tsx               # React root DOM mount
│   └── types.ts               # Shared TypeScript interfaces & types
├── .editorconfig              # Editor configuration
├── .markdownlint.yaml         # Markdownlint configuration (120 char max line length)
├── GEMINI.md                  # Project instructions & guidelines
├── index.html                 # HTML entry point
├── package.json               # Package dependencies & scripts
├── tsconfig.json              # Consolidated TypeScript configuration with @/* paths
└── vite.config.ts             # Vite 8 configuration with React + Tailwind plugins
```

---

## 🚀 Available Scripts

Use `pnpm` to run scripts:

| Command | Action |
| :--- | :--- |
| `pnpm install` | Install all project dependencies |
| `pnpm dev` | Launch the local Vite 8 development server with instant HMR |
| `pnpm build` | Type-check with `tsc` and build production assets into `dist/` |
| `pnpm preview` | Locally preview the production build output |
| `pnpm run md:lint` | Lint all markdown files with `markdownlint-cli2` |

---

## 🧭 Path Anchoring & Module Resolution

1. **Vite 8 Base & Alias Configuration**:
   - `vite.config.ts` sets `base: './'` for flexible hosting environments.
   - Resolves `@` using `new URL('./src', import.meta.url).pathname` without importing `node:url` or `path`.

2. **TypeScript Path Anchoring**:
   - `tsconfig.json` uses `"paths": { "@/*": ["./src/*"] }` without deprecated `baseUrl`.

3. **Direct Imports & No Barrel Indirection**:
   - Avoid `index.ts` barrel files and compatibility re-exports.
   - All modules import directly via `@/*` aliases (e.g. `@/context/AuthContext`, `@/constants`).

---

## 📐 Layout Architecture (4 Containers)

1. **Top-Left Heading (Container 1)**:
   - Sidebar aside header featuring the `Cuboid` icon from `lucide-react` and app title.
   - Header height matches the main header height exactly (`h-16` / 64px).

2. **Aside Sidebar (Container 2)**:
   - Fixed width of `w-72` on desktop viewports and a collapsible drawer overlay on mobile.
   - Houses the view navigation buttons without extra section headings.
   - Dynamically exposes `#debug` when authenticated. Login is accessed via the header action button.
   - Pinned at the bottom is an accessible on/off switch toggle for dark mode.

3. **Main Header (Container 3)**:
   - Top section of the main container matching the sidebar header height (`h-16`).
   - Displays the active view title, mobile sidebar toggle button, and authentication badge.
   - Displays a Login button when unauthenticated, and a Logout button when authenticated, next to the theme toggle.

4. **Main Body Section (Container 4)**:
   - Primary content area (`flex-1 overflow-y-auto p-6`) rendering the active view component.

---

## 🧭 Views & Anchor Routing Paradigm

1. **Colocated Views**:
   - Create a view component in `src/views/` (e.g. `MyView.tsx`) exporting both the component and its `ViewDefinition` object.
   - Register the view definition in `src/views/views.ts` within the `APP_VIEWS` array.
   - For protected views, set `requiresAuth: true`.
   - For guest-only views, set `hideWhenAuth: true`.
   - To hide standalone views (such as Login) from the sidebar list, set `hideInSidebar: true`.
   - Registered views route via their anchor hash (e.g. `#homepage`, `#login`, `#debug`).

2. **Anchor Routing & Authentication**:
   - The active view is synchronized with the browser's URL hash (e.g. `#homepage`).
   - The default landing route is `#homepage`.
   - Client-side cryptographic verification uses PBKDF2-HMAC-SHA256 (100,000 iterations) via Web Crypto API.
   - Credential verification uses constant-time byte comparisons and dummy key derivation to mitigate timing attacks.
   - Supports an extensible user registry (`AUTH_USER_REGISTRY`) with `root` configured as the primary administrator.
   - Signing in via `#login` unlocks and exposes the `#debug` view in the sidebar.
   - Sessions are signed with cryptographic SHA-256 signatures, preventing users from forging boolean flags in storage.
   - Sessions are valid for 7 days (`AUTH_SESSION_DURATION_MS = 604,800,000 ms`).

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
   - Memoize context value objects in `src/context/AuthContext.tsx` with `useMemo`.

2. **Bundle Optimization**:
   - Configured `manualChunks` in `vite.config.ts` isolating `vendor-react` and `vendor-icons`.

3. **Comment Standards**:
   - Use standard ASCII hyphens (`-`) exclusively in comments and text (never em-dashes `—` or en-dashes `–`).
   - Comments must describe the concrete runtime *behavior* of the code rather than subjective intents.

4. **Strings & Component-First Naming Taxonomy**:
   - Application strings and constants reside in `src/constants.ts`.
   - All constant keys use uppercase format (`APP_STRINGS.SECTION.KEY`).
   - Constants follow component-first prefixes:
     - `BTN_*`: Buttons and action triggers (`BTN_SUBMIT`, `BTN_LOGOUT`, `BTN_CLEAR_STORAGE`).
     - `LABEL_*`: Input and status labels (`LABEL_USERNAME`, `LABEL_DARK_MODE`, `LABEL_AUTH_ACTIVE`).
     - `INPUT_*`: Placeholders and field configurations (`INPUT_PLACEHOLDER_USERNAME`).
     - `HEADING_*`: View headings and card titles (`HEADING_PAGE`, `HEADING_UNAUTHORIZED`).
     - `TXT_*`: Instructional text, messages, and greetings (`TXT_DESCRIPTION`, `TXT_AUTH_NOTICE`).
     - `NAV_*`: Navigation IDs, titles, and hash routes (`NAV_ID`, `NAV_TITLE`, `NAV_HASH`).
     - `BADGE_*`: Default user badges (`BADGE_DEFAULT_USER`).
     - `STORAGE_KEY_*`: Local storage keys (`STORAGE_KEY_SESSION`).
   - Zero hardcoded usernames in generic UI strings; identities are dynamically resolved via `useAuth()`.

---

## 🎨 Styling & Conventions

1. **Tailwind CSS v4**:
   - Tailwind is integrated directly via the `@tailwindcss/vite` plugin in `vite.config.ts`.
   - Global stylesheet imports `@import "tailwindcss";` in `src/index.css`.
   - Class-based dark mode uses `@variant dark (&:where(.dark, .dark *));`.

2. **Dark Mode & Theme Detection**:
   - Default theme is light mode unless the browser/OS prefers dark mode via `prefers-color-scheme`.
   - Dark mode is activated via the `dark` class on the root `<html>` element.
   - All form inputs must specify explicit dark focus backgrounds (`dark:focus:bg-slate-900`) to prevent white-on-white.
   - Use standard `dark:` variant utilities (e.g., `dark:bg-slate-950 dark:text-slate-100`).

3. **Class Merging (`cn` Utility)**:
   - Use `cn(...)` from `@/lib/utils` combining `clsx` and `twMerge` for conditional classes and style overrides.

4. **Icons**:
   - Prefer icons from `lucide-react`. Import individual icons to support optimal tree-shaking:

     ```tsx
     import { Bug, Cuboid, Home, LogIn, LogOut, Moon, Settings, Sun } from 'lucide-react';
     ```

5. **Component Guidelines**:
   - Place reusable components in `src/components/` and page-level views in `src/views/`.
   - Use named exports for view components and define explicit TypeScript interfaces for props.
   - Keep state colocated with components or lift up when shared.
