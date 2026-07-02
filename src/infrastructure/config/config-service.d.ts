import type { Path, PathValue } from '@nestjs/config';
import type { RootConfig } from './config.type';

declare module '@nestjs/config' {
  interface ConfigService {
    get<P extends Path<RootConfig>>(propertyPath: P): PathValue<RootConfig, P> | undefined;
    getOrThrow<P extends Path<RootConfig>>(
      propertyPath: P,
    ): Exclude<PathValue<RootConfig, P>, undefined>;
  }
}
