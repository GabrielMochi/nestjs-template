import { getSherlockCacheKey } from './sherlock-cache-key';

describe('getSherlockCacheKey', () => {
  it('uses the trimmed username and nsfw flag', () => {
    expect(getSherlockCacheKey(' foo ', false)).toBe(getSherlockCacheKey('foo', false));
    expect(getSherlockCacheKey('foo', true)).not.toBe(getSherlockCacheKey('foo', false));
  });
});
