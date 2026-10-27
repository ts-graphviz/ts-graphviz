---
"@ts-graphviz/ast": major
---

Rename the misspelled `*ASTPropaties` types to `*ASTProperties`

`ASTCommonPropaties`, `DotASTPropaties`, `GraphASTPropaties`, `AttributeASTPropaties`, `CommentASTPropaties`, `AttributeListASTPropaties`, `NodeRefASTPropaties`, `EdgeASTPropaties`, `NodeASTPropaties`, `SubgraphASTPropaties` and `LiteralASTPropaties` are spelled `…Properties`. `NodeRefGroupASTPropaties` is replaced by `NodeRefListASTProperties`, with the node type. Update imports accordingly; there are no behavioural changes.
