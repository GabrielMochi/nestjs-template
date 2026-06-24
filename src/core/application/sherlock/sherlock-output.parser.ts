import type { SherlockCacheableEvent } from './sherlock-events';

const MESSAGE_PREFIX = '[*] ';
const FOUND_PATTERN = /^\[\+\] ([^:]+): (https?:\/\/.+)$/;

export function parseSherlockLine(line: string): SherlockCacheableEvent | null {
  const trimmedLine = line.trim();

  if (trimmedLine.startsWith(MESSAGE_PREFIX)) {
    return { type: 'message', message: trimmedLine.slice(MESSAGE_PREFIX.length) };
  }

  const found = FOUND_PATTERN.exec(trimmedLine);
  if (found === null) {
    return null;
  }

  return { type: 'found', site: found[1], url: found[2] };
}
