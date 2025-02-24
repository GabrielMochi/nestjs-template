import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { ConfiguratorModule } from './infrastructure/modules/configurator.module';

@Module({
  imports: [
    ConfiguratorModule,
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
        transport: process.env.NODE_ENV !== 'production' ? { target: 'pino-pretty' } : undefined,
      },
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
