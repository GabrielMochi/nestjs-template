import request from 'supertest';
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import type { Server } from 'http';
import { SherlockController } from '@presentation/http/controllers/sherlock/sherlock.controller';
import { SherlockService } from '@core/application/sherlock/sherlock.service';
import type { SherlockEvent } from '@core/application/sherlock/sherlock-events';
import { vi } from 'vitest';

type StreamParams = {
  username: string;
  nsfw: boolean;
  signal: AbortSignal;
  onEvent: (event: SherlockEvent) => void;
};

describe('SherlockController (e2e)', () => {
  let app: INestApplication<Server>;
  const stream = vi.fn<(params: StreamParams) => Promise<void>>();

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      controllers: [SherlockController],
      providers: [{ provide: SherlockService, useValue: { stream } }],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  beforeEach(() => {
    stream.mockReset();
    stream.mockImplementation(async ({ onEvent }) => {
      onEvent({ type: 'message', message: 'Checking username foo on:' });
      onEvent({ type: 'done', cached: false });
    });
  });

  it('streams JSON SSE events and defaults nsfw to false', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/sherlock?username=foo')
      .expect(200);

    expect(response.headers['content-type']).toContain('text/event-stream');
    expect(response.text).toContain(
      'data: {"type":"message","message":"Checking username foo on:"}',
    );
    expect(stream).toHaveBeenCalledWith(expect.objectContaining({ username: 'foo', nsfw: false }));
  });

  it('passes nsfw=true to the service', async () => {
    await request(app.getHttpServer()).get('/api/sherlock?username=foo&nsfw=true').expect(200);

    expect(stream).toHaveBeenCalledWith(expect.objectContaining({ username: 'foo', nsfw: true }));
  });

  it('rejects missing or invalid params', async () => {
    const missingUsername = await request(app.getHttpServer()).get('/api/sherlock').expect(400);
    const invalidNsfw = await request(app.getHttpServer())
      .get('/api/sherlock?username=foo&nsfw=maybe')
      .expect(400);

    expect(missingUsername.status).toBe(400);
    expect(invalidNsfw.status).toBe(400);
  });

  afterAll(async () => {
    await app.close();
  });
});
