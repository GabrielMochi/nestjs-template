import { registerAs } from '@nestjs/config';
import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import { join } from 'path';
import { z } from 'zod';

const YAML_CONFIG_FILENAME = 'process.config.yaml';

const processConfigSchema = z.object({
  env: z.enum(['development', 'production', 'test']),
  port: z.number(),
});

export type ProcessConfig = z.infer<typeof processConfigSchema>;

export default registerAs('process', () => {
  const config = yaml.load(readFileSync(join(__dirname, YAML_CONFIG_FILENAME), 'utf8'));
  return processConfigSchema.parse(config);
});
