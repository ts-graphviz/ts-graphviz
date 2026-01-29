import { describe, expect, it } from 'vitest';
import { toFile, toStream } from './browser.js';

describe('browser adapter', () => {
  it('toStream throws error with correct message', () => {
    expect(() => toStream('dot', {})).toThrowErrorMatchingInlineSnapshot(
      `[Error: @ts-graphviz/adapter cannot be used in browser environments.

This package requires Graphviz executables which are not available in browsers.

For browser-based Graphviz rendering, consider these alternatives:
- @hpcc-js/wasm-graphviz - WebAssembly-based Graphviz for browsers
- viz.js - JavaScript port of Graphviz

Learn more: https://github.com/ts-graphviz/ts-graphviz#rendering-in-browsers]`,
    );
  });

  it('toFile throws error with correct message', () => {
    expect(() => toFile('dot', 'path', {})).toThrowErrorMatchingInlineSnapshot(
      `[Error: @ts-graphviz/adapter cannot be used in browser environments.

This package requires Graphviz executables which are not available in browsers.

For browser-based Graphviz rendering, consider these alternatives:
- @hpcc-js/wasm-graphviz - WebAssembly-based Graphviz for browsers
- viz.js - JavaScript port of Graphviz

Learn more: https://github.com/ts-graphviz/ts-graphviz#rendering-in-browsers]`,
    );
  });
});
