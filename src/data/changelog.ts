export interface ChangelogEntry {
  version: string;
  tag: 'Latest' | 'Minor' | 'Patch' | 'Initial';
  changes: readonly string[];
}

export const CHANGELOG_ENTRIES: readonly ChangelogEntry[] = [
  {
    version: '1.4.0',
    tag: 'Latest',
    changes: [
      'Added interactive header version pill (v1.4.0) next to Running Status with neutral and update-ready accent states.',
      'Added dark Changelog & Updates modal (z-50) with manual Check Update button and accordion version history (v1.4.0 expanded by default, prior versions collapsed).',
      'Implemented Smart Forced Update with 4-second Idle Guard, Firestore pending-writes Sync Guard, AI Studio preview sandbox guard, 1.5s pre-reload toast, and post-reload update confirmation.',
      'Raised ToastContainer layer to z-[60] and added amber updating and emerald success toast styles.',
      'Replaced relative equipment timestamps with static 24-hour DD/MM/YY · HH:mm format and local device time fallback.',
      'Adjusted mobile header title sizing (text-lg sm:text-2xl) for clean 1-row fit and simplified footer to ©2026 — Developed by FIKRI.',
    ],
  },
  {
    version: '1.3.0',
    tag: 'Minor',
    changes: [
      'Rebranded the application to Running Status across UI header, index.html meta tags, manifest.json, and package metadata while keeping base: "./" and Firebase/storage keys intact.',
      'Refined header visual hierarchy and increased safe-area top clearance to +26px beneath the z-40 top shield.',
    ],
  },
  {
    version: '1.2.0',
    tag: 'Minor',
    changes: [
      'Added 1-layer native PWA splash screen system with 10 portrait iOS apple-touch-startup-image PNGs precached via Workbox.',
      'Added pure CSS opacity-only entrance animation (appFadeIn) with Safari bfcache pageshow opacity guard.',
      'Implemented fixed body::before top safe-area shield (z-40) and natural document scroll with anti-bottom-black-bar shell.',
      'Added overflow-hidden clipping on 3-state status selector tracks for narrow 320px–360px screens.',
    ],
  },
  {
    version: '1.1.2',
    tag: 'Patch',
    changes: [
      'Eliminated iOS Safari bottom black bar and switched sticky header to solid opaque #0f172a.',
      'Improved outdoor contrast on the 4 filter tabs and 3-state status buttons.',
    ],
  },
  {
    version: '1.1.1',
    tag: 'Patch',
    changes: [
      'Fixed vertical scrolling across iOS, Android, and desktop with touch-action: pan-y and safe-area bottom clearance.',
      'Removed custom install button/modal so native browser install prompts appear uninterrupted.',
    ],
  },
  {
    version: '1.1.0',
    tag: 'Minor',
    changes: [
      'Fixed iPhone notch/Dynamic Island safe-area clearance and unified header pulse SVG with favicon.',
      'Enabled Firestore includeMetadataChanges for live Live Sync, Syncing..., and Offline Mode telemetry.',
      'Added 4 proportional status filter tabs, enlarged tag headers with pending clock icons, and smooth sliding status pills.',
    ],
  },
  {
    version: '1.0.3',
    tag: 'Patch',
    changes: [
      'Added anti-zoom viewport/input sizing, hyphen/space-insensitive tag search, and 400ms per-tag tap cooldown guard.',
    ],
  },
  {
    version: '1.0.2',
    tag: 'Patch',
    changes: [
      'Enforced 100dvh safe-area padding, enabled Firestore multi-tab persistentLocalCache, and added Firebase error codes in toasts.',
    ],
  },
  {
    version: '1.0.1',
    tag: 'Patch',
    changes: [
      'Connected Cloud Firestore (urea1b-running-status) with idempotent missing-doc seeding and relative base: "./".',
    ],
  },
  {
    version: '1.0.0',
    tag: 'Initial',
    changes: [
      'Initial release of Running Status for 56 alphabetical Urea 1B plant equipment tags.',
    ],
  },
];
