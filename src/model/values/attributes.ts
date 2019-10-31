type GraphObjectType = 'edge' | 'node' | 'graph' | 'cluster';

abstract class Attributes {
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

export class GraphAttributes extends Attributes {
  public type: GraphObjectType = 'graph';
  public toDot(): string {
    if (this.size === 0) {
      return '';
    }
    return '';
  };

}

export class EdgeAttributes extends Attributes {
  public type: GraphObjectType = 'edge';
  public toDot(): string {
    if (this.size === 0) {
      return '';
    }
    return '';
  };
}

export class NodeAttributes extends Attributes {
  public type: GraphObjectType = 'node';
  public toDot(): string {
    if (this.size === 0) {
      return '';
    }
    return '';
  };
}

export class ClusterAttributes extends Attributes {
  public type: GraphObjectType = 'cluster';
  public toDot(): string {
    if (this.size === 0) {
      return '';
    }
    return '';
  };
}
