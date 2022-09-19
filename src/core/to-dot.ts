import { DotObjectModel } from '#lib/common';
import { stringify, fromModel } from '#lib/ast';

export function toDot(model: DotObjectModel): string {
  const ast = fromModel(model);
  return stringify(ast);
}
