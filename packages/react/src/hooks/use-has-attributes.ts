import { useEffect } from 'react';
import { IHasAttributes, AttributesObject } from 'ts-graphviz';

export const useHasAttributes = <T extends string>(target: IHasAttributes<T>, attributes: AttributesObject<T>): void =>
  useEffect(() => {
    target.attributes.clear();
    target.attributes.apply(attributes);
  }, [target, attributes]);
