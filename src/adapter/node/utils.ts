import { pipeline as _pipeline } from 'node:stream';
import { promisify } from 'node:util';

/**
 * NOTE:
 * The node:stream/promises standard module is not provided in Node 14.
 * Fix Node 14 to use node:stream/promises after LTS ends.
 */
export const pipeline = promisify(_pipeline);
