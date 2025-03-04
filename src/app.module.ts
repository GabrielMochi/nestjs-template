import { Module } from '@nestjs/common';
import { ConfiguratorModule } from './infrastructure/modules/configurator.module';
import { HealthModule } from './interfaces/http/controllers/health/health.module';

@Module({
  imports: [ConfiguratorModule, HealthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
