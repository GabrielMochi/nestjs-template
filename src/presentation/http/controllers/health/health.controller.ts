import { Controller, Get } from '@nestjs/common';
import {
  DiskHealthIndicator,
  type HealthCheckResult,
  HealthCheckService,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import { CheckHealthSwagger } from './health.swagger';

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
  @CheckHealthSwagger()
  @Get()
  async check(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
      () => this.memory.checkRSS('memory_rss', 150 * 1024 * 1024),
      () => this.disk.checkStorage('storage', { thresholdPercent: 0.8, path: '/' }),
    ]);
  }
}
