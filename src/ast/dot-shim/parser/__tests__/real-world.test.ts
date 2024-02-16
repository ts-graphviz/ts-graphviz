/* eslint-disable jest/valid-title */
import fs from 'node:fs';
import path from 'node:path';
import glob from 'glob';
import 'jest-specific-snapshot';

import { DotSyntaxError, parse } from '../_parse.js';

const dirname = path.dirname(new URL(import.meta.url).pathname);

const files = glob.sync(`${dirname}/dot/*`).sort();

for (const file of files) {
  const title = path.basename(file);
  const dot = fs.readFileSync(file, 'utf-8').toString();
  const snapshot = path.resolve(dirname, 'ast', title);

  test(title, () => {
    try {
      expect(parse(dot)).toMatchSpecificSnapshot(snapshot);
    } catch (e) {
      if (e instanceof DotSyntaxError) {
        console.log(e.location);
      }
      throw e;
    }
  });
}
