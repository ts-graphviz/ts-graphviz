import { test } from 'vitest';
import { expectType } from 'vite-plugin-vitest-typescript-assert/tsd';
import { Compass } from '../src/index.js';

test.each<Compass>(['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw', 'c', '_'])('Compass', (compass) => {
  expectType<Compass>(compass);
});
