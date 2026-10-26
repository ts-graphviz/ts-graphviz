import { Builder } from './builder.js';
import type { BuilderOptions, CreateElement } from './types.js';

/**
 * Create a factory that returns a fresh {@link CreateElement} function
 * backed by its own {@link Builder} instance (and thus its own node counter).
 *
 * @param options - Optional builder options (e.g. `maxASTNodes`)
 * @group Create AST
 * @returns A new {@link CreateElement} function
 */
export function createElementFactory(
  options?: Partial<Pick<BuilderOptions, 'maxASTNodes'>>,
): CreateElement {
  const builder = new Builder(options);
  return builder.createElement.bind(builder);
}

/**
 * Create an {@link ASTNode} of the specified type
 *
 * This shared function does not count the nodes it creates (a count shared
 * by every caller in the process would eventually refuse all of them). Use
 * {@link createElementFactory} for a counted, limited builder.
 *
 * @param type - Type of the {@link ASTNode}
 * @param props - Properties of the {@link ASTNode}
 * @param children - Children of the {@link ASTNode}
 * @group Create AST
 * @returns An {@link ASTNode}
 */
export const createElement: CreateElement = createElementFactory({
  maxASTNodes: 0,
});
