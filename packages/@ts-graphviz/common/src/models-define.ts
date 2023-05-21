/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Model,
  AttributeListModel,
  EdgeModel,
  NodeModel,
  RootGraphModel,
  SubgraphModel,
  setASTType,
  setAttributeListKind,
  setIsDirected,
} from './models.js';
import { AttributeListKind } from './models.js';

interface DefineGraphOptions {
  type: 'Graph';
  directed: boolean;
}

interface DefineSubgraphOptions {
  type: 'Subgraph';
}

interface DefineNodeOptions {
  type: 'Node';
}
interface DefineEdgeOptions {
  type: 'Edge';
}

interface DefineAttributeListOptions {
  type: 'AttributeList';
  kind: AttributeListKind;
}

type DefineOptions =
  | DefineGraphOptions
  | DefineSubgraphOptions
  | DefineNodeOptions
  | DefineEdgeOptions
  | DefineAttributeListOptions;

export function define(options: DefineGraphOptions): (target: RootGraphModel.Constructor, ...args: any[]) => void;
export function define(options: DefineSubgraphOptions): (target: SubgraphModel.Constructor, ...args: any[]) => void;
export function define(options: DefineEdgeOptions): (target: EdgeModel.Constructor, ...args: any[]) => void;
export function define(options: DefineNodeOptions): (target: NodeModel.Constructor, ...args: any[]) => void;
export function define(
  options: DefineAttributeListOptions,
): (target: AttributeListModel.Constructor, ...args: any[]) => void;
export function define(options: DefineOptions): any {
  return <T extends Model.Constractor>(target: T, context: ClassDecoratorContext<T>) => {
    setASTType(target, options.type);
    switch (options.type) {
      case 'Graph':
        setIsDirected(target as RootGraphModel.Constructor, options.directed);
        break;
      case 'AttributeList':
        setAttributeListKind(target as AttributeListModel.Constructor, options.kind);
        break;
    }
  };
}
