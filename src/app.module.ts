import { Module } from '@nestjs/common';
import { ConfiguratorModule } from './infrastructure/modules/configurator.module';
import { PinoLoggerModule } from './infrastructure/modules/pino-logger.module';
import { HealthModule } from './interfaces/http/controllers/health/health.module';

@Module({
  imports: [ConfiguratorModule, PinoLoggerModule, HealthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
