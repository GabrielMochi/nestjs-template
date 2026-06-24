import { PassThrough } from 'node:stream';
import { EventEmitter } from 'node:events';
import { spawn } from 'node:child_process';
import { SherlockService } from './sherlock.service';
import type { SherlockEvent } from './sherlock-events';
import type { RedisCacheService } from '@infrastructure/cache/redis-cache.service';
import { vi } from 'vitest';

vi.mock('node:child_process', () => ({
  spawn: vi.fn<(...args: Parameters<typeof spawn>) => ReturnType<typeof spawn>>(),
}));

const spawnMock = vi.mocked(spawn);

type MockChild = EventEmitter & {
  stdout: PassThrough;
  kill: ReturnType<typeof vi.fn<() => boolean>>;
};

describe('SherlockService', () => {
  let cache: Pick<RedisCacheService, 'get' | 'set'>;
  let service: SherlockService;

  beforeEach(() => {
    cache = {
      get: vi.fn<(key: string) => Promise<string | null>>().mockResolvedValue(null),
      set: vi
        .fn<(key: string, value: string, ttlSeconds: number) => Promise<void>>()
        .mockResolvedValue(undefined),
    };
    service = new SherlockService(cache as RedisCacheService);
    spawnMock.mockReset();
  });

  it('streams cached events without spawning Sherlock', async () => {
    vi.mocked(cache.get).mockResolvedValue(
      JSON.stringify([{ type: 'message', message: 'cached' }]),
    );
    const events: SherlockEvent[] = [];

    await service.stream({
      username: ' foo ',
      nsfw: false,
      signal: new AbortController().signal,
      onEvent: (event) => events.push(event),
    });

    expect(spawnMock).not.toHaveBeenCalled();
    expect(events).toEqual([
      { type: 'message', message: 'cached' },
      { type: 'done', cached: true },
    ]);
  });

  it('spawns Sherlock and caches successful parsed events', async () => {
    const child = createMockChild();
    spawnMock.mockReturnValue(child as ReturnType<typeof spawn>);
    const events: SherlockEvent[] = [];
    const stream = service.stream({
      username: 'foo',
      nsfw: true,
      signal: new AbortController().signal,
      onEvent: (event) => events.push(event),
    });
    await vi.waitFor(() => expect(spawnMock).toHaveBeenCalled());

    child.stdout.write('[*] Checking username foo on:\n');
    child.stdout.write('[+] TikTok: https://www.tiktok.com/@foo\n');
    child.stdout.end();
    child.emit('close', 0);
    await stream;

    expect(spawnMock).toHaveBeenCalledWith('sherlock', ['--no-color', '--local', '--nsfw', 'foo'], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    expect(cache.set).toHaveBeenCalledWith(
      expect.stringMatching(/^sherlock:/),
      JSON.stringify(events.slice(0, 2)),
      86_400,
    );
    expect(events.at(-1)).toEqual({ type: 'done', cached: false });
  });

  it('does not cache failed runs', async () => {
    const child = createMockChild();
    spawnMock.mockReturnValue(child as ReturnType<typeof spawn>);

    const stream = service.stream({
      username: 'foo',
      nsfw: false,
      signal: new AbortController().signal,
      onEvent: vi.fn<(event: SherlockEvent) => void>(),
    });
    await vi.waitFor(() => expect(spawnMock).toHaveBeenCalled());

    child.emit('close', 1);
    await expect(stream).rejects.toThrow('Sherlock failed');
    expect(cache.set).not.toHaveBeenCalled();
  });

  it('kills Sherlock and skips cache when aborted', async () => {
    const child = createMockChild();
    const abortController = new AbortController();
    spawnMock.mockReturnValue(child as ReturnType<typeof spawn>);

    const stream = service.stream({
      username: 'foo',
      nsfw: false,
      signal: abortController.signal,
      onEvent: vi.fn<(event: SherlockEvent) => void>(),
    });
    await vi.waitFor(() => expect(spawnMock).toHaveBeenCalled());

    abortController.abort();
    child.emit('close', null);
    await stream;

    expect(child.kill).toHaveBeenCalled();
    expect(cache.set).not.toHaveBeenCalled();
  });
});

function createMockChild(): MockChild {
  const child = new EventEmitter() as MockChild;
  child.stdout = new PassThrough();
  child.kill = vi.fn<() => boolean>(() => true);

  return child;
}
