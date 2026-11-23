import {useCallback, useEffect, useRef, useState} from 'react';
import {registerSW} from 'virtual:pwa-register';
import {APP_VERSION} from '../data/urea1bEquipments';
import type {ToastVariant} from '../types/equipment';

const VERSION_STORAGE_KEY = 'rsc_app_version';
const PENDING_UPDATE_TOAST_KEY = 'rsc_pending_update_toast';
const IDLE_GUARD_MS = 4_000;
const PRE_RELOAD_TOAST_MS = 1_500;
const INSTALL_WAIT_TIMEOUT_MS = 6_000;

export function isPreviewSandbox(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    if (window.self !== window.top) return true;
  } catch {
    return true;
  }
  const host = window.location.hostname.toLowerCase();
  return (
    host.startsWith('ais-dev-') ||
    host.startsWith('ais-pre-') ||
    host.includes('aistudio') ||
    host.includes('googleusercontent.com') ||
    host.includes('webcontainer')
  );
}

function waitForInstallingWorker(worker: ServiceWorker): Promise<void> {
  if (worker.state === 'installed' || worker.state === 'activated' || worker.state === 'redundant') {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      worker.removeEventListener('statechange', handleStateChange);
      window.clearTimeout(timeoutId);
      resolve();
    };
    const handleStateChange = () => {
      if (
        worker.state === 'installed' ||
        worker.state === 'activated' ||
        worker.state === 'redundant'
      ) {
        finish();
      }
    };
    const timeoutId = window.setTimeout(finish, INSTALL_WAIT_TIMEOUT_MS);
    worker.addEventListener('statechange', handleStateChange);
  });
}

interface UseSmartPwaUpdateOptions {
  hasPendingWrites: boolean;
  pushToast: (variant: ToastVariant, title: string, message?: string) => void;
}

export interface SmartPwaUpdateState {
  updateAvailable: boolean;
  isCheckingUpdate: boolean;
  isReloadingForUpdate: boolean;
  checkForUpdates: () => Promise<void>;
}

export function useSmartPwaUpdate({
  hasPendingWrites,
  pushToast,
}: UseSmartPwaUpdateOptions): SmartPwaUpdateState {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [isReloadingForUpdate, setIsReloadingForUpdate] = useState(false);

  const updateAvailableRef = useRef(false);
  updateAvailableRef.current = updateAvailable;

  const hasPendingWritesRef = useRef(hasPendingWrites);
  hasPendingWritesRef.current = hasPendingWrites;

  const pushToastRef = useRef(pushToast);
  pushToastRef.current = pushToast;

  const lastActivityAtRef = useRef(Date.now());
  const registrationRef = useRef<ServiceWorkerRegistration | undefined>(undefined);
  const updateSWRef = useRef<((reloadPage?: boolean) => Promise<void>) | null>(null);
  const isCheckingRef = useRef(false);
  const isReloadSequenceStartedRef = useRef(false);
  const hasReloadedRef = useRef(false);
  const postReloadCheckedRef = useRef(false);
  const preReloadTimerRef = useRef<number | null>(null);
  const fallbackReloadTimerRef = useRef<number | null>(null);

  const executeSingleReload = useCallback(() => {
    if (hasReloadedRef.current) return;
    hasReloadedRef.current = true;
    window.location.reload();
  }, []);

  // Post-reload confirmation toast & version storage sync
  useEffect(() => {
    if (postReloadCheckedRef.current) return;
    postReloadCheckedRef.current = true;

    let storedVersion: string | null = null;
    let pendingUpdateFlag: string | null = null;

    try {
      storedVersion = window.localStorage.getItem(VERSION_STORAGE_KEY);
      pendingUpdateFlag = window.sessionStorage.getItem(PENDING_UPDATE_TOAST_KEY);
      if (pendingUpdateFlag) {
        window.sessionStorage.removeItem(PENDING_UPDATE_TOAST_KEY);
      }
      window.localStorage.setItem(VERSION_STORAGE_KEY, APP_VERSION);
    } catch {
      // Ignore storage errors cleanly
    }

    if ((storedVersion && storedVersion !== APP_VERSION) || Boolean(pendingUpdateFlag)) {
      pushToastRef.current(
        'success',
        `Updated to v${APP_VERSION}`,
        'Latest application version is now active.',
      );
    }
  }, []);

  // Track user interaction for the 4-second Idle Guard
  useEffect(() => {
    const recordActivity = () => {
      lastActivityAtRef.current = Date.now();
    };

    const events: (keyof WindowEventMap)[] = ['pointerdown', 'touchstart', 'keydown', 'scroll'];
    events.forEach((eventName) => {
      window.addEventListener(eventName, recordActivity, {passive: true, capture: true});
    });

    return () => {
      events.forEach((eventName) => {
        window.removeEventListener(eventName, recordActivity, {capture: true});
      });
    };
  }, []);

  // Register Service Worker & background update listeners (disabled in AI Studio preview sandbox)
  useEffect(() => {
    if (isPreviewSandbox() || typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    const hadControllerOnLoad = Boolean(navigator.serviceWorker.controller);

    const handleControllerChange = () => {
      if (!hadControllerOnLoad) return;
      executeSingleReload();
    };

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

    const updateSW = registerSW({
      immediate: true,
      onNeedRefresh() {
        setUpdateAvailable(true);
      },
      onNeedReload() {
        executeSingleReload();
      },
      onRegisteredSW(_swUrl, registration) {
        registrationRef.current = registration;
        if (registration?.waiting) {
          setUpdateAvailable(true);
        }
      },
    });

    updateSWRef.current = updateSW;

    const triggerSilentUpdateCheck = () => {
      if (typeof navigator !== 'undefined' && !navigator.onLine) return;
      const checkPromise = registrationRef.current
        ? Promise.resolve(registrationRef.current)
        : navigator.serviceWorker.getRegistration();

      void checkPromise
        .then(async (reg) => {
          if (!reg) return;
          registrationRef.current = reg;
          await reg.update();
          if (reg.waiting) {
            setUpdateAvailable(true);
          }
        })
        .catch(() => {});
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        triggerSilentUpdateCheck();
      }
    };

    const handleWindowFocus = () => {
      triggerSilentUpdateCheck();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [executeSingleReload]);

  // Idle (4s) + Firestore Pending Writes Guard before activating SKIP_WAITING & reloading
  useEffect(() => {
    if (!updateAvailable || isReloadSequenceStartedRef.current) {
      return;
    }

    const startReloadSequence = () => {
      if (isReloadSequenceStartedRef.current) return;
      isReloadSequenceStartedRef.current = true;
      setIsReloadingForUpdate(true);

      try {
        window.sessionStorage.setItem(PENDING_UPDATE_TOAST_KEY, `v${APP_VERSION}`);
      } catch {
        // Ignore storage errors cleanly
      }

      pushToastRef.current(
        'updating',
        'Update available — reloading...',
        'Applying latest version safely.',
      );

      preReloadTimerRef.current = window.setTimeout(() => {
        if (updateSWRef.current) {
          void updateSWRef.current(true);
        } else if (registrationRef.current?.waiting) {
          registrationRef.current.waiting.postMessage({type: 'SKIP_WAITING'});
        }

        // Fallback in case controllerchange is delayed in a specific browser
        fallbackReloadTimerRef.current = window.setTimeout(() => {
          executeSingleReload();
        }, 1500);
      }, PRE_RELOAD_TOAST_MS);
    };

    const canProceedNow = () =>
      Date.now() - lastActivityAtRef.current >= IDLE_GUARD_MS && !hasPendingWritesRef.current;

    if (canProceedNow()) {
      startReloadSequence();
      return;
    }

    const guardInterval = window.setInterval(() => {
      if (canProceedNow()) {
        window.clearInterval(guardInterval);
        startReloadSequence();
      }
    }, 250);

    return () => {
      window.clearInterval(guardInterval);
    };
  }, [executeSingleReload, updateAvailable]);

  // Clean up reload timers only on unmount
  useEffect(() => {
    return () => {
      if (preReloadTimerRef.current !== null) {
        window.clearTimeout(preReloadTimerRef.current);
      }
      if (fallbackReloadTimerRef.current !== null) {
        window.clearTimeout(fallbackReloadTimerRef.current);
      }
    };
  }, []);

  const checkForUpdates = useCallback(async () => {
    if (isCheckingRef.current) return;

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      pushToastRef.current(
        'error',
        'Offline — cannot check for updates',
        'Reconnect to check for a newer version.',
      );
      return;
    }

    isCheckingRef.current = true;
    setIsCheckingUpdate(true);

    try {
      if (
        isPreviewSandbox() ||
        typeof navigator === 'undefined' ||
        !('serviceWorker' in navigator)
      ) {
        pushToastRef.current('info', `Already on latest version (v${APP_VERSION})`);
        return;
      }

      const reg =
        registrationRef.current ?? (await navigator.serviceWorker.getRegistration());

      if (!reg) {
        pushToastRef.current('info', `Already on latest version (v${APP_VERSION})`);
        return;
      }

      registrationRef.current = reg;

      if (reg.waiting || updateAvailableRef.current) {
        setUpdateAvailable(true);
        return;
      }

      await reg.update();

      if (reg.installing) {
        await waitForInstallingWorker(reg.installing);
      }

      if (reg.waiting || updateAvailableRef.current) {
        setUpdateAvailable(true);
        return;
      }

      pushToastRef.current('info', `Already on latest version (v${APP_VERSION})`);
    } catch {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        pushToastRef.current(
          'error',
          'Offline — cannot check for updates',
          'Reconnect to check for a newer version.',
        );
      } else {
        pushToastRef.current('error', 'Failed to check for updates');
      }
    } finally {
      isCheckingRef.current = false;
      setIsCheckingUpdate(false);
    }
  }, []);

  return {
    updateAvailable,
    isCheckingUpdate,
    isReloadingForUpdate,
    checkForUpdates,
  };
}
