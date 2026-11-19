export type EquipmentStatus = 'RUNNING' | 'STANDBY' | 'IGNORE';

export interface EquipmentRecord {
  tag: string;
  status: EquipmentStatus;
  updatedAt: number;
  hasPendingWrites?: boolean;
}

export type SyncMode = 'local' | 'firestore';

export type ToastVariant = 'success' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  variant: ToastVariant;
  title: string;
  message?: string;
}
