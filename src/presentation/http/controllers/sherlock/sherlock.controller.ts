import { BadRequestException, Controller, Get, Query, Res } from '@nestjs/common';
import { SherlockService } from '@core/application/sherlock/sherlock.service';
import type { Response } from 'express';

@Controller('sherlock')
export class SherlockController {
  constructor(private readonly sherlockService: SherlockService) {}

  @Get()
  async search(
    @Query('username') username: string | string[] | undefined,
    @Query('nsfw') nsfw: string | string[] | undefined,
    @Res() res: Response,
  ) {
    const normalizedUsername = parseUsername(username);
    const includeNsfw = parseOptionalBoolean(nsfw);
    const abortController = new AbortController();
    let closed = false;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    res.once('close', () => {
      closed = true;
      abortController.abort();
    });

    const writeEvent = (event: unknown) => {
      if (!closed) {
        res.write(`data: ${JSON.stringify(event)}\n\n`);
      }
    };

    try {
      await this.sherlockService.stream({
        username: normalizedUsername,
        nsfw: includeNsfw,
        signal: abortController.signal,
        onEvent: writeEvent,
      });
    } catch {
      writeEvent({ type: 'error', message: 'Sherlock failed' });
    } finally {
      if (!closed) {
        res.end();
      }
    }
  }
}

function parseUsername(username: string | string[] | undefined): string {
  if (typeof username !== 'string') {
    throw new BadRequestException('username is required');
  }

  const normalizedUsername = username.trim();
  if (normalizedUsername.length === 0) {
    throw new BadRequestException('username is required');
  }

  return normalizedUsername;
}

function parseOptionalBoolean(value: string | string[] | undefined): boolean {
  if (value === undefined) {
    return false;
  }

  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  throw new BadRequestException('nsfw must be true or false');
}
