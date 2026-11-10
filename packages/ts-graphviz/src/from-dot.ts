import {
  type CommonParseOptions,
  type ConvertToModelOptions,
  type ParseOptions,
  parse,
  type Rule,
  toModel,
} from '@ts-graphviz/ast';
import {
  type AnyDotObjectModel,
  type EdgeModel,
  isDotModel,
  type ModelsContext,
  type ModelTypes,
  type NodeModel,
  ownOptions,
  type ResolvedModelTypes,
  type RootGraphModel,
  type SubgraphModel,
  withCode,
} from '@ts-graphviz/common';
import { createModelsContext } from '@ts-graphviz/core';
import { type DSL, dsl } from './dsl.js';

/**
 * The rules (`parse.as`) {@link fromDot} can convert to a model.
 * @group Convert DOT to Model
 */
export type FromDotRule = 'Dot' | 'Graph' | 'Node' | 'Edge' | 'Subgraph';

/**
 * What {@link fromDot} returns for a rule (`parse.as`), with the model classes
 * `M`. For a union of rules, it is the union of their models.
 * @group Convert DOT to Model
 */
export type FromDotModel<
  R extends FromDotRule,
  M extends ModelTypes = ModelTypes,
> = R extends 'Dot' | 'Graph'
  ? M['Graph'] | M['Digraph']
  : R extends 'Node'
    ? M['Node']
    : R extends 'Edge'
      ? M['Edge']
      : M['Subgraph'];

type AnyFromDotModel = RootGraphModel | NodeModel | EdgeModel | SubgraphModel;

/**
 * What {@link fromDot} and {@link fromDotAll} return for a model `T`: the
 * model, or its DOT DSL when the option `dsl` is `true` (`D`).
 * @group Convert DOT to Model
 */
export type FromDotResult<
  T extends AnyDotObjectModel,
  D extends boolean,
> = D extends true ? DSL<T> : T;

/**
 * Options for converting DOT to a model: the rule `T` to parse, the
 * classes `P` to create the models from, and whether to return the DOT
 * DSL (`D`; `dsl: true` is required when it is `true`).
 * @group Convert DOT to Model
 */
export type FromDotOptions<
  T extends FromDotRule,
  P extends Partial<ModelsContext> = Partial<ModelsContext>,
  D extends boolean = false,
> = {
  /**
   * Options for parsing DOT.
   */
  parse?: ParseOptions<T>;
  /**
   * Options for converting the parsed DOT to a model.
   */
  convert?: Omit<ConvertToModelOptions, 'models'> & {
    /**
     * Classes to create the models from; the ones left out default to the
     * classes of `@ts-graphviz/core`. The result is typed by them.
     */
    models?: P;
  };
  /**
   * `true` to return the DOT DSL of the model, as {@link dsl} gives it,
   * in place of the model.
   *
   * ```ts
   * const G = fromDot('digraph { a }', { dsl: true });
   * G.node('a').label = 'A';
   * ```
   * @defaultValue `false`
   */
  dsl?: D;
} & (D extends true ? { dsl: true } : unknown);

/**
 * fromDot is a function that converts a DOT string to a model.
 *
 * @group Convert DOT to Model
 *
 * @param dot The DOT string to convert.
 * @param options Options for converting the DOT string to a model.
 * @returns A model of type {@link RootGraphModel}, {@link NodeModel}, {@link EdgeModel}, or {@link SubgraphModel},
 * depending on the type specified in the options.
 * With `dsl: true`, its DOT DSL.
 */
export function fromDot<
  const P extends Partial<ModelsContext>,
  const D extends boolean = false,
>(
  dot: string,
  options: FromDotOptions<'Dot' | 'Graph', P, D> & {
    convert: { models: P };
  },
): FromDotResult<
  ResolvedModelTypes<P>['Graph'] | ResolvedModelTypes<P>['Digraph'],
  D
>;
export function fromDot<
  const P extends Partial<ModelsContext>,
  const R extends FromDotRule,
  const D extends boolean = false,
>(
  dot: string,
  options: FromDotOptions<R, P, D> & {
    convert: { models: P };
  },
): FromDotResult<FromDotModel<R, ResolvedModelTypes<P>>, D>;
export function fromDot(
  dot: string,
  options?: FromDotOptions<'Dot' | 'Graph'>,
): RootGraphModel;
export function fromDot<const D extends boolean>(
  dot: string,
  options: FromDotOptions<'Dot' | 'Graph', Partial<ModelsContext>, D>,
): FromDotResult<RootGraphModel, D>;
export function fromDot<
  const R extends FromDotRule,
  const D extends boolean = false,
>(
  dot: string,
  options: FromDotOptions<R, Partial<ModelsContext>, D>,
): FromDotResult<FromDotModel<R>, D>;
export function fromDot(
  dot: string,
  options?: FromDotOptions<FromDotRule, Partial<ModelsContext>, boolean>,
): AnyFromDotModel | DSL<AnyFromDotModel> {
  // Own properties only: an inherited one is never an option (#1757).
  const own = ownOptions(options);
  const model = read(dot, own);
  return own.dsl === true ? dsl(model) : model;
}

function read(
  dot: string,
  own: FromDotOptions<FromDotRule, Partial<ModelsContext>, boolean>,
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
  const convert = ownOptions(own.convert);
  const model = toModel(ast, {
    ...convert,
    models: createModelsContext(convert.models),
  });
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

/**
 * Convert a DOT source to models of all the graphs in it, in order. A DOT
 * source may hold any number of graphs (Graphviz renders each); `fromDot`
 * reads exactly one.
 *
 * @group Convert DOT to Model
 *
 * @param dot The DOT source to convert.
 * @param options Parser limits and conversion options.
 * @returns The graphs, possibly none; with `dsl: true`, their DOT DSLs.
 */
export function fromDotAll<
  const P extends Partial<ModelsContext>,
  const D extends boolean = false,
>(
  dot: string,
  options: Omit<FromDotOptions<'Dot', P, D>, 'parse'> & {
    parse?: CommonParseOptions;
    convert: { models: P };
  },
): FromDotResult<
  ResolvedModelTypes<P>['Graph'] | ResolvedModelTypes<P>['Digraph'],
  D
>[];
export function fromDotAll(
  dot: string,
  options?: Omit<FromDotOptions<'Dot'>, 'parse'> & {
    parse?: CommonParseOptions;
  },
): RootGraphModel[];
export function fromDotAll<const D extends boolean>(
  dot: string,
  options: Omit<FromDotOptions<'Dot', Partial<ModelsContext>, D>, 'parse'> & {
    parse?: CommonParseOptions;
  },
): FromDotResult<RootGraphModel, D>[];
export function fromDotAll(
  dot: string,
  options?: Omit<
    FromDotOptions<'Dot', Partial<ModelsContext>, boolean>,
    'parse'
  > & {
    parse?: CommonParseOptions;
  },
): (RootGraphModel | DSL<RootGraphModel>)[] {
  // Own properties only: an inherited one is never an option (#1757).
  const own = ownOptions(options);
  const ast = parse(dot, { ...ownOptions(own.parse), as: 'Dot' });
  const convert = ownOptions(own.convert);
  const model = toModel(ast, {
    ...convert,
    models: createModelsContext(convert.models),
  });
  return own.dsl === true
    ? model.graphs.map((graph) => dsl(graph))
    : [...model.graphs];
}
