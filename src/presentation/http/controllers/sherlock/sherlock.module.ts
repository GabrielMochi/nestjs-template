import { Module } from '@nestjs/common';
import { SherlockService } from '@core/application/sherlock/sherlock.service';
import { RedisCacheService } from '@infrastructure/cache/redis-cache.service';
import { ConfigModule } from '@infrastructure/config/config.module';
import { SherlockController } from './sherlock.controller';

@Module({
  imports: [ConfigModule],
  controllers: [SherlockController],
  providers: [RedisCacheService, SherlockService],
})
export class SherlockModule {}
