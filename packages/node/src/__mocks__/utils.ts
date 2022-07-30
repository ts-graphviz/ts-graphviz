import { vi } from 'vitest';
export const close = vi.fn().mockReturnValue(undefined);
export const writeFile = vi.fn().mockReturnValue(undefined);
export const execFile = vi.fn().mockReturnValue({
  stdout: Buffer.from([]),
});
