import { vi } from 'vitest';
export const executeDot = vi.fn().mockImplementation(async (dot: string) => Buffer.from(dot));
