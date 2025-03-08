import { Module } from '@nestjs/common';
import { ConfigModule } from '@infrastructure/config/config.module';
import { HealthModule } from '@interfaces/http/controllers/health/health.module';

@Module({
  imports: [ConfigModule, HealthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
