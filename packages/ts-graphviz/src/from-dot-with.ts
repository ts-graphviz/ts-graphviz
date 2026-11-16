import {
  type ASTToModel,
  type ParseOptions,
  parse,
  type Rule,
  type ToModelConvertableASTNode,
  toModel,
} from '@ts-graphviz/ast';
import * as legacy from '@ts-graphviz/ast/legacy';
import {
  type EdgeModel,
  isDotModel,
  type ModelClasses,
  type ModelKit,
  type NodeModel,
  ownOptions,
  type RootGraphModel,
  type SubgraphModel,
  withCode,
} from '@ts-graphviz/common';
import { type DSL, dsl } from './dsl.js';
import type { FromDotOptions, FromDotRule } from './from-dot.js';
import { isLegacyKit } from './legacy-kit.js';

type AnyFromDotModel = RootGraphModel | NodeModel | EdgeModel | SubgraphModel;

type ConvertOptions = NonNullable<
  FromDotOptions<FromDotRule, Partial<ModelClasses>, boolean>['convert']
>;

/** The conversion of the kit: as 3.x had it for a kit of `ts-graphviz/legacy`. */
function convert<T extends ToModelConvertableASTNode>(
  ast: T,
  options: ConvertOptions,
  kit: ModelKit,
): ASTToModel<T> {
  const convertOptions = { ...ownOptions(options), models: kit };
  return isLegacyKit(kit)
    ? legacy.toModel(ast, convertOptions)
    : toModel(ast, convertOptions);
}

/** `fromDot` with the kit; `own` holds own properties only. */
export function fromDotWith(
  dot: string,
  own: FromDotOptions<FromDotRule, Partial<ModelClasses>, boolean>,
  kit: ModelKit,
): AnyFromDotModel | DSL<AnyFromDotModel> {
  const model = read(dot, own, kit);
  return own.dsl === true ? dsl(model, kit) : model;
}

/** `fromDotAll` with the kit; `own` holds own properties only. */
export function fromDotAllWith(
  dot: string,
  own: Omit<FromDotOptions<'Dot', Partial<ModelClasses>, boolean>, 'parse'> & {
    parse?: object;
  },
  kit: ModelKit,
): (RootGraphModel | DSL<RootGraphModel>)[] {
  const ast = parse(dot, { ...ownOptions(own.parse), as: 'Dot' });
  const model = convert(ast, ownOptions(own.convert), kit);
  return own.dsl === true
    ? model.graphs.map((graph) => dsl(graph, kit))
    : [...model.graphs];
}

function read(
  dot: string,
  own: FromDotOptions<FromDotRule, Partial<ModelClasses>, boolean>,
  kit: ModelKit,
): AnyFromDotModel {
  // `as` picks what fromDot returns. Widened to every rule on
  // purpose: JavaScript callers can pass any.
  const ast = parse(dot, ownOptions(own.parse) as ParseOptions<Rule>);

  if (
    Array.isArray(ast) ||
    ast.type === 'Attribute' ||
    ast.type === 'AttributeList'
  ) {
    throw withCode(
      new TypeError(
        `fromDot cannot convert a "${Array.isArray(ast) ? 'ClusterStatements' : ast.type}" node to a model`,
      ),
      'TSG_ERR_UNCONVERTIBLE_AST',
    );
  }
  const model = convert(ast, ownOptions(own.convert), kit);
  if (isDotModel(model)) {
    // A whole DOT source converts to a Dot model; fromDot returns its graph.
    const [graph, ...more] = model.graphs;
    if (!graph) {
      throw withCode(
        new Error('fromDot: the DOT source contains no graph'),
        'TSG_ERR_NO_GRAPH',
      );
    }
    if (more.length > 0) {
      throw withCode(
        new Error(
          `fromDot: the DOT source contains ${model.graphs.length} graphs; read them all with fromDotAll`,
        ),
        'TSG_ERR_MULTIPLE_GRAPHS',
      );
    }
    return graph;
  }
  return model;
}
