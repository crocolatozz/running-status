# Changelog

## v1.4.0
- Added interactive header version pill (`v1.4.0`) immediately to the right of `Running Status` (`text-lg sm:text-2xl`) with neutral dark state and high-contrast amber update-ready indicator, keeping the top row cleanly aligned on narrow mobile viewports.
- Added a dark Changelog & Updates modal (`z-50`) featuring an accordion release history (`v1.4.0` expanded by default, prior releases collapsed) and a manual `Check Update` button with offline and up-to-date toast feedback.
- Upgraded PWA update handling with `registerType: 'prompt'`, Smart Forced Update with 4-second user Idle Guard (`pointerdown`, `touchstart`, `keydown`, `scroll`), Firestore pending-writes Sync Guard (`hasPendingWrites`), AI Studio preview sandbox guard, `1.5s` pre-reload toast (`"Update available — reloading..."`), and post-reload confirmation (`"Updated to v1.4.0"` via `rsc_app_version` + `sessionStorage` flag).
- Raised `ToastContainer` to `z-[60]` (`pointer-events-none` wrapper) and added matching amber updating and emerald success toast styles.
- Replaced relative card timestamps with static 24-hour `DD/MM/YY · HH:mm` timestamps (`tabular-nums`) and local device time fallback.
- Synced `v1.4.0` across `APP_VERSION`, `package.json`, `README.md`, `CHANGELOG.md`, header pill, and modal changelog, and simplified footer to `©2026 — Developed by FIKRI`.

## v1.3.0
- Rebranded the application from `Running Status Checker` to **Running Status** across UI header, `index.html` title/OpenGraph/iOS meta tags, `manifest.json` (`name` and `short_name`), `package.json` (`running-status`), `README.md`, and `CHANGELOG.md` while keeping `base: './'` for repository rename compatibility and preserving Firebase (`urea1b-running-status`) and `rsc_app_version` storage keys.
- Refined header visual hierarchy (`text-xl sm:text-2xl font-bold tracking-tight` title with `w-6 h-6 sm:w-7 sm:h-7` pulse waveform SVG) and increased header top clearance to `calc(env(safe-area-inset-top, 0px) + 26px)` beneath the `z-40` top shield.
- Synced version `v1.3.0` across `APP_VERSION` (`"Updated to v1.3.0"`), footer (`©2026 — Developed by FIKRI • v1.3.0`), `package.json`, `README.md`, and `CHANGELOG.md`.

## v1.2.0
- Added a 1-layer native PWA splash screen system with zero HTML overlays or JS timers: native Android WebAPK manifest splash plus a zero-dependency Node.js prebuild script (`scripts/generate-splash.mjs`) generating 10 portrait iOS `apple-touch-startup-image` PNGs (`1320x2868` down to `750x1334`) precached offline via `splash/*.png` in Workbox.
- Added a pure CSS `opacity`-only entrance animation (`appFadeIn`, 380ms) with zero parent `transform` rules so `position: sticky` stays intact on iOS Safari, paired with a `pageshow` `bfcache` opacity guard.
- Implemented seamless iOS status bar and anti-bottom-black-bar layout: inline `#0f172a` background on `<html>` and `<body>`, fixed `body::before` top safe-area shield (`z-40`), natural document scrolling (`overflow-x: clip`, `min-height: 100dvh / -webkit-fill-available`), solid opaque sticky `<header>` (`z-30`), and `z-50` top toasts.
- Added a single-execution Service Worker `controllerchange` auto-reload guard for iOS Safari alongside `rsc_app_version` update toast detection (`"Updated to v1.2.0"`).
- Added `overflow-hidden` to each card's 3-state status selector track so the sliding active pill stays cleanly clipped on narrow `320px–360px` Android screens.
- Synced version `v1.2.0` across `APP_VERSION`, footer (`©2026 — Developed by FIKRI • v1.2.0`), `package.json`, `README.md`, and `CHANGELOG.md`.

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
- Initial release of Running Status for 56 alphabetical Urea 1B plant equipment tags.
