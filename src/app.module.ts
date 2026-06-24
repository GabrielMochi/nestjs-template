import { Module } from '@nestjs/common';
import { ConfigModule } from '@infrastructure/config/config.module';
import { HealthModule } from '@presentation/http/controllers/health/health.module';
import { SherlockModule } from '@presentation/http/controllers/sherlock/sherlock.module';

@Module({
  imports: [ConfigModule, HealthModule, SherlockModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
