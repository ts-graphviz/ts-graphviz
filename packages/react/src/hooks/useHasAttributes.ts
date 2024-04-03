import { useEffect } from 'react';
import type {
  AttributeKey,
  AttributesObject,
  HasAttributes,
} from 'ts-graphviz';

/**
 * Applies the given attributes to the target object and clears any existing attributes.
 * @param target - The target object that has attributes.
 * @param attributes - The attributes to apply to the target object.
 * @typeParam T - The type of attribute keys.
 * @public
 */
export function useHasAttributes<T extends AttributeKey>(
  target: HasAttributes<T>,
  attributes: AttributesObject<T>,
): void {
  useEffect(() => {
    target.attributes.clear();
    target.attributes.apply(attributes);
  }, [target, attributes]);
}
