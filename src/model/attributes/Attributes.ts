export type GraphObjectType = 'edge' | 'node' | 'graph' | 'cluster' | 'subgraph';

export abstract class Attributes {
  public abstract type: GraphObjectType;
  protected attrs: Map<string, any> = new Map();
  get size(): number {
    return this.attrs.size;
  }
  public get(key: string) {
    return this.attrs.get(key);
  }
  public set(key: string, value: string) {
    return this.attrs.set(key, value);
  }
  public abstract toDot(): string;
}
