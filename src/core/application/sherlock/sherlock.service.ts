import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { Injectable } from '@nestjs/common';
import { RedisCacheService } from '@infrastructure/cache/redis-cache.service';
import { getSherlockCacheKey } from './sherlock-cache-key';
import type { SherlockCacheableEvent, SherlockEvent } from './sherlock-events';
import { parseSherlockLine } from './sherlock-output.parser';

const SHERLOCK_CACHE_TTL_SECONDS = 86_400;

type StreamSherlockParams = {
  username: string;
  nsfw: boolean;
  signal: AbortSignal;
  onEvent: (event: SherlockEvent) => void;
};

@Injectable()
export class SherlockService {
  constructor(private readonly cache: RedisCacheService) {}

  async stream({ username, nsfw, signal, onEvent }: StreamSherlockParams): Promise<void> {
    const normalizedUsername = username.trim();
    const cacheKey = getSherlockCacheKey(normalizedUsername, nsfw);
    const cachedEvents = await this.getCachedEvents(cacheKey);

    if (cachedEvents !== null) {
      for (const event of cachedEvents) {
        onEvent(event);
      }
      onEvent({ type: 'done', cached: true });
      return;
    }

    const events = await this.runSherlock(normalizedUsername, nsfw, signal, onEvent);

    if (signal.aborted) {
      return;
    }

    await this.setCachedEvents(cacheKey, events);
    onEvent({ type: 'done', cached: false });
  }

  private async getCachedEvents(key: string): Promise<SherlockCacheableEvent[] | null> {
    try {
      const value = await this.cache.get(key);
      return value === null ? null : (JSON.parse(value) as SherlockCacheableEvent[]);
    } catch {
      return null;
    }
  }

  private async setCachedEvents(key: string, events: SherlockCacheableEvent[]): Promise<void> {
    try {
      await this.cache.set(key, JSON.stringify(events), SHERLOCK_CACHE_TTL_SECONDS);
    } catch {
      // ponytail: cache failures should not fail a completed Sherlock stream.
    }
  }

  private runSherlock(
    username: string,
    nsfw: boolean,
    signal: AbortSignal,
    onEvent: (event: SherlockEvent) => void,
  ): Promise<SherlockCacheableEvent[]> {
    const args = ['--no-color', '--local', ...(nsfw ? ['--nsfw'] : []), username];
    const child = spawn('sherlock', args, { stdio: ['ignore', 'pipe', 'pipe'] });
    const events: SherlockCacheableEvent[] = [];
    const stdout = child.stdout;
    let settled = false;

    const abort = () => {
      child.kill();
    };

    signal.addEventListener('abort', abort, { once: true });

    return new Promise((resolve, reject) => {
      const finish = (callback: () => void) => {
        if (settled) {
          return;
        }

        settled = true;
        signal.removeEventListener('abort', abort);
        callback();
      };

      if (stdout !== null) {
        const lines = createInterface({ input: stdout });
        lines.on('line', (line) => {
          const event = parseSherlockLine(line);

          if (event === null) {
            return;
          }

          events.push(event);
          onEvent(event);
        });
        lines.once('close', () => undefined);
      }

      child.once('error', () => finish(() => reject(new Error('Sherlock failed'))));
      child.once('close', (code) => {
        finish(() => {
          if (signal.aborted) {
            resolve(events);
            return;
          }

          if (code === 0) {
            resolve(events);
            return;
          }

          reject(new Error('Sherlock failed'));
        });
      });
    });
  }
}
