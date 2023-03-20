import type {
  ASTNode,
  AttributeASTNode,
  AttributeListASTNode,
  CommentASTNode,
  CommentKind,
  DotASTNode,
  EdgeASTNode,
  GraphASTNode,
  LiteralASTNode,
  NodeASTNode,
  NodeRefASTNode,
  NodeRefGroupASTNode,
  SubgraphASTNode,
} from '../../types.js';
import { ASTType, AttributeKey } from '../../../common/index.js';
import { SerializeOptions } from './types.js';

type ASTNodeOf<T extends ASTType> = T extends 'Graph'
  ? GraphASTNode
  : T extends 'Edge'
  ? EdgeASTNode
  : T extends 'Node'
  ? NodeASTNode
  : T extends 'Literal'
  ? LiteralASTNode<string>
  : T extends 'Dot'
  ? DotASTNode
  : T extends 'Attribute'
  ? AttributeASTNode<AttributeKey>
  : T extends 'Comment'
  ? CommentASTNode
  : T extends 'AttributeList'
  ? AttributeListASTNode
  : T extends 'NodeRef'
  ? NodeRefASTNode
  : T extends 'NodeRefGroup'
  ? NodeRefGroupASTNode
  : T extends 'Subgraph'
  ? SubgraphASTNode
  : ASTNode;

const EOL = Symbol();
const PADDINTG = Symbol();

type DocPart = string | typeof EOL | typeof PADDINTG;

type SerializerFunction<T extends ASTNode = ASTNode> = (this: Serializer, ast: T) => Generator<DocPart>;

export class Serializer implements Iterable<string> {
  static #EOL_PTN = /\r?\n/;

  static #splitByLine = (value: string): string[] => value.split(this.#EOL_PTN);

  static #getCommentPrefix(kind: CommentKind) {
    switch (kind) {
      case 'Block':
        return ' * ';
      case 'Macro':
        return '# ';
      case 'Slash':
        return '// ';
    }
  }
  static #escape = (value: string): string => value.replace(/\r/g, '\\r').replace(/\n/g, '\\n').replace(/"/g, '\\"');

  static #serializers: { [T in ASTType]: SerializerFunction<ASTNodeOf<T>> } = {
    AttributeList: function* (ast) {
      yield ast.kind.toLocaleLowerCase();
      yield ' [';
      if (ast.children.length >= 1) {
        yield* this.#serializeChildren(ast.children);
      }
      yield '];';
    },
    Attribute: function* (ast) {
      yield* this.#serialize(ast.key);
      yield ' = ';
      yield* this.#serialize(ast.value);
      yield ';';
    },
    Comment: function* (ast) {
      const lines = Serializer.#splitByLine(ast.value);
      const prefix = Serializer.#getCommentPrefix(ast.kind);
      if (ast.kind === 'Block') yield* ['/**', EOL];
      for (let index = 0; index < lines.length; index++) {
        yield prefix;
        yield lines[index];
        if (index !== lines.length - 1) {
          yield EOL;
        }
      }
      if (ast.kind === 'Block') yield* [EOL, ' */'];
    },
    Dot: function* (ast) {
      for (let index = 0; index < ast.children.length; index++) {
        yield* this.#serialize(ast.children[index]);
        if (index !== ast.children.length - 1) {
          yield EOL;
        }
      }
    },
    Edge: function* (ast) {
      const edgeOperator = this.#directed ? ' -> ' : ' -- ';
      for (let index = 0; index < ast.targets.length; index++) {
        yield* this.#serialize(ast.targets[index]);
        if (index !== ast.targets.length - 1) {
          yield edgeOperator;
        }
      }

      if (ast.children.length === 0) {
        yield ';';
        return;
      }
      yield ' [';
      if (ast.children.length >= 1) {
        yield* this.#serializeChildren(ast.children);
      }
      yield '];';
    },
    Graph: function* (ast) {
      this.#directed = ast.directed;

      if (ast.strict) {
        yield 'strict ';
      }
      yield ast.directed ? 'digraph ' : 'graph ';
      if (ast.id) {
        yield* this.#serialize(ast.id);
        yield ' ';
      }
      yield '{';
      if (ast.children.length >= 1) {
        yield* this.#serializeChildren(ast.children);
      }
      yield '}';
    },
    Literal: function* (ast) {
      switch (ast.quoted) {
        case 'html':
          yield '<';
          yield ast.value;
          yield '>';
          return;
        case true:
          yield '"';
          yield Serializer.#escape(ast.value);
          yield '"';
          return;
        case false:
        default:
          yield Serializer.#escape(ast.value);
          return;
      }
    },
    Node: function* (ast) {
      yield* this.#serialize(ast.id);
      if (ast.children.length >= 1) {
        yield ' [';
        yield* this.#serializeChildren(ast.children);
        yield ']';
      }
      yield ';';
    },
    NodeRefGroup: function* (ast) {
      yield '{';
      for (let index = 0; index < ast.children.length; index++) {
        yield* this.#serialize(ast.children[index]);
        if (index !== ast.children.length - 1) {
          yield ' ';
        }
      }
      yield '}';
    },
    NodeRef: function* (ast) {
      yield* this.#serialize(ast.id);
      if (ast.port) {
        yield ':';
        yield* this.#serialize(ast.port);
      }
      if (ast.compass) {
        yield ':';
        yield* this.#serialize(ast.compass);
      }
    },
    Subgraph: function* (ast) {
      yield 'subgraph';
      if (ast.id) {
        yield ' ';
        yield* this.#serialize(ast.id);
      }
      yield ' {';
      if (ast.children.length >= 1) {
        yield* this.#serializeChildren(ast.children);
      }
      yield '}';
    },
  };

  #EOL: string;
  #PADDING: string;
  constructor(private ast: ASTNode, private options: SerializeOptions = {}) {
    const { indentSize = 2, indentStyle = 'space', endOfLine = 'lf' } = this.options;
    this.#EOL = endOfLine === 'crlf' ? '\r\n' : '\n';
    this.#PADDING = (indentStyle === 'space' ? ' ' : '\t').repeat(indentSize);
  }

  #directed = true;
  *#indent(tokens: (this: Serializer) => Generator<DocPart>): Generator<DocPart> {
    for (const token of tokens.call(this)) {
      if (token === EOL) {
        yield EOL;
        yield PADDINTG;
      } else {
        yield token;
      }
    }
  }

  *#serializeChildren(children: ASTNode[]) {
    yield* this.#indent(function* () {
      yield EOL;
      for (let index = 0; index < children.length; index++) {
        yield* this.#serialize(children[index]);
        if (index !== children.length - 1) {
          yield EOL;
        }
      }
    });
    yield EOL;
  }

  #serialize(ast_: ASTNode): Generator<DocPart> {
    return (Serializer.#serializers[ast_.type] as SerializerFunction).call(this, ast_);
  }

  *[Symbol.iterator](): Iterator<string> {
    for (const token of this.#serialize(this.ast)) {
      if (token === EOL) {
        yield this.#EOL;
      } else if (token === PADDINTG) {
        yield this.#PADDING;
      } else {
        yield token;
      }
    }
  }
}
