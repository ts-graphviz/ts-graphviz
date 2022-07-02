import { AttributeKey } from '@ts-graphviz/dot-attribute';
import { useEffect } from 'react';
import { HasAttributes, AttributesObject } from '@ts-graphviz/model';

export function useHasAttributes<T extends AttributeKey>(
  target: HasAttributes<T>,
  attributes: AttributesObject<T>,
): void {
  useEffect(() => {
    target.attributes.clear();
    target.attributes.apply(attributes);
  }, [target, attributes]);
}
