# Changelog

## v1.1.2
- Eliminated the iOS Safari bottom black bar by setting outer shell height to `calc(100dvh + env(safe-area-inset-bottom, 0px))` and locking `html, body, #root` background-color to `#0f172a` while preserving independent `<main>` vertical scrolling.
- Removed header `backdrop-blur` and semi-transparency in favor of a solid opaque `bg-[#0f172a]` header with `safe-area-inset-top` clearance.
- Improved outdoor contrast and readability on the 4 filter tabs (`text-xs font-extrabold tracking-wide`, inactive `text-slate-200`) and card 3-state status buttons (`text-[12.5px] font-bold`, `stroke-[2.5]` icons, inactive `text-slate-300`), leaving equipment tags and timestamps unchanged.
- Centered the footer with balanced spacing (`gap-3` around `•`) and synced version `v1.1.2` across footer, `APP_VERSION`, `package.json`, `README.md`, and `CHANGELOG.md`.

## v1.1.1
- Fixed vertical scrolling across iOS, Android, and desktop by keeping outer shell at `h-dvh flex flex-col overflow-hidden`, unlocking `touch-action: pan-y` in `index.css`, and making `<main>` an independent scrollable container (`flex-1 min-h-0 overflow-y-auto overscroll-y-contain`) with `calc(env(safe-area-inset-bottom, 0px) + 1.5rem)` bottom clearance.
- Moved footer (`©2026 — Developed by FIKRI • v1.1.1`) cleanly inside the scrollable container above the iOS home bar.
- Removed custom Install button and iOS tutorial modal (`PWAInstallButton.tsx`, `IOSInstallModal.tsx`, `usePWAInstall.ts`) so Android Chrome displays its native PWA install prompt uninterrupted and the header title has full breathing room.
- Added reliable version-update detection (`localStorage` `rsc_app_version` comparison + `controllerchange` + `visibilitychange` `registration.update()`) to display `"Updated to v1.1.1"` without false first-visit toasts.
- Synced version `v1.1.1` across footer, `APP_VERSION`, `package.json`, `README.md`, and `CHANGELOG.md`.

## v1.1.0
- Fixed iPhone notch/Dynamic Island clearance by replacing header Tailwind padding overrides with inline `calc(env(safe-area-inset-top, 0px) + 0.75rem)` while preserving `viewport-fit=cover` and `100dvh` layout.
- Unified header pulse SVG icon with `public/favicon.svg` and regenerated solid `#0f172a` PNG icons (`180x180`, `192x192`, `512x512`, and maskable `512x512`).
- Updated PWA manifest `short_name` and iOS web app title to `Running Status` (`theme_color` and `background_color` locked to `#0f172a`).
- Restyled the PWA Install button to dark emerald/slate (`bg-emerald-500/10 border-emerald-500/30 text-emerald-400`) and moved the centered iOS install tutorial modal to the root `App` level.
- Enabled `{ includeMetadataChanges: true }` on Firestore `onSnapshot` to drive real-time `Live Sync`, `Syncing...`, and `Offline Mode` header telemetry.
- Replaced header filter buttons with 4 proportional tabs (`ALL`, `RUNNING`, `STANDBY`, `IGNORE` with slate gray styling) and moved the unit counter to the right of `Urea 1B Equipment List`.
- Repositioned equipment card headers (enlarged left tag + inline right timestamp) with zero-shift amber pulsing clock SVG for `hasPendingWrites`.
- Implemented a smooth sliding background pill (`transition-all duration-200 ease-out`) inside each 3-state status selector with `active:scale-95` tap feedback.
- Repositioned contextual top toasts with safe-area top clearance, static color classes per action/status, and `controllerchange` notification (`Updated to v1.1.0`).
- Synced footer (`©2026 — Developed by FIKRI • v1.1.0`), `package.json`, `README.md`, and `CHANGELOG.md`.

## v1.0.3
- Added anti-zoom viewport, `touch-action: manipulation` / `pan-y`, `overscroll-behavior-y: none`, and `16px` search input sizing.
- Implemented hyphen/space-insensitive tag search, `400ms` per-tag tap cooldown guard, `hasPendingWrites` row tracking, and Workbox `skipWaiting`/`clientsClaim`.

## v1.0.2
- Removed Copy Summary feature, enforced `100dvh` & safe-area padding, enabled Firestore multi-tab `persistentLocalCache`, and added Firebase error codes in warning toasts.

## v1.0.1
- Connected Cloud Firestore (`urea1b-running-status`), hardened missing-doc batch seeding with `{ merge: true }`, removed Reset All, and set `base: './'`.

## v1.0.0
- Initial release of Running Status Checker for 56 alphabetical Urea 1B plant equipment tags.
