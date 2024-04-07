import { BackgroundStyle, CanvasColor, EdgeEnd, EdgeSide } from './types.js';

/**
 * GenericNode is the base type for all nodes.
 */
export interface GenericNode {
  /**
   * The type of the node.
   */
  type: NodeType;
  /**
   * A unique ID for the node.
   */
  id: string;
  /**
   * The x position of the node in pixels.
   */
  x: number;
  /**
   * The y position of the node in pixels.
   */
  y: number;
  /**
   * The width of the node in pixels.
   */
  width: number;
  /**
   * The height of the node in pixels.
   */
  height: number;
  /**
   * The color of the node, see the {@link CanvasColor}.
   */
  color?: CanvasColor;
}
/**
 * Namespace for the {@link GenericNode} type.
 */
export namespace GenericNode {
  /**
   * Assert that a node is a {@link GenericNode}.
   * @param node The node to assert.
   * @throws If the node is not a {@link GenericNode}.
   */
  export function assert(node: any): asserts node is GenericNode {
    if (typeof node !== 'object') {
      throw new Error('Invalid node');
    }
    if (typeof node.type !== 'string') {
      throw new Error('Invalid node type');
    }
    NodeType.assert(node.type);
    if (typeof node.id !== 'string') {
      throw new Error('Invalid node id');
    }
    if (typeof node.x !== 'number') {
      throw new Error('Invalid node x');
    }
    if (typeof node.y !== 'number') {
      throw new Error('Invalid node y');
    }
    if (typeof node.width !== 'number') {
      throw new Error('Invalid node width');
    }
    if (typeof node.height !== 'number') {
      throw new Error('Invalid node height');
    }
    if (node.color !== undefined) {
      if (typeof node.color !== 'string') {
        throw new Error('Invalid node color');
      }
      CanvasColor.assert(node.color);
    }
  }
}

/**
 * Text type nodes store text.
 */
export interface TextNode extends GenericNode {
  type: 'text';
  /**
   * Plain text with Markdown syntax.
   */
  text: string;
}

export interface FileNode extends GenericNode {
  type: 'file';
  /**
   * The path to the file within the system.
   */
  file: string;
  /**
   * A subpath that may link to a heading or a block.
   * Always starts with a `#`.
   */
  subpath?: string;
}

export interface LinkNode extends GenericNode {
  type: 'link';
  /**
   * Link type nodes reference a URL.
   */
  url: string;
}

/**
 * Group type nodes are used as a visual container for nodes within it.
 */
export interface GroupNode extends GenericNode {
  type: 'group';
  /**
   * Text label for the group.
   */
  label?: string;
  /**
   * The path to the background image.
   */
  background?: string;
  /**
   * The rendering style of the background image.
   */
  backgroundStyle?: BackgroundStyle;
}

/**
 * Edges are lines that connect one node to another.
 */
export interface Edge {
  /**
   * A unique ID for the edge.
   */
  id: string;
  /**
   * The node id where the connection starts.
   */
  fromNode: string;
  /**
   * The side where this edge starts.
   */
  fromSide?: EdgeSide;
  /**
   * The shape of the endpoint at the edge start.
   */
  fromEnd?: EdgeEnd;
  /**
   * The node id where the connection ends.
   */
  toNode: string;
  /**
   * The side where this edge ends.
   */
  toSide?: EdgeSide;
  /**
   * The shape of the endpoint at the edge end.
   */
  toEnd?: EdgeEnd;
  /**
   * The color of the line, see the {@link CanvasColor}.
   */
  color?: CanvasColor;
  /**
   * A text label for the edge.
   */
  label?: string;
}
/**
 * Namespace for the {@link Edge} type.
 */
export namespace Edge {
  /**
   * Asserts that the given object is a valid {@link Edge}.
   * Throws an error if any of the assertions fail.
   *
   * @param edge - The object to be asserted as an {@link Edge}.
   * @throws {Error} If any of the assertions fail.
   */
  export function assert(edge: any): asserts edge is Edge {
    if (typeof edge !== 'object') {
      throw new Error('Invalid edge');
    }
    if (typeof edge.id !== 'string') {
      throw new Error('Invalid edge id');
    }
    if (typeof edge.fromNode !== 'string') {
      throw new Error('Invalid edge source');
    }
    if (typeof edge.toNode !== 'string') {
      throw new Error('Invalid edge target');
    }
    if (edge.fromSide !== undefined) {
      EdgeSide.assert(edge.fromSide);
    }
    if (edge.toSide !== undefined) {
      EdgeSide.assert(edge.toSide);
    }
    if (edge.fromEnd !== undefined) {
      EdgeEnd.assert(edge.fromEnd);
    }
    if (edge.toEnd !== undefined) {
      EdgeEnd.assert(edge.toEnd);
    }
    if (edge.color !== undefined) {
      CanvasColor.assert(edge.color);
    }
    if (edge.label !== undefined) {
      if (typeof edge.label !== 'string') {
        throw new Error('Invalid edge label');
      }
    }
  }
}

/**
 * The Node type is a union of all possible node types.
 */
export type Node = TextNode | FileNode | LinkNode | GroupNode;
/**
 * Namespace for the {@link Node} type.
 */
export namespace Node {
  /**
   * Assert that a node is a {@link Node}.
   * @param node - The node to assert.
   * @throws {Error} If the node is not a {@link Node}.
   */
  export function assert(node: any): asserts node is Node {
    switch (node.type) {
      case 'text':
        if (typeof node.text !== 'string') {
          throw new Error('Invalid text node text');
        }
        if (
          typeof node.subpath !== 'string' &&
          typeof node.subpath !== 'undefined'
        ) {
          throw new Error('Invalid text node subpath');
        }
        GenericNode.assert(node);
        break;
      case 'file':
        if (typeof node.file !== 'string') {
          throw new Error('Invalid file node file');
        }
        GenericNode.assert(node);
        break;
      case 'link':
        if (typeof node.url !== 'string') {
          throw new Error('Invalid link node url');
        }
        GenericNode.assert(node);
        break;
      case 'group':
        if (node.label !== undefined) {
          if (typeof node.label !== 'string') {
            throw new Error('Invalid group node label');
          }
        }
        if (node.background !== undefined) {
          if (typeof node.background !== 'string') {
            throw new Error('Invalid group node background');
          }
          CanvasColor.assert(node.background);
        }
        if (node.backgroundStyle !== undefined) {
          BackgroundStyle.assert(node.backgroundStyle);
        }
        GenericNode.assert(node);
        break;
      default:
        throw new Error('Invalid node type');
    }
  }
}

/**
 * A union of all possible node types.
 */
export type NodeType = Node['type'];
/**
 * Namespace for the {@link NodeType} type.
 */
export namespace NodeType {
  /**
   * The text type of {@link NodeType}.
   * @example
   * ```ts
   * const node: TextNode = {
   *   type: NodeType.text,
   *   ...,
   * };
   * ```
   */
  export const text = 'text';

  /**
   * The file type of {@link NodeType}
   * @example
   * ```ts
   * const node: FileNode = {
   *   type: NodeType.file,
   *   ...,
   * };
   * ```
   */
  export const file = 'file';
  /**
   * The link type of {@link NodeType}
   * @example
   * ```ts
   * const node: LinkNode = {
   *   type: NodeType.link,
   *   ...,
   * };
   * ```
   */
  export const link = 'link';
  /**
   * The group type of {@link NodeType}
   * @example
   * ```ts
   * const node: GroupNode = {
   *   type: NodeType.group,
   *   ...,
   * };
   * ```
   */
  export const group = 'group';

  /**
   * Assert that a string is a {@link NodeType}.
   * @param type - The string to assert.
   * @throws If the string is not a {@link NodeType}.
   * @returns The asserted {@link NodeType}.
   * @example
   * ```ts
   * NodeType.assert('text');
   * ```
   */
  export function assert(type: string): asserts type is NodeType {
    if (!validate(type)) {
      throw new Error(`Invalid NodeType: ${type}`);
    }
  }

  /**
   * Validates if a string is a {@link NodeType}.
   * @param type - The string to validate.
   * @returns True if the string is a {@link NodeType}.
   */
  export function validate(type: string): type is NodeType {
    return type === text || type === file || type === link || type === group;
  }
}

/**
 * The schema for a JSON canvas.
 */
export interface JSONCanvas {
  /**
   * A collection of nodes.
   */
  nodes: Node[];
  /**
   * A collection of edges.
   */
  edges: Edge[];
}

/**
 * Namespace for the {@link JSONCanvas} type.
 */
export namespace JSONCanvas {
  /**
   * Parses a JSON string and returns a {@link JSONCanvas} object.
   *
   * @param json - The JSON string to parse.
   * @returns A {@link JSONCanvas} object representing the parsed JSON.
   */
  export function parse(json: string): JSONCanvas {
    const data = JSON.parse(json);
    return load(data);
  }

  /**
   * Asserts that the given object is a valid {@link JSONCanvas}.
   * Throws an error if any of the assertions fail.
   * @param data - The object to be asserted as a {@link JSONCanvas}.
   * @throws {Error} If any of the assertions fail.
   * @example
   * ```ts
   * import { JSONCanvas } from '@ts-graphviz/jsoncanvas';
   * JSONCanvas.assert({
   *   nodes: [
   *     { id: 'node1', x: 10, y: 20, ... },
   *     { id: 'node2', x: 30, y: 40, ... },
   *   ],
   *   edges: [
   *     { id: 'edge1', source: 'node1', target: 'node2', ... },
   *   ],
   * });
   * ```
   */
  export function assert(data: any): asserts data is JSONCanvas {
    if (typeof data !== 'object') {
      throw new Error('Invalid canvas data');
    }
    if (!Array.isArray(data.nodes)) {
      throw new Error('Invalid canvas nodes');
    }
    if (!Array.isArray(data.edges)) {
      throw new Error('Invalid canvas edges');
    }
    for (const node of data.nodes) {
      Node.assert(node);
    }
    for (const edge of data.edges) {
      Edge.assert(edge);
    }
  }

  /**
   * Loads a {@link JSONCanvas} from the provided data.
   * @param data - The JSONCanvasSchema representing the data to load.
   * @returns The loaded {@link JSONCanvas} instance.
   *
   * @example
   * ```ts
   * import { JSONCanvas } from '@ts-graphviz/jsoncanvas';
   * const jsoncanvas = JSONCanvas.load({
   *   nodes: [
   *     { id: 'node1', x: 10, y: 20, ... },
   *     { id: 'node2', x: 30, y: 40, ... },
   *   ],
   *   edges: [
   *     { id: 'edge1', source: 'node1', target: 'node2', ... },
   *   ],
   * });
   * ```
   */
  export function load(data: any): JSONCanvas {
    const { edges = [], nodes = [] } = data;
    const canvas = { edges, nodes };
    assert(canvas);
    return canvas;
  }
}
