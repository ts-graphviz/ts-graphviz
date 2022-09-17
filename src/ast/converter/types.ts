import { DotObjectModel } from '../../common/index.js';
import { ModelToAST, CommentKind } from '../types.js';

export interface ConvertOptions {
  commentKind?: CommentKind;
}

export interface ConvertContext extends Required<ConvertOptions> {
  convert<T extends DotObjectModel>(model: T): ModelToAST<T>;
}

export interface ConvertPlugin<T extends DotObjectModel> {
  match(model: T): boolean;
  convert(context: ConvertContext, model: T): ModelToAST<T>;
}
