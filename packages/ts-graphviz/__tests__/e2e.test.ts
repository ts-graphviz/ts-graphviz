import { expect, test } from 'vitest';
import fs from 'fs';
import path from 'node:path';
import glob from 'glob';

import { parse, SyntaxError } from '../src/parser/index.js';

const files = glob.sync(`${__dirname}/e2e/*`).sort();

for (const file of files) {
  const title = path.basename(file);
  const dot = fs.readFileSync(file, 'utf-8').toString();

  test(title, () => {
    try {
      expect(parse(dot)).toMatchSnapshot();
    } catch (e) {
      if (e instanceof SyntaxError) {
        // eslint-disable-next-line no-console
        console.log(e.location);
      }
      throw e;
    }
  });
}
