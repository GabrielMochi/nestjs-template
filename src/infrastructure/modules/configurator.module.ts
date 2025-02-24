import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import processConfig from '../config/process/process.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [processConfig],
    }),
  ],
  exports: [ConfigModule],
})
export class ConfiguratorModule {}
