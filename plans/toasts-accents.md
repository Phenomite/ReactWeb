# Implementation Plan: 3 Accessibility Features

Add keyboard-first modern SaaS experiences by implementing 3 features in compliance with WCAG accessibility, and project architecture guidelines.

## User Review Required

> [!IMPORTANT]
> All 3 features will be seamlessly integrated without adding heavy third-party dependencies (keeping bundle lean with native tooling).
>
> - **Keyboard Hotkeys**: `Cmd/Ctrl+K` for Command Palette, `?` for Shortcuts modal, `T` for theme toggle, `G H`/`G S`/`G D`/`G L` for two-key sequence navigation.
> - **Accent Colors**: 5 curated palettes (Blue, Violet, Emerald, Rose, Amber) persisted in local storage.
> - **Sound / Toasts**: Toasts display non-intrusively in the bottom-right corner with auto-dismiss and accessible announcements.

## Proposed Changes

### 1. Toasts

#### [MODIFY] [strings.ts](strings.ts)

- Add string constants for Command Palette (`APP_STRINGS.COMMAND_PALETTE.*`).
- Add string constants for Toast notifications (`APP_STRINGS.TOAST.*`).
- Add string constants for Shortcuts modal (`APP_STRINGS.SHORTCUTS.*`).
- Add string constants for Accent customizer in Settings (`APP_STRINGS.VIEWS.SETTINGS.ACCENT_*`).
- Add string constants for Homepage interactive widgets (`APP_STRINGS.VIEWS.HOMEPAGE.WIDGET_*`, greeting strings).

#### [MODIFY] [types.ts](types.ts)

- Add `ToastMessage` interface (`id`, `title`, `description`, `type: 'info' | 'success' | 'warning' | 'error'`, `durationMs`).
- Add `AccentColor` type (`'blue' | 'violet' | 'emerald' | 'rose' | 'amber'`).
- Add `CommandItem` interface for search entries.

#### [MODIFY] [constants.ts](constants.ts)

- Add `ACCENT_CONFIG` with list of 5 accent color definitions and storage key `app_accent_color`.

#### [NEW] [ToastContext.tsx](ToastContext.tsx)

- Provides `showToast(title, options)` and `dismissToast(id)`.
- Automatic timer cleanup with `useCallback` and `useMemo`.

#### [NEW] [ToastContainer.tsx](ToastContainer.tsx)

- Floating container rendered in root layout at bottom-right corner.
- Accessible announcements via `role="status"` and `aria-live="polite"`.
- Tactile dismiss button, icons by toast type (CheckCircle2, AlertCircle, Info).

---

### 2. Theme & Accent Management

#### [MODIFY] [useTheme.ts](useTheme.ts)

- Extend hook or add `useAccent` to manage active accent color.
- Synchronize `data-accent` attribute on `document.documentElement` and persist in localStorage.

#### [MODIFY] [index.css](index.css)

- Define CSS variables for `--color-accent` and `--color-accent-hover` for each `data-accent` theme, integrating seamlessly with Tailwind.

---

### 3. Command Shortcuts Modal and Wiring

#### [NEW] [CommandPalette.tsx](CommandPalette.tsx)

- Accessible modal dialog using `<dialog>` with backdrop-blur, light-dismiss (`closedby="any"` pattern with click fallback), and focus trapping.
- Instant search filter for views, actions (toggle dark mode, switch accent, clear storage, copy URL, sign in/out).
- Keyboard navigation: `ArrowDown`, `ArrowUp`, `Enter`, `Escape`.

#### [NEW] [ShortcutsModal.tsx](ShortcutsModal.tsx)

- Modal dialog opened via `?` (Shift + /) displaying all global hotkeys in styled keyboard key badges (`<kbd>`).

#### [NEW] [useKeyboardShortcuts.ts](useKeyboardShortcuts.ts)

- Listens for `Cmd+K` / `Ctrl+K` (Command Palette), `?` (Shortcuts), `t` (Theme), and two-key navigation sequences (`g` followed by `h`/`s`/`d`/`l`).
- Ignores keypresses when user is actively typing inside an `<input>` or `<textarea>`.

#### [MODIFY] [Header.tsx](Header.tsx)

- Add quick-access Command Palette trigger button (`Search or jump to... [Ctrl+K]`).
- Add Keyboard Shortcuts trigger icon button (`?`).

#### [MODIFY] [HomepageView.tsx](HomepageView.tsx)

- Add dynamic time-based greeting (Morning/Afternoon/Evening) and personalized badge.
- Add Interactive Quick-Status Tiles (App State, Security, Active Accent & Theme).
- Add Quick Actions grid (Go to Settings, Open Command Palette, Copy Link, View Diagnostics).
- Add an interactive Mini Focus / Productivity Timer widget with Start/Pause/Reset and celebration toast.

#### [MODIFY] [SettingsView.tsx](SettingsView.tsx)

- Add Appearance & Accent Color picker section with interactive preview swatches.
- Add Quick Preferences toggles (Sound/Haptic feedback toggle, Toast notifications toggle).

#### [MODIFY] [Sidebar.tsx](Sidebar.tsx) & [Button.tsx](Button.tsx)

- Apply dynamic accent color styling for active navigation states, primary buttons, and focus rings.

#### [MODIFY] [App.tsx](App.tsx)

- Wrap root in `ToastProvider`.
- Mount `ToastContainer`, `CommandPalette`, and `ShortcutsModal`.
- Wire `useKeyboardShortcuts`.

---

## Verification Plan

### Manual Verification

- Test `Ctrl+K` / `Cmd+K` opens the Command Palette, typing filters actions, `Enter` executes action and navigates.
- Test `?` opens Keyboard Shortcuts modal and `Escape` closes it.
- Test two-key sequences: `g` then `h` navigates to Homepage, `g` then `s` to Settings.
- Test accent color picker in Settings updates active color across the app and persists on reload.
- Test interactive timer widget on Homepage (Start, Pause, Reset) and verify toast feedback.
- Test toasts appear on theme toggle, accent change, login, logout, and storage clear.
- Verify full responsive mobile behavior and dark mode switching.
