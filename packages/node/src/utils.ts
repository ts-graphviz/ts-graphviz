import cp from 'child_process';
import util from 'util';
import fs from 'fs';

export const close = util.promisify(fs.close);
export const writeFile = util.promisify(fs.writeFile);
export const execFile = util.promisify(cp.execFile);
