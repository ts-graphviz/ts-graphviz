import { toFile } from '@ts-graphviz/adapter';
import { $keywords, attribute as _, digraph, toDot } from 'ts-graphviz';

declare module 'ts-graphviz' {
  export namespace GraphAttributeKey {
    export interface $values extends $keywords<'fuga'> {}
  }

  export namespace Attribute {
    export interface $keys extends $keywords<'fuga'> {}

    export interface $types {
      fuga: string;
    }
  }
}

console.log(
  toDot(
    digraph((g) => {
      g.set(_.fuga, 'hoge');
    }),
  ),
);

declare module '@ts-graphviz/adapter' {
  export namespace Layout {
    export interface $values extends $keywords<'my-custom-algorithm'> {}
  }

  export namespace Format {
    export interface $values extends $keywords<'mp4'> {}
  }
}

toFile('digraph { a -> b }', '/path/to/file', {
  layout: 'my-custom-algorithm',
  format: 'mp4',
});
