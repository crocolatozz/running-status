function toValidDate(timestamp: unknown): Date {
  if (typeof timestamp === 'number' && Number.isFinite(timestamp)) {
    const parsed = new Date(timestamp);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  } else if (
    timestamp &&
    typeof timestamp === 'object' &&
    'toMillis' in timestamp &&
    typeof (timestamp as {toMillis: () => number}).toMillis === 'function'
  ) {
    const ms = (timestamp as {toMillis: () => number}).toMillis();
    if (Number.isFinite(ms)) {
      const parsed = new Date(ms);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed;
      }
    }
  } else if (timestamp instanceof Date && !Number.isNaN(timestamp.getTime())) {
    return timestamp;
  }

  return new Date();
}

export function formatTime24(timestamp: unknown): string {
  const date = toValidDate(timestamp);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function formatDateTime24(timestamp: unknown): string {
  const date = toValidDate(timestamp);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} · ${hours}:${minutes}`;
}
