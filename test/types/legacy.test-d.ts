import type * as main from 'ts-graphviz';
import type * as legacy from 'ts-graphviz/legacy';
import { expectTypeOf, it } from 'vitest';

// ts-graphviz/legacy has the API of ts-graphviz; only the classes it
// creates differ. (`pnpm api:check` compares the built declarations too.)
it('exports the values of ts-graphviz with the same types', () => {
  expectTypeOf<typeof legacy>().toEqualTypeOf<typeof main>();
});
