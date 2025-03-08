import { Module } from '@nestjs/common';
import { ConfigModule as NestjsCongigModule } from '@nestjs/config';
import processConfig from './process/process.config';

@Module({
  imports: [
    NestjsCongigModule.forRoot({
      load: [processConfig],
    }),
  ],
  exports: [NestjsCongigModule],
})
export class ConfigModule {}
