import { transform } from 'sucrase';

/**
 * Turn a Playground script (TypeScript with ES module syntax) into
 * JavaScript that {@link evaluate} can run: types are stripped and
 * `import`/`export` become CommonJS `require`/`exports`.
 *
 * Only syntax is transformed; nothing is type checked (the editor does that).
 * The last expression statement stays last, so its value is still the
 * script's completion value.
 */
export function transpile(source: string): string {
  const { code } = transform(source, {
    transforms: ['typescript', 'imports'],
    production: true,
  });
  // The imports transform prepends a "use strict" directive. As an
  // expression statement it would be the completion value of a script that
  // ends in a declaration, and read as DOT. The code is strict anyway: a
  // direct eval inherits strict mode from evaluate.ts, an ES module.
  return code.replace(/^"use strict";/, '');
}
