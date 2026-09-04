export const lastSyncedLabel = (iso: string | null, now = new Date()): string => {
  if (!iso) {
    return 'Never synced';
  }
  const seconds = Math.max(0, Math.floor((now.getTime() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) {
    return 'Last synced just now';
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `Last synced ${minutes}m ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `Last synced ${hours}h ago`;
  }
  return `Last synced ${Math.floor(hours / 24)}d ago`;
};
