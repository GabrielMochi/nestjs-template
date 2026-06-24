import { Injectable, type OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, type RedisClientType } from 'redis';

@Injectable()
export class RedisCacheService implements OnModuleDestroy {
  private client: RedisClientType | null = null;
  private connecting: Promise<RedisClientType> | null = null;

  constructor(private readonly configService: ConfigService) {}

  async get(key: string): Promise<string | null> {
    const client = await this.getClient();

    return client.get(key);
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    const client = await this.getClient();

    await client.set(key, value, { EX: ttlSeconds });
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client?.isOpen) {
      await this.client.close();
    }
  }

  private async getClient(): Promise<RedisClientType> {
    if (this.client?.isOpen) {
      return this.client;
    }

    if (this.connecting !== null) {
      return this.connecting;
    }

    const client = createClient({
      url: this.configService.get<string>('REDIS_URL') ?? 'redis://localhost:6379',
      socket: { reconnectStrategy: false },
    });

    client.on('error', () => undefined);
    this.connecting = client
      .connect()
      .then(() => {
        this.client = client;
        this.connecting = null;

        return client;
      })
      .catch((error: unknown) => {
        this.client = null;
        this.connecting = null;

        throw error;
      });

    return this.connecting;
  }
}
