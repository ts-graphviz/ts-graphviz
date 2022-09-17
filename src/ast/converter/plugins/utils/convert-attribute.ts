import { AttributeKey, Attribute } from '../../../../common/index.js';
import { createElement } from '../../../create-element.js';
import { AttributeASTNode } from '../../../types.js';

export function convertAttribute<K extends AttributeKey>(key: K, value: Attribute<K>): AttributeASTNode {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    const isHTMLLike = /^<.+>$/ms.test(trimmed);
    if (isHTMLLike) {
      return createElement(
        'Attribute',
        {
          key: createElement('Literal', { value: key, quoted: false }, []),
          value: createElement('Literal', { value: trimmed.slice(1, trimmed.length - 1), quoted: 'html' }, []),
        },
        [],
      );
    } else {
      return createElement(
        'Attribute',
        {
          key: createElement('Literal', { value: key, quoted: false }, []),
          value: createElement('Literal', { value: value, quoted: true }, []),
        },
        [],
      );
    }
  }
  return createElement(
    'Attribute',
    {
      key: createElement('Literal', { value: key, quoted: false }, []),
      value: createElement('Literal', { value: String(value), quoted: false }, []),
    },
    [],
  );
}
