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
  type ModelClasses,
  type ModelKit,
  type ModelTypes,
  type NodeModel,
  ownOptions,
  type ResolvedModelTypes,
  type RootGraphModel,
  type SubgraphModel,
  withCode,
} from '@ts-graphviz/common';
import { createModelKit } from '@ts-graphviz/core';
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
 * model, or its DOT DSL when the option `dsl` is `true` (`D`). The DSL
 * creates with the kit of the classes the models were created from (`M`).
 * @group Convert DOT to Model
 */
export type FromDotResult<
  T extends AnyDotObjectModel,
  D extends boolean,
  M extends ModelTypes = ModelTypes,
> = D extends true ? DSL<T, M> : T;

/**
 * Options for converting DOT to a model: the rule `T` to parse, the
 * classes `P` to create the models from, and whether to return the DOT
 * DSL (`D`; `dsl: true` is required when it is `true`).
 * @group Convert DOT to Model
 */
export type FromDotOptions<
  T extends FromDotRule,
  P extends Partial<ModelClasses> = Partial<ModelClasses>,
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
   * `true` to return the DOT DSL of the model in place of the model: the
   * one {@link dsl} gives with the kit of `convert.models`.
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
  const P extends Partial<ModelClasses>,
  const D extends boolean = false,
>(
  dot: string,
  options: FromDotOptions<'Dot' | 'Graph', P, D> & {
    convert: { models: P };
  },
): FromDotResult<
  ResolvedModelTypes<P>['Graph'] | ResolvedModelTypes<P>['Digraph'],
  D,
  ResolvedModelTypes<P>
>;
export function fromDot<
  const P extends Partial<ModelClasses>,
  const R extends FromDotRule,
  const D extends boolean = false,
>(
  dot: string,
  options: FromDotOptions<R, P, D> & {
    convert: { models: P };
  },
): FromDotResult<
  FromDotModel<R, ResolvedModelTypes<P>>,
  D,
  ResolvedModelTypes<P>
>;
export function fromDot(
  dot: string,
  options?: FromDotOptions<'Dot' | 'Graph'>,
): RootGraphModel;
export function fromDot<const D extends boolean>(
  dot: string,
  options: FromDotOptions<'Dot' | 'Graph', Partial<ModelClasses>, D>,
): FromDotResult<RootGraphModel, D>;
export function fromDot<
  const R extends FromDotRule,
  const D extends boolean = false,
>(
  dot: string,
  options: FromDotOptions<R, Partial<ModelClasses>, D>,
): FromDotResult<FromDotModel<R>, D>;
export function fromDot(
  dot: string,
  options?: FromDotOptions<FromDotRule, Partial<ModelClasses>, boolean>,
): AnyFromDotModel | DSL<AnyFromDotModel> {
  // Own properties only: an inherited one is never an option.
  const own = ownOptions(options);
  const kit = createModelKit(ownOptions(own.convert).models);
  const model = read(dot, own, kit);
  return own.dsl === true ? dsl(model, kit) : model;
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
  const model = toModel(ast, { ...ownOptions(own.convert), models: kit });
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
  const P extends Partial<ModelClasses>,
  const D extends boolean = false,
>(
  dot: string,
  options: Omit<FromDotOptions<'Dot', P, D>, 'parse'> & {
    parse?: CommonParseOptions;
    convert: { models: P };
  },
): FromDotResult<
  ResolvedModelTypes<P>['Graph'] | ResolvedModelTypes<P>['Digraph'],
  D,
  ResolvedModelTypes<P>
>[];
export function fromDotAll(
  dot: string,
  options?: Omit<FromDotOptions<'Dot'>, 'parse'> & {
    parse?: CommonParseOptions;
  },
): RootGraphModel[];
export function fromDotAll<const D extends boolean>(
  dot: string,
  options: Omit<FromDotOptions<'Dot', Partial<ModelClasses>, D>, 'parse'> & {
    parse?: CommonParseOptions;
  },
): FromDotResult<RootGraphModel, D>[];
export function fromDotAll(
  dot: string,
  options?: Omit<
    FromDotOptions<'Dot', Partial<ModelClasses>, boolean>,
    'parse'
  > & {
    parse?: CommonParseOptions;
  },
): (RootGraphModel | DSL<RootGraphModel>)[] {
  // Own properties only: an inherited one is never an option.
  const own = ownOptions(options);
  const ast = parse(dot, { ...ownOptions(own.parse), as: 'Dot' });
  const convert = ownOptions(own.convert);
  const kit = createModelKit(convert.models);
  const model = toModel(ast, { ...convert, models: kit });
  return own.dsl === true
    ? model.graphs.map((graph) => dsl(graph, kit))
    : [...model.graphs];
}
