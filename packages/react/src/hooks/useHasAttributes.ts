import { useLayoutEffect } from 'react';
import type {
  AttributeKey,
  AttributesObject,
  HasAttributes,
} from 'ts-graphviz';

export function useHasAttributes<T extends AttributeKey>(
  target: HasAttributes<T>,
  attributes: AttributesObject<T>,
): void {
  useLayoutEffect(() => {
    target.attributes.clear();
    target.attributes.apply(attributes);
  }, [target, attributes]);
}
