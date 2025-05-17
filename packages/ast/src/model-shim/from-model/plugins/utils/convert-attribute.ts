import type { Attribute, AttributeKey } from '@ts-graphviz/common';
import { createElement } from '../../../../builder/create-element.js';
import type { AttributeASTNode } from '../../../../types.js';

export function convertAttribute<K extends AttributeKey>(
  key: K,
  value: Attribute<K>,
): AttributeASTNode {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    const isHTMLLike = /^<.+>$/ms.test(trimmed);
    if (isHTMLLike) {
      return createElement(
        'Attribute',
        {
          key: createElement('Literal', { value: key, quoted: false }, []),
          value: createElement(
            'Literal',
            { value: trimmed, quoted: 'html' },
            [],
          ),
        },
        [],
      );
    }
    return createElement(
      'Attribute',
      {
        key: createElement('Literal', { value: key, quoted: false }, []),
        value: createElement('Literal', { value: value, quoted: true }, []),
      },
      [],
    );
  }
  return createElement(
    'Attribute',
    {
      key: createElement('Literal', { value: key, quoted: false }, []),
      value: createElement(
        'Literal',
        { value: String(value), quoted: false },
        [],
      ),
    },
    [],
  );
}
