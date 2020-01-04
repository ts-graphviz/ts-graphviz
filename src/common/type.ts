// tslint:disable: no-namespace

export type RootClusterType = 'digraph' | 'graph';
export namespace RootClusterType {
  export const digraph: RootClusterType = 'digraph';
  export const graph: RootClusterType = 'graph';
}

export type ClusterType = RootClusterType | 'subgraph';
export namespace ClusterType {
  export const digraph: ClusterType = 'digraph';
  export const graph: ClusterType = 'graph';
  export const subgraph: ClusterType = 'subgraph';
}

export type Compass = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw' | 'c';
export namespace Compass {
  export const n: Compass = 'n';
  export const ne: Compass = 'ne';
  export const e: Compass = 'e';
  export const se: Compass = 'se';
  export const s: Compass = 's';
  export const sw: Compass = 'sw';
  export const w: Compass = 'w';
  export const nw: Compass = 'nw';
  export const c: Compass = 'c';
  export const all: string[] = [n, ne, e, se, s, sw, w, nw, c];
}

export function isCompass(str: string): str is Compass {
  return Compass.all.includes(str);
}
