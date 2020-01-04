// tslint:disable: no-namespace

/**
 * Root cluster type.
 *
 * @description
 * digraph" if you want to use a directional graph.
 *
 * "graph" if you want to use an omnidirectional graph.
 */
export type RootClusterType = 'digraph' | 'graph';
export namespace RootClusterType {
  /**
   * A directional graph type.
   */
  export const digraph: RootClusterType = 'digraph';
  /**
   * An omnidirectional graph type.
   */
  export const graph: RootClusterType = 'graph';
}

/**
 * All of cluster type.
 * @description
 * If you want a hierarchy, use "subgraph".
 */
export type ClusterType = RootClusterType | 'subgraph';
export namespace ClusterType {
  /**
   * A directional graph type.
   */
  export const digraph: ClusterType = 'digraph';
  /**
   * An omnidirectional graph type.
   */
  export const graph: ClusterType = 'graph';
  /**
   * Graph that is not Root cluster.
   *
   * Represents the hierarchy of a graph.
   */
  export const subgraph: ClusterType = 'subgraph';
}

/**
 * Directive indicating which direction the Edge should point.
 */
export type Compass = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw' | 'c';
export namespace Compass {
  /** Upper part */
  export const n: Compass = 'n';
  /** Upper left */
  export const ne: Compass = 'ne';
  /** Left part */
  export const e: Compass = 'e';
  /** Lower left */
  export const se: Compass = 'se';
  /** Lower part */
  export const s: Compass = 's';
  /** Lower right */
  export const sw: Compass = 'sw';
  /** Right part */
  export const w: Compass = 'w';
  /** Upper right */
  export const nw: Compass = 'nw';
  /** Center */
  export const c: Compass = 'c';
  export const all: ReadonlyArray<string> = [n, ne, e, se, s, sw, w, nw, c];
}

/**
 * Determine whether the character string satisfies the Compass condition.
 */
export function isCompass(str: string): str is Compass {
  return Compass.all.includes(str);
}
