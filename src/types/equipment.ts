export type EquipmentStatus = 'RUNNING' | 'STANDBY' | 'IGNORE';

export interface EquipmentRecord {
  tag: string;
  status: EquipmentStatus;
  updatedAt: number;
  hasPendingWrites?: boolean;
}

export interface FirestoreSyncMetadata {
  fromCache: boolean;
  hasPendingWrites: boolean;
}

export type SyncMode = 'local' | 'firestore';

export type ToastVariant = 'running' | 'standby' | 'ignore' | 'info' | 'error';

export interface ToastItem {
  id: string;
  variant: ToastVariant;
  title: string;
  message?: string;
}
