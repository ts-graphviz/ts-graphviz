import { type ReactElement, useMemo } from 'react';
import { renderId } from '../renderId.js';

/**
 * Returns the rendered ID based on the provided React element or string.
 * @param id - The React element or string representing the ID.
 * @returns The rendered ID as a string, or undefined if no ID is provided.
 * @public
 */
export function useRenderedID(id?: ReactElement | string): string | undefined {
  return useMemo(() => renderId(id), [id]);
}
