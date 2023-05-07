/* eslint-disable @typescript-eslint/no-empty-interface */
import { digraph, toDot, attribute as _, $keywords } from 'ts-graphviz';
import { toFile } from '@ts-graphviz/adapter';

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
