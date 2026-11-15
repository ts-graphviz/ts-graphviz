import { describe, expect, it } from 'vitest';
import { createElement } from '../../builder/create-element.js';
import type { ASTNode } from '../../types.js';
import { Printer } from './printer.js';

// A node no printer plugin matches: only a hand-built AST, outside the
// types, can hold one.
const unknown = { type: 'Unknown', children: [] } as unknown as ASTNode;

describe('Printer without a plugin for a node', { tags: ['SM-5'] }, () => {
  it('throws TSG_ERR_NO_PLUGIN for the root', () => {
    expect(() => new Printer().print(unknown)).toThrow(
      expect.objectContaining({ name: 'Error', code: 'TSG_ERR_NO_PLUGIN' }),
    );
  });

  it('throws TSG_ERR_NO_PLUGIN for a nested node', () => {
    const graph = createElement('Graph', { strict: false, directed: true }, [
      unknown as never,
    ]);
    expect(() => new Printer().print(graph)).toThrow(
      expect.objectContaining({ code: 'TSG_ERR_NO_PLUGIN' }),
    );
  });
});

describe('Printer with trailing comments', { tags: ['SM-2'] }, () => {
  const comment = (value: string, kind: 'Block' | 'Macro' | 'Slash') =>
    createElement('Comment', { value, kind }, []);

  it('writes a line comment followed by another one, dangling ones included, as a block', () => {
    const node = createElement(
      'Node',
      { id: createElement('Literal', { value: 'a', kind: 'bare' }, []) },
      [],
    );
    Object.assign(node, {
      trailingComments: [comment('x', 'Macro')],
      danglingComments: [comment('y', 'Slash'), comment('z', 'Slash')],
    });
    expect(new Printer().print(node)).toBe('a; /* x */ /* y */ // z\n');
  });
});
