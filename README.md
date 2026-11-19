# Running Status Checker (`v1.0.3`)

Real-time Progressive Web App (PWA) for monitoring and updating the running status (`RUNNING`, `STANDBY`, `IGNORE`) of all 56 Urea 1B plant equipment units.

## Key Capabilities
- **Real-Time Cloud Firestore Sync**: Uses `onSnapshot` over the `equipments` collection with multi-tab IndexedDB persistence (`persistentLocalCache` + `persistentMultipleTabManager`).
- **Offline Dead-Zone Resilience**: Queues status updates optimistically while offline, displays a `Pending sync` indicator on unsynced rows, estimates local timestamps, and switches the header status badge dynamically between `Live Sync` and `Offline Mode`.
- **Mobile Field Ergonomics**: Strict dark industrial UI (`#0f172a` / `#1e293b` / `#10b981`), anti-zoom viewport and `16px` search input, `touch-action: manipulation` / `pan-y`, `400ms` per-tag double-tap cooldown, and forbearing tag search (ignores hyphens and spaces).
- **Installable PWA**: Configured with `vite-plugin-pwa`, Workbox `autoUpdate` (`skipWaiting: true`, `clientsClaim: true`), relative `./` paths for GitHub Pages subpath hosting, and iOS/Android safe-area insets.

## Development & Build
```bash
npm install
npm run dev
npm run build
```

---
©2026 — Developed by FIKRI · v1.0.3
