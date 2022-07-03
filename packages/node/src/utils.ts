import cp from 'node:child_process';
import util from 'node:util';
import fs from 'node:fs';

export const close = util.promisify(fs.close);
export const writeFile = util.promisify(fs.writeFile);
export const execFile = util.promisify(cp.execFile);
