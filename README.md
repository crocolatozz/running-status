# Running Status (`v1.4.0`)

Real-time Progressive Web App (PWA) for monitoring and updating the running status (`RUNNING`, `STANDBY`, `IGNORE`) of all 56 Urea 1B plant equipment units.

## Key Capabilities
- **1-Layer Native PWA Splash Screen**: Zero HTML overlays or JS timers; uses `manifest.json` WebAPK splash on Android and zero-dependency Node-generated static portrait PNGs (`scripts/generate-splash.mjs`) for iOS `apple-touch-startup-image` across 10 iPhone resolutions, all precached offline via Workbox.
- **Real-Time Cloud Firestore Sync**: Uses `onSnapshot(..., { includeMetadataChanges: true })` over the `equipments` collection with multi-tab IndexedDB persistence (`persistentLocalCache` + `persistentMultipleTabManager`).
- **Live Sync Telemetry**: Dynamically reflects `Live Sync` (emerald), `Syncing...` (amber), and `Offline Mode` (orange) from Firestore snapshot metadata (`fromCache`, `hasPendingWrites`) and browser connectivity, with zero-shift amber clock indicators on pending rows.
- **Seamless iOS & Android Ergonomics**: Pure CSS opacity-only entrance (`appFadeIn`) with Safari `bfcache` `pageshow` guard, fixed `body::before` iOS status bar shield (`z-40`), solid opaque sticky header (`z-30`) with `+26px` safe-area top clearance, natural document scroll with anti-black-bar `100dvh`/`-webkit-fill-available` shell, high-contrast outdoor tabs & overflow-clipped sliding status pills, `400ms` per-tag double-tap cooldown, and hyphen/space-insensitive tag search.
- **Static 24-Hour Card Timestamps**: Displays `DD/MM/YY · HH:mm` with `tabular-nums` alignment and safe local device time fallback alongside pending-write clock indicators.
- **Smart Auto-Updating PWA & Changelog Modal**: Header version pill (`v1.4.0`) opens a `z-50` accordion changelog modal with manual `Check Update`. Uses Workbox `prompt` updates paired with a 4-second Idle Guard, Firestore `hasPendingWrites` Sync Guard, preview sandbox guard, `1.5s` `"Update available — reloading..."` toast, and post-reload `"Updated to v1.4.0"` confirmation.

## Development & Build
```bash
npm install
npm run dev
npm run build
```

---
©2026 — Developed by FIKRI
