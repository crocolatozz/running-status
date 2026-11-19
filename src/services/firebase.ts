import {initializeApp, getApps, type FirebaseApp} from 'firebase/app';
import {
  collection,
  doc,
  getDocs,
  getFirestore,
  initializeFirestore,
  onSnapshot,
  persistentLocalCache,
  persistentMultipleTabManager,
  setDoc,
  writeBatch,
  type Firestore,
} from 'firebase/firestore';
import {UREA_1B_EQUIPMENT_TAGS} from '../data/urea1bEquipments';
import type {EquipmentRecord, EquipmentStatus, SyncMode} from '../types/equipment';

export const firebaseConfig = {
  apiKey: 'AIzaSyBZ-2hv8OpbcKzBvcbtrtDI5mNEf0bbI2A',
  authDomain: 'urea1b-running-status.firebaseapp.com',
  projectId: 'urea1b-running-status',
  storageBucket: 'urea1b-running-status.firebasestorage.app',
  messagingSenderId: '4700480135',
  appId: '1:4700480135:web:8dd130efee769779c78e22',
};

const EQUIPMENTS_COLLECTION = 'equipments';
const LOCAL_STORAGE_KEY = 'rsc_urea1b_equipments_v1';

type EquipmentSubscriber = (records: EquipmentRecord[]) => void;

const localSubscribers = new Set<EquipmentSubscriber>();
let cachedFirestore: Firestore | null = null;
let storageListenerAttached = false;
let seedPromise: Promise<void> | null = null;

export interface FormattedFirebaseError {
  code: string;
  message: string;
}

export function formatFirebaseError(error: unknown): FormattedFirebaseError {
  if (error && typeof error === 'object') {
    const maybeErr = error as {code?: unknown; message?: unknown};
    const code = typeof maybeErr.code === 'string' && maybeErr.code.length > 0 ? maybeErr.code : 'unknown';
    const message =
      typeof maybeErr.message === 'string' && maybeErr.message.length > 0
        ? maybeErr.message
        : 'Unexpected Firestore error.';
    return {code, message};
  }
  return {code: 'unknown', message: String(error || 'Unexpected Firestore error.')};
}

export function isFirebaseConfigured(): boolean {
  const {apiKey, projectId, appId} = firebaseConfig;
  const isValidValue = (val: string | undefined): boolean =>
    Boolean(val && val.trim().length > 0 && !val.startsWith('YOUR_FIREBASE_'));

  return isValidValue(apiKey) && isValidValue(projectId) && isValidValue(appId);
}

export function getSyncMode(): SyncMode {
  return isFirebaseConfigured() ? 'firestore' : 'local';
}

function getFirestoreInstance(): Firestore {
  if (cachedFirestore) return cachedFirestore;
  const app: FirebaseApp = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
  try {
    cachedFirestore = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    });
  } catch {
    cachedFirestore = getFirestore(app);
  }
  return cachedFirestore;
}

function sortAlphabetically(records: EquipmentRecord[]): EquipmentRecord[] {
  return [...records].sort((a, b) => a.tag.localeCompare(b.tag));
}

function buildSeedRecords(timestamp = Date.now()): EquipmentRecord[] {
  return sortAlphabetically(
    UREA_1B_EQUIPMENT_TAGS.map((tag) => ({
      tag,
      status: 'RUNNING' as EquipmentStatus,
      updatedAt: timestamp,
    })),
  );
}

function isValidStatus(value: unknown): value is EquipmentStatus {
  return value === 'RUNNING' || value === 'STANDBY' || value === 'IGNORE';
}

function normalizeTimestamp(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (
    value &&
    typeof value === 'object' &&
    'toMillis' in value &&
    typeof (value as {toMillis: () => number}).toMillis === 'function'
  ) {
    return (value as {toMillis: () => number}).toMillis();
  }
  return Date.now();
}

function readLocalRecords(): EquipmentRecord[] {
  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      const seeded = buildSeedRecords();
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }

    const parsed = JSON.parse(raw) as Partial<EquipmentRecord>[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const seeded = buildSeedRecords();
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }

    const byTag = new Map<string, EquipmentRecord>();
    const now = Date.now();

    for (const item of parsed) {
      if (typeof item?.tag === 'string' && isValidStatus(item?.status)) {
        byTag.set(item.tag, {
          tag: item.tag,
          status: item.status,
          updatedAt: normalizeTimestamp(item.updatedAt),
        });
      }
    }

    let repaired = false;
    for (const tag of UREA_1B_EQUIPMENT_TAGS) {
      if (!byTag.has(tag)) {
        byTag.set(tag, {tag, status: 'RUNNING', updatedAt: now});
        repaired = true;
      }
    }

    const result = sortAlphabetically(Array.from(byTag.values()));
    if (repaired) {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(result));
    }
    return result;
  } catch {
    return buildSeedRecords();
  }
}

function writeLocalRecords(records: EquipmentRecord[]): void {
  const sorted = sortAlphabetically(records);
  try {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sorted));
  } catch {
    // Ignore storage quota errors cleanly
  }
  for (const listener of localSubscribers) {
    listener(sorted);
  }
}

function attachLocalStorageSync(): void {
  if (storageListenerAttached || typeof window === 'undefined') return;
  storageListenerAttached = true;
  window.addEventListener('storage', (event) => {
    if (event.key === LOCAL_STORAGE_KEY) {
      const records = readLocalRecords();
      for (const listener of localSubscribers) {
        listener(records);
      }
    }
  });
}

async function ensureFirestoreSeeded(db: Firestore): Promise<void> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return;
  }

  if (seedPromise) {
    return seedPromise;
  }

  seedPromise = (async () => {
    const colRef = collection(db, EQUIPMENTS_COLLECTION);
    const snapshot = await getDocs(colRef);
    const existingIds = new Set(snapshot.docs.map((docSnap) => docSnap.id));
    const missingTags = UREA_1B_EQUIPMENT_TAGS.filter((tag) => !existingIds.has(tag));

    if (missingTags.length === 0) {
      return;
    }

    const batch = writeBatch(db);
    const now = Date.now();
    for (const tag of missingTags) {
      const docRef = doc(db, EQUIPMENTS_COLLECTION, tag);
      batch.set(
        docRef,
        {
          tag,
          status: 'RUNNING',
          updatedAt: now,
        },
        {merge: true},
      );
    }
    await batch.commit();
  })();

  try {
    await seedPromise;
  } finally {
    seedPromise = null;
  }
}

export function subscribeEquipments(
  onData: EquipmentSubscriber,
  onError?: (error: FormattedFirebaseError) => void,
): () => void {
  if (!isFirebaseConfigured()) {
    attachLocalStorageSync();
    localSubscribers.add(onData);
    onData(readLocalRecords());

    return () => {
      localSubscribers.delete(onData);
    };
  }

  let active = true;
  let unsubscribeSnapshot: (() => void) | null = null;

  try {
    const db = getFirestoreInstance();
    const colRef = collection(db, EQUIPMENTS_COLLECTION);

    // Attach onSnapshot immediately so IndexedDB cached data renders instantaneously offline
    unsubscribeSnapshot = onSnapshot(
      colRef,
      (snapshot) => {
        if (!active) return;
        const map = new Map<string, EquipmentRecord>();
        snapshot.forEach((docSnap) => {
          const data = docSnap.data({serverTimestamps: 'estimate'});
          const tag = typeof data.tag === 'string' ? data.tag : docSnap.id;
          const status = isValidStatus(data.status) ? data.status : 'RUNNING';
          const updatedAt = normalizeTimestamp(data.updatedAt);
          map.set(tag, {
            tag,
            status,
            updatedAt,
            hasPendingWrites: docSnap.metadata.hasPendingWrites,
          });
        });

        const now = Date.now();
        for (const tag of UREA_1B_EQUIPMENT_TAGS) {
          if (!map.has(tag)) {
            map.set(tag, {tag, status: 'RUNNING', updatedAt: now, hasPendingWrites: false});
          }
        }

        onData(sortAlphabetically(Array.from(map.values())));
      },
      (err) => {
        onError?.(formatFirebaseError(err));
      },
    );

    // Non-blocking background seeder for missing documents; silence transient offline errors
    void ensureFirestoreSeeded(db).catch((err) => {
      if (!active) return;
      const formatted = formatFirebaseError(err);
      const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;
      if (isOffline && formatted.code === 'unavailable') {
        return;
      }
      if (!isOffline) {
        onError?.(formatted);
      }
    });
  } catch (err) {
    onError?.(formatFirebaseError(err));
  }

  return () => {
    active = false;
    unsubscribeSnapshot?.();
  };
}

export function updateEquipmentStatus(
  tag: string,
  status: EquipmentStatus,
  onSyncError?: (error: FormattedFirebaseError) => void,
): EquipmentRecord {
  const updatedAt = Date.now();
  const updatedRecord: EquipmentRecord = {tag, status, updatedAt};

  if (!isFirebaseConfigured()) {
    const current = readLocalRecords();
    const next = current.map((item) => (item.tag === tag ? updatedRecord : item));
    writeLocalRecords(next);
    return updatedRecord;
  }

  // Non-blocking write: Firestore persistentLocalCache updates local state immediately
  // and queues sync for when connectivity returns.
  try {
    const db = getFirestoreInstance();
    const docRef = doc(db, EQUIPMENTS_COLLECTION, tag);
    void setDoc(docRef, updatedRecord, {merge: true}).catch((err) => {
      onSyncError?.(formatFirebaseError(err));
    });
  } catch (err) {
    onSyncError?.(formatFirebaseError(err));
  }

  return updatedRecord;
}
