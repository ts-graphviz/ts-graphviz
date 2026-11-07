---
description: DOT DSL を使い、DOT と同じように文を一つずつ書いてグラフを作ります。
---
# DOT DSL でグラフを書く

ファクトリー `digraph()`、`graph()`、`strict.*` は、グラフの **DOT DSL** を返します。DSL は DOT と同じように読めます。DOT の文がメソッドに、属性がプロパティになっています。DOT でグラフを書ける人は、そのまま DSL でも書けます。

```typescript
import { digraph, toDot } from 'ts-graphviz';

const G = digraph('G', (g) => {
  g.rankdir = 'LR';
  g.node({ shape: 'box' });
  const a = g.node('a', { label: 'Start' });
  g.edge([a, 'b', 'c']);
});

console.log(toDot(G));
// digraph "G" {
//   rankdir = "LR";
//   node [
//     shape = "box";
//   ];
//   "a" [
//     label = "Start";
//   ];
//   "a" -> "b" -> "c";
// }
```

グラフをデータとして組み立てたり、読み取ったり、変換したりするプログラムには、[モデル API の使い方](./02-model-api.md)を参照してください。

## DOT から DSL へ

| DOT | DSL |
| --- | --- |
| `digraph G { ... }` | `digraph('G', (g) => { ... })` |
| `strict graph { ... }` | `strict.graph((g) => { ... })` |
| `rankdir = LR;` | `g.rankdir = 'LR';` |
| `a [label = "A"];` | `g.node('a', { label: 'A' });` |
| `a -> b -> c;` | `g.edge(['a', 'b', 'c']);` |
| `c -> {d e};` | `g.edge(['c', ['d', 'e']]);` |
| `a:p1:n -> a:p2:s;` | `g.edge(['a:p1:n', a.$port({ port: 'p2', compass: 's' })]);` |
| `node [shape = box];` | `g.node({ shape: 'box' });` |
| `edge [color = gray];` | `g.edge({ color: 'gray' });` |
| `graph [fontname = Helvetica];` | `g.graph({ fontname: 'Helvetica' });` |
| `subgraph cluster_0 { label = Group; d; e; }` | `g.subgraph('cluster_0', { label: 'Group' }, (s) => { s.node('d'); s.node('e'); });` |
| `{ rank = same; b; c; }` | `g.subgraph({ rank: 'same' }, (s) => { s.node('b'); s.node('c'); });` |

まとめると次のようになります。

```typescript
import { digraph, toDot } from 'ts-graphviz';

const G = digraph('G', (g) => {
  g.node({ shape: 'box' });
  const a = g.node('a', { label: 'Start' });
  g.node('b');
  g.edge([a, 'b', 'c']);
  g.edge(['c', ['d', 'e']]);
  g.edge(['a:p1:n', a.$port({ port: 'p2', compass: 's' })]);
  g.subgraph('cluster_0', { label: 'Group' }, (s) => {
    s.node('d');
    s.node('e');
  });
  g.subgraph({ rank: 'same' }, (s) => {
    s.node('b');
    s.node('c');
  });
});

console.log(toDot(G));
// digraph "G" {
//   node [
//     shape = "box";
//   ];
//   "a" [
//     label = "Start";
//   ];
//   "b";
//   "a" -> "b" -> "c";
//   "c" -> {"d" "e"};
//   "a":"p1":"n" -> "a":"p2":"s";
//   subgraph "cluster_0" {
//     label = "Group";
//     "d";
//     "e";
//   }
//   subgraph {
//     rank = "same";
//     "b";
//     "c";
//   }
// }
```

`g.node(id)` と `g.subgraph(id)` は、その id のノードやサブグラフがあればそれを返し、なければ作ります。DOT で同じ名前を二度書いたときと同じです。コールバックはノード・エッジ・サブグラフの DSL を受け取り、メソッドも同じ DSL を返します。

属性名には型が付いているので、エディタで補完され、値も検査されます。id が `cluster` で始まるサブグラフは、クラスターの属性（`label`、`color` など）を受け取ります。

## 属性はプロパティ

属性はその名前のまま読み書きし、削除できます。

```typescript
import { digraph } from 'ts-graphviz';

digraph((g) => {
  const a = g.node('a');
  a.label = 'A';
  a.color = 'red';
  delete a.label; // 属性を取り除く
  a.color = undefined; // undefined を代入しても取り除かれる
  console.log(a.label); // undefined
});
```

属性は `attribute` の定数（`a[attribute.label]`）でも書けます。型を拡張して追加した属性（[ts-graphvizの拡張](./05-extending-ts-graphviz.md)を参照）も同じように書けます。

## `$` の規則

属性がそのままの名前を使うため、モデル自身のメンバーには先頭に `$` が付きます。

| DSL での書き方 | 意味 |
| --- | --- |
| `a.$id` | ノードの名前（DOT での id） |
| `a.id` | Graphviz の `id` 属性（SVG 要素の id） |
| `a.$comment`、`g.$nodes`、`g.$edges`、`g.$subgraphs` | モデルのメンバー |
| `g.$getNode('a')`、`g.$createNode('a')`、`a.$port('p')` | モデルのメソッド |
| `a.$$type` | `$$` で始まるメンバーはその名前のまま |

```typescript
import { digraph } from 'ts-graphviz';

digraph((g) => {
  const a = g.node('a');
  a.id = 'svg-a';
  console.log(a.$id); // 'a'
  console.log(a.id); // 'svg-a'
  console.log(a.$$type); // 'Node'
});
```

自作クラスのメンバーも同じ規則に従います。メソッド `hello()` は `$hello()` に、`$foo` という名前のメンバーは `$$foo` になります。

```typescript
import { Digraph, dsl } from 'ts-graphviz';

class MyDigraph extends Digraph {
  hello() {
    return `${this.nodes.length} nodes`;
  }
}

const g = dsl(new MyDigraph());
g.node('a');
console.log(g.$hello()); // '1 nodes'
```

## 読み込んだグラフを編集する

`fromDot` はモデルを返します。`dsl()` はモデルの DSL を返すので、読み込んだグラフも同じ書き方で編集できます。

```typescript
import { dsl, fromDot, toDot } from 'ts-graphviz';

const g = dsl(fromDot('digraph { a [label = "A"]; a -> b; }'));
g.node('a').color = 'red';
g.edge(['b', 'c']);

console.log(toDot(g));
```

DSL を通してたどったモデルはすべて DSL で、一つのモデルに DSL は一つなので、DSL は `===` で比較できます。`modelOf(x)` でモデルに戻せます。`toDot`、`fromModel`、アダプターの `toBlob` は、モデルだけでなく DSL も受け取ります。

## DOT の文の順序

DOT では、既定属性の文（`node [...]` など）はその後に書いたものにだけ適用されます。既定のモデルはグラフごとに既定値を一組だけ持ち、先頭に書き出すため、その属性を自分で設定していないすべてのノードに最後の値が適用されます（`g.node('a', { color: 'green' })` のようにノードに設定した属性は、常に既定値より優先されます）。DOT と同じ意味でグラフを書くには、`ts-graphviz/ordered` から import します。`ts-graphviz` と同じ名前を持ち、既定属性の文を書いた位置に残すモデルを使います。

```typescript
import { digraph, toDot } from 'ts-graphviz/ordered';

const G = digraph((g) => {
  g.node({ color: 'red' });
  g.node('a'); // red
  g.node({ color: 'blue' });
  g.node('b'); // blue
});

console.log(toDot(G));
// digraph {
//   node [
//     color = "red";
//   ];
//   "a";
//   node [
//     color = "blue";
//   ];
//   "b";
// }
```

`ts-graphviz/ordered` の `fromDot` も同じモデルに読み込むので、`toDot(fromDot(source))` を通しても既定属性の文の位置は変わりません。（グラフ自身の属性は先頭に書き出されるため、サブグラフの後で設定した属性（DOT ではサブグラフに継承されないもの）は、サブグラフの前に移ります。）`ts-graphviz` 自体で明示的に書くと、`withContext(orderedModels)` と `fromDot(source, { convert: { models: orderedModels } })` になります。

```typescript
import { fromDot, orderedModels, withContext } from 'ts-graphviz';

const { digraph } = withContext(orderedModels);
const G = digraph((g) => {
  g.node('a');
  g.edge({ color: 'red' }); // これより後のエッジに適用される
  g.edge(['a', 'b']);
});

const parsed = fromDot('digraph { node [color=red]; a; node [color=blue]; b; }', {
  convert: { models: orderedModels },
});
```

## よくある質問

### エッジにだけ出てくるノードが `$nodes` に入らない

```typescript
import { dsl, fromDot } from 'ts-graphviz';

const g = dsl(fromDot('digraph { a; a -> b; }'));
console.log(g.$nodes.map((n) => n.$id)); // ['a']
console.log(g.$getNode('b')); // undefined
```

DOT では、エッジはそこに書かれたノードを作ります。一方、モデルはエッジの端点を id で記録するだけです。`$nodes`（とモデルの `nodes`）が持つのはノード文として書かれたノードで、Graphviz から見たグラフのノードすべてではありません。ノードは複数のサブグラフに属することがあり、サブグラフの中の `a -> b` が外に書かれたノードを指すこともあるため、モデルは推測しません。`$nodes` に入れたいノードは `g.node('b')` で宣言するか、エッジの端点の id を読み取ってください。

### `isNodeModel(dsl)` が false になる

DSL はモデルの代わりになりますが、モデルそのものではないため、モデルの型ガード（`isNodeModel`、`isRootGraphModel` など）は DSL に対して false を返します。`$$type` か、モデルを確かめてください。

```typescript
import { digraph, isNodeModel, modelOf } from 'ts-graphviz';

digraph((g) => {
  const a = g.node('a');
  console.log(isNodeModel(a)); // false
  console.log(isNodeModel(modelOf(a))); // true
  console.log(a.$$type === 'Node'); // true
});
```

### 順序付きモデルでは `$attributes.node` が最初の既定値だけを指す

`ts-graphviz/ordered` では、他の文の後に書いた既定属性の文は、グラフの中で独立した文になります。`g.$attributes.node` はグラフ先頭の既定値で、最後に書いた `node [...]` ではありません。

```typescript
import { digraph } from 'ts-graphviz/ordered';

digraph((g) => {
  g.node({ color: 'red' });
  g.node('a');
  g.node({ color: 'blue' });
  console.log(g.$attributes.node.color); // 'red'
});
```

同じ理由で、後の文で `undefined` を指定しても、前の文で設定した値は消えません。
