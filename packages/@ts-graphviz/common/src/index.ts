import { AttributeListConstructor, setASTType, setAttributeListKind, setIsDirected } from './models.js';
import { AttributeListKind } from './models.js';
import { EdgeConstructor, NodeConstructor, RootGraphConstructor, SubgraphConstructor } from './models.js';

export * from './utils/index.js';
export * from './type/index.js';
export * from './attribute/index.js';
export * from './models.js';
export * from './models-context.js';

interface DefineGraphOption {
  type: 'Graph';
  directed: boolean;
}

interface DefineSubgraphOption {
  type: 'Subgraph';
}

interface DefineNodeOption {
  type: 'Node';
}
interface DefineEdgeOption {
  type: 'Edge';
}

interface DefineAttributeListOption {
  type: 'AttributeList';
  kind: AttributeListKind;
}

type DefineOption =
  | DefineGraphOption
  | DefineSubgraphOption
  | DefineNodeOption
  | DefineEdgeOption
  | DefineAttributeListOption;

export function define(
  options: DefineGraphOption,
): (target: RootGraphConstructor, context: ClassDecoratorContext<RootGraphConstructor>) => void;
export function define(
  options: DefineSubgraphOption,
): (target: SubgraphConstructor, context: ClassDecoratorContext<SubgraphConstructor>) => void;
export function define(
  options: DefineEdgeOption,
): (target: EdgeConstructor, context: ClassDecoratorContext<EdgeConstructor>) => void;
export function define(
  options: DefineNodeOption,
): (target: NodeConstructor, context: ClassDecoratorContext<NodeConstructor>) => void;
export function define(
  options: DefineAttributeListOption,
): (target: AttributeListConstructor, context: ClassDecoratorContext<AttributeListConstructor>) => void;
export function define(options: DefineOption) {
  switch (options.type) {
    case 'Graph':
      return (target: RootGraphConstructor, context: ClassDecoratorContext<RootGraphConstructor>) => {
        setASTType(target, 'Graph');
        setIsDirected(target, options.directed);
      };
    case 'Subgraph':
      return (target: SubgraphConstructor, context: ClassDecoratorContext<SubgraphConstructor>) => {
        setASTType(target, 'Subgraph');
      };
    case 'Edge':
      return (target: EdgeConstructor, context: ClassDecoratorContext<EdgeConstructor>) => {
        setASTType(target, 'Edge');
      };
    case 'Node':
      return (target: NodeConstructor, context: ClassDecoratorContext<NodeConstructor>) => {
        setASTType(target, 'Node');
      };
    case 'AttributeList':
      return (target: AttributeListConstructor, context: ClassDecoratorContext<AttributeListConstructor>) => {
        setASTType(target, 'AttributeList');
        setAttributeListKind(target, options.kind);
      };
    default:
      return () => {
        // noop
      };
  }
}
