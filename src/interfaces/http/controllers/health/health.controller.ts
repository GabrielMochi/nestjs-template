import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import {
  DiskHealthIndicator,
  HealthCheckResult,
  HealthCheckService,
  MemoryHealthIndicator,
} from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
  ) {}

  /**
   * Checks the health of various components including the database, memory, and storage.
   */
  @ApiOkResponse({
    description: 'The health check was successful.',
    example: {
      status: 'ok',
      info: {
        memory_heap: { status: 'up' },
        memory_rss: { status: 'up' },
        storage: { status: 'up' },
      },
      error: {},
      details: {
        memory_heap: { status: 'up' },
        memory_rss: { status: 'up' },
        storage: { status: 'up' },
      },
    },
  })
  @Get()
  async check(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
      () => this.memory.checkRSS('memory_rss', 150 * 1024 * 1024),
      () => this.disk.checkStorage('storage', { thresholdPercent: 0.8, path: '/' }),
    ]);
  }
}
