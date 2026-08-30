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
│   │   └── HomepageView.tsx   # Default landing view (#homepage)
│   ├── lib/
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

## 🧭 Views & Anchor Routing Paradigm

1. **Adding New Views**:
   - Create a view component in `src/views/` (e.g. `MyNewView.tsx`).
   - Add view metadata and strings to `src/strings.ts`.
   - Register the view in `src/views/index.ts` within the `APP_VIEWS` array with its title, hash (`#view-name`), and icon.
   - The view automatically appears in the sidebar and routes via its anchor.

2. **Anchor Routing**:
   - The active view is synchronized with the browser's URL hash (e.g. `#homepage`).
   - The default landing route is `#homepage`.

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

4. **Strings**:
   - Store all application text strings and accessibility labels in `src/strings.ts`.

5. **Icons**:
   - Prefer icons from `lucide-react`. Import individual icons to support optimal tree-shaking:

     ```tsx
     import { Cuboid, Home, Moon, Sun } from 'lucide-react';
     ```

6. **Component Guidelines**:
   - Place reusable components in `src/components/` and page-level views in `src/views/`.
   - Always define explicit TypeScript interfaces for component props.
   - Keep state colocated with components or lift up when shared.
