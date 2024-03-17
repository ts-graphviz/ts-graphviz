import type { HTMLLikeLabel } from '@ts-graphviz/common';

type ValueOf<T> = T[keyof T];

export const DOT = Object.freeze({
  PORT: 'dot:port',
  TABLE: 'dot:table',
  TR: 'dot:tr',
  TD: 'dot:td',
  FONT: 'dot:font',
  BR: 'dot:br',
  IMG: 'dot:img',
  I: 'dot:i',
  B: 'dot:b',
  U: 'dot:u',
  O: 'dot:o',
  SUB: 'dot:sub',
  SUP: 'dot:sup',
  S: 'dot:s',
  HR: 'dot:hr',
  VR: 'dot:vr',
} as const);

export type DOT = ValueOf<typeof DOT>;

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'dot:port': { children: string };
      'dot:table': React.PropsWithChildren<HTMLLikeLabel.TableAttributes>;
      'dot:tr': React.PropsWithChildren<HTMLLikeLabel.TrAttributes>;
      'dot:td': React.PropsWithChildren<HTMLLikeLabel.TdAttributes>;
      'dot:font': React.PropsWithChildren<HTMLLikeLabel.FontAttributes>;
      'dot:br': HTMLLikeLabel.BrAttributes;
      'dot:img': HTMLLikeLabel.ImgAttributes;
      'dot:i': React.PropsWithChildren<HTMLLikeLabel.IAttributes>;
      'dot:b': React.PropsWithChildren<HTMLLikeLabel.BAttributes>;
      'dot:u': React.PropsWithChildren<HTMLLikeLabel.UAttributes>;
      'dot:o': React.PropsWithChildren<HTMLLikeLabel.OAttributes>;
      'dot:sub': React.PropsWithChildren<HTMLLikeLabel.SubAttributes>;
      'dot:sup': React.PropsWithChildren<HTMLLikeLabel.SupAttributes>;
      'dot:s': React.PropsWithChildren<HTMLLikeLabel.SAttributes>;
      'dot:hr': HTMLLikeLabel.HrAttributes;
      'dot:vr': HTMLLikeLabel.VrAttributes;
    }
  }
}
