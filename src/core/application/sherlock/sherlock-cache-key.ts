import { createHash } from 'node:crypto';

export function getSherlockCacheKey(username: string, nsfw: boolean): string {
  const hash = createHash('sha256')
    .update(`${username.trim()}\0${String(nsfw)}`)
    .digest('hex');

  return `sherlock:${hash}`;
}
