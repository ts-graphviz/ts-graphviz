import type { ASTNode } from '../../types.js';
import { DefaultAttributeListSerializer } from './plugins/AttributeListSerializerPlugin.js';
import { DefaultAttributeSerializer } from './plugins/AttributeSerializerPlugin.js';
import { CommentSerializerPlugin } from './plugins/CommentSerializerPlugin.js';
import { DefaultDotSerializer } from './plugins/DotSerializerPlugin.js';
import { EdgeSerializerPlugin } from './plugins/EdgeSerializerPlugin.js';
import { GraphSerializerPlugin } from './plugins/GraphSerializerPlugin.js';
import { LiteralSerializerPlugin } from './plugins/LiteralSerializerPlugin.js';
import { NodeRefGroupSerializerPlugin } from './plugins/NodeRefGroupSerializerPlugin.js';
import { NodeRefSerializerPlugin } from './plugins/NodeRefSerializerPlugin.js';
import { NodeSerializerPlugin } from './plugins/NodeSerializerPlugin.js';
import { SubgraphSerializerPlugin } from './plugins/SubgraphSerializerPlugin.js';
import { EOL, SerializerContext, SerializeOptions, DocPart, SerializerFunction, SerializerMapping } from './types.js';

const defaultSerializers: SerializerMapping = {
  AttributeList: DefaultAttributeListSerializer,
  Attribute: DefaultAttributeSerializer,
  Comment: CommentSerializerPlugin,
  Dot: DefaultDotSerializer,
  Edge: EdgeSerializerPlugin,
  Graph: GraphSerializerPlugin,
  Literal: LiteralSerializerPlugin,
  Node: NodeSerializerPlugin,
  NodeRefGroup: NodeRefGroupSerializerPlugin,
  NodeRef: NodeRefSerializerPlugin,
  Subgraph: SubgraphSerializerPlugin,
};

/**
 * Serializer is a class responsible for converting an AST into a DOT string.
 * @group Convert AST to DOT
 */
export class Serializer {
  /**
   * @param options Options to be used when generating the DOT string.
   */
  constructor(private options: SerializeOptions = {}) {}

  public serialize(ast: ASTNode): Iterable<string> {
    let indentLevel = 0;
    const { indentSize = 2, indentStyle = 'space', endOfLine = 'lf' } = this.options;
    const eol = endOfLine === 'crlf' ? '\r\n' : '\n';
    function* indent(tokens: () => Generator<DocPart>): Generator<string> {
      const padding = (indentStyle === 'space' ? ' ' : '\t').repeat(++indentLevel * indentSize);
      const tokenIter = tokens();
      let next = tokenIter.next();
      while (true) {
        if (next.value === EOL) {
          yield eol;
          yield padding;
        } else {
          yield next.value;
        }
        next = tokenIter.next();
        if (next.done) {
          break;
        }
      }
      indentLevel--;
    }

    const context: SerializerContext = {
      directed: true,
      *serializeChildren(children: ASTNode[]) {
        yield* indent(function* () {
          yield EOL;
          const iter = children[Symbol.iterator]();
          let next = iter.next();
          while (true) {
            yield* context.serialize(next.value);
            next = iter.next();
            if (!next.done) {
              yield EOL;
            } else {
              break;
            }
          }
        });
        yield EOL;
      },
      serialize(ast_: ASTNode) {
        return (defaultSerializers[ast_.type] as SerializerFunction).call(this, ast_);
      },
    };
    return {
      [Symbol.iterator]: function* () {
        for (const token of context.serialize(ast)) {
          if (token === EOL) {
            yield eol;
          } else {
            yield token;
          }
        }
      },
    };
  }
}
