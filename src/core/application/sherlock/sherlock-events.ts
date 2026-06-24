export type SherlockCacheableEvent =
  | { type: 'message'; message: string }
  | { type: 'found'; site: string; url: string };

export type SherlockEvent =
  | SherlockCacheableEvent
  | { type: 'done'; cached: boolean }
  | { type: 'error'; message: 'Sherlock failed' };
