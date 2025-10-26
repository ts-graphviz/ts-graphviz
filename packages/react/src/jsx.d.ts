import type { HTMLLikeLabel } from '@ts-graphviz/common';
import type { ReactNode } from 'react';

export interface DotJSXElements {
  'dot:port': { children: string };
  'dot:table': HTMLLikeLabel.TableAttributes & { children?: ReactNode };
  'dot:tr': HTMLLikeLabel.TrAttributes & { children?: ReactNode };
  'dot:td': HTMLLikeLabel.TdAttributes & { children?: ReactNode };
  'dot:font': HTMLLikeLabel.FontAttributes & { children?: ReactNode };
  'dot:br': HTMLLikeLabel.BrAttributes;
  'dot:img': HTMLLikeLabel.ImgAttributes;
  'dot:i': HTMLLikeLabel.IAttributes & { children?: ReactNode };
  'dot:b': HTMLLikeLabel.BAttributes & { children?: ReactNode };
  'dot:u': HTMLLikeLabel.UAttributes & { children?: ReactNode };
  'dot:o': HTMLLikeLabel.OAttributes & { children?: ReactNode };
  'dot:sub': HTMLLikeLabel.SubAttributes & { children?: ReactNode };
  'dot:sup': HTMLLikeLabel.SupAttributes & { children?: ReactNode };
  'dot:s': HTMLLikeLabel.SAttributes & { children?: ReactNode };
  'dot:hr': HTMLLikeLabel.HrAttributes;
  'dot:vr': HTMLLikeLabel.VrAttributes;
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements extends DotJSXElements {}
  }
}

declare module 'react/jsx-runtime' {
  namespace JSX {
    interface IntrinsicElements extends DotJSXElements {}
  }
}
