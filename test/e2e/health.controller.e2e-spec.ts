import request from 'supertest';
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import type { Server } from 'http';
import { vi } from 'vitest';
import { HealthModule } from '@presentation/http/controllers/health/health.module';
import type { HealthIndicatorStatus } from '@nestjs/terminus';
import { DiskHealthIndicator, MemoryHealthIndicator } from '@nestjs/terminus';

const DEFAULT_HEALTH_STATUS: HealthIndicatorStatus = 'up';

type HealthIndicatorMock = () => Promise<Record<string, { status: HealthIndicatorStatus }>>;

describe('HealthController (e2e)', () => {
  let app: INestApplication<Server>;

  // Create variables to control mock behavior
  let memoryHealthStatus: HealthIndicatorStatus = DEFAULT_HEALTH_STATUS;
  let memoryRSSStatus: HealthIndicatorStatus = DEFAULT_HEALTH_STATUS;
  let storageStatus: HealthIndicatorStatus = DEFAULT_HEALTH_STATUS;

  const mockCheckHeap = vi.fn<HealthIndicatorMock>().mockImplementation(() => {
    return Promise.resolve({
      memory_heap: { status: memoryHealthStatus },
    });
  });

  const mockCheckRSS = vi.fn<HealthIndicatorMock>().mockResolvedValue({
    memory_rss: { status: memoryRSSStatus },
  });

  const mockCheckStorage = vi.fn<HealthIndicatorMock>().mockResolvedValue({
    storage: { status: storageStatus },
  });

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [HealthModule],
    })
      .overrideProvider(MemoryHealthIndicator)
      .useValue({
        checkHeap: mockCheckHeap,
        checkRSS: mockCheckRSS,
      })
      .overrideProvider(DiskHealthIndicator)
      .useValue({
        checkStorage: mockCheckStorage,
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  beforeEach(() => {
    memoryHealthStatus = DEFAULT_HEALTH_STATUS;
    memoryRSSStatus = DEFAULT_HEALTH_STATUS;
    storageStatus = DEFAULT_HEALTH_STATUS;

    vi.clearAllMocks();
  });

  it('/health (GET) with status up', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('status', 'ok');
        expect(res.body).toHaveProperty('info');
        expect(res.body).toHaveProperty('details');
      });
  });

  it('/health (GET) with status down', () => {
    // Set the memory health status to 'down' for this test
    // By setting one of the health indicators to 'down', the overall status should be 'error'
    memoryHealthStatus = 'down';

    return request(app.getHttpServer())
      .get('/health')
      .expect(503)
      .expect((res) => {
        expect(res.body).toHaveProperty('status', 'error');
        expect(res.body).toHaveProperty('error');
        expect(res.body).toHaveProperty('details');
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
