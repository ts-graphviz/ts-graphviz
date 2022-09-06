import { Model } from '../../common/index.js';
import { ModelToAST, CommentKind } from '../types.js';

export interface ConvertOptions {
  commentKind?: CommentKind;
}

export interface ConvertContext extends Required<ConvertOptions> {
  convert<T extends Model>(model: T): ModelToAST<T>;
}

export interface ConvertPlugin<T extends Model> {
  match(model: T): boolean;
  convert(context: ConvertContext, model: T): ModelToAST<T>;
}
