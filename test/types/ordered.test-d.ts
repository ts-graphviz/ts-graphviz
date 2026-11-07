import type * as main from 'ts-graphviz';
import type * as ordered from 'ts-graphviz/ordered';
import { expectTypeOf, it } from 'vitest';

// ts-graphviz/ordered has the API of ts-graphviz; only the classes it
// creates differ. (`pnpm api:check` compares the built declarations too.)
it('exports the values of ts-graphviz with the same types', () => {
  expectTypeOf<typeof ordered>().toEqualTypeOf<typeof main>();
});
