import { Module } from '@nestjs/common';
import { ConfiguratorModule } from './infrastructure/modules/configurator.module';
import { PinoLoggerModule } from './infrastructure/modules/pino-logger.module';

@Module({
  imports: [ConfiguratorModule, PinoLoggerModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
