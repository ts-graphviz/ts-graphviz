import { Model } from './common/index.js';
import { stringify, fromModel } from './ast/index.js';

export function toDot<Dot extends Model>(model: Dot): string {
  const ast = fromModel(model);
  return stringify(ast);
}
