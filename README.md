# Running Status Checker (`v1.1.1`)

Real-time Progressive Web App (PWA) for monitoring and updating the running status (`RUNNING`, `STANDBY`, `IGNORE`) of all 56 Urea 1B plant equipment units.

## Key Capabilities
- **Real-Time Cloud Firestore Sync**: Uses `onSnapshot(..., { includeMetadataChanges: true })` over the `equipments` collection with multi-tab IndexedDB persistence (`persistentLocalCache` + `persistentMultipleTabManager`).
- **Live Sync Telemetry**: Dynamically reflects `Live Sync` (emerald), `Syncing...` (amber), and `Offline Mode` (orange) from Firestore snapshot metadata (`fromCache`, `hasPendingWrites`) and browser connectivity, with zero-shift amber clock indicators on pending rows.
- **Mobile Field Ergonomics**: Strict dark industrial UI (`#0f172a` / `#1e293b` / `#10b981`), `h-dvh` anti-black-bar shell with smooth vertical `pan-y` scrolling, iOS notch & home-bar safe-area padding, anti-zoom `16px` search input, smooth sliding 3-state status selector, `400ms` per-tag double-tap cooldown, and hyphen/space-insensitive tag search.
- **Installable PWA**: Unified pulse SVG and solid `#0f172a` PNG icons (`180x180`, `192x192`, `512x512`), native browser install prompt support, Workbox `autoUpdate` (`skipWaiting`/`clientsClaim`), foreground `visibilitychange` update checks, and reliable `"Updated to v1.1.1"` toast notifications.

## Development & Build
```bash
npm install
npm run dev
npm run build
```

---
©2026 — Developed by FIKRI • v1.1.1
