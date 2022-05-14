/* eslint-disable no-undef */
import { AttributesValue } from 'ts-graphviz';
import { ValueOf } from '../utils/value-of';

export type TableProps = {
  ALIGN?: 'CENTER' | 'LEFT' | 'RIGHT'; // "CENTER|LEFT|RIGHT"
  BGCOLOR?: AttributesValue; // "color"
  BORDER?: AttributesValue; // "value"
  CELLBORDER?: AttributesValue; // "value"
  CELLPADDING?: AttributesValue; // "value"
  CELLSPACING?: AttributesValue; // "value"
  COLOR?: AttributesValue; // "color"
  COLUMNS?: AttributesValue; // "value"
  FIXEDSIZE?: true; // "FALSE|TRUE"
  GRADIENTANGLE?: AttributesValue; // "value"
  HEIGHT?: AttributesValue; // "value"
  HREF?: AttributesValue; // "value"
  ID?: AttributesValue; // "value"
  PORT?: AttributesValue; // "portName"
  ROWS?: AttributesValue; // "value"
  SIDES?: AttributesValue; // "value"
  STYLE?: AttributesValue; // "value"
  TARGET?: AttributesValue; // "value"
  TITLE?: AttributesValue; // "value"
  TOOLTIP?: AttributesValue; // "value"
  VALIGN?: 'MIDDLE' | 'BOTTOM' | 'TOP'; // "MIDDLE|BOTTOM|TOP"
  WIDTH?: AttributesValue; // "value"
};

// TODO
// eslint-disable-next-line @typescript-eslint/ban-types
type NoAttributes = {};

export type TrProps = NoAttributes;

export type TdProps = {
  ALIGN?: 'CENTER' | 'LEFT' | 'RIGHT' | 'TEXT'; // "CENTER|LEFT|RIGHT|TEXT"
  BALIGN?: 'CENTER' | 'LEFT' | 'RIGHT'; // "CENTER|LEFT|RIGHT"
  BGCOLOR?: AttributesValue; // "color"
  BORDER?: AttributesValue; // "value"
  CELLPADDING?: AttributesValue; // "value"
  CELLSPACING?: AttributesValue; // "value"
  COLOR?: AttributesValue; // "color"
  COLSPAN?: AttributesValue; // "value"
  FIXEDSIZE?: boolean; // "FALSE|TRUE"
  GRADIENTANGLE?: AttributesValue; // "value"
  HEIGHT?: AttributesValue; // "value"
  HREF?: AttributesValue; // "value"
  ID?: AttributesValue; // "value"
  PORT?: AttributesValue; // "portName"
  ROWSPAN?: AttributesValue; // "value"
  SIDES?: AttributesValue; // "value"
  STYLE?: AttributesValue; // "value"
  TARGET?: AttributesValue; // "value"
  TITLE?: AttributesValue; // "value"
  TOOLTIP?: AttributesValue; // "value"
  VALIGN?: 'MIDDLE' | 'BOTTOM' | 'TOP'; // "MIDDLE|BOTTOM|TOP"
  WIDTH?: AttributesValue; // "value"
};

export type FontProps = {
  COLOR?: AttributesValue; // "color"
  FACE?: AttributesValue; // "fontname"
  'POINT-SIZE'?: AttributesValue; // "value"
};

export type BrProps = {
  ALIGN?: 'CENTER' | 'LEFT' | 'RIGHT'; // "CENTER|LEFT|RIGHT"
};

export type ImgProps = {
  SCALE?: boolean | 'WIDTH' | 'HEIGHT' | 'BOTH'; // "FALSE|TRUE|WIDTH|HEIGHT|BOTH"
  SRC?: AttributesValue; // "value"
};

export type IProps = NoAttributes;

export type BProps = NoAttributes;

export type UProps = NoAttributes;

export type OProps = NoAttributes;
export type SubProps = NoAttributes;

export type SupProps = NoAttributes;
export type SProps = NoAttributes;
export type HrProps = NoAttributes;
export type VrProps = NoAttributes;

export const DOT = Object.freeze({
  PORT: 'dot-port',
  TABLE: 'dot-table',
  TR: 'dot-tr',
  TD: 'dot-td',
  FONT: 'dot-font',
  BR: 'dot-br',
  IMG: 'dot-img',
  I: 'dot-i',
  B: 'dot-b',
  U: 'dot-u',
  O: 'dot-o',
  SUB: 'dot-sub',
  SUP: 'dot-sup',
  S: 'dot-s',
  HR: 'dot-hr',
  VR: 'dot-vr',
} as const);

export type DOT = ValueOf<typeof DOT>;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      [DOT.PORT]: { children: string };
      [DOT.TABLE]: React.PropsWithChildren<TableProps>;
      [DOT.TR]: React.PropsWithChildren<TrProps>;
      [DOT.TD]: React.PropsWithChildren<TdProps>;
      [DOT.FONT]: React.PropsWithChildren<FontProps>;
      [DOT.BR]: BrProps;
      [DOT.IMG]: ImgProps;
      [DOT.I]: React.PropsWithChildren<IProps>;
      [DOT.B]: React.PropsWithChildren<BProps>;
      [DOT.U]: React.PropsWithChildren<UProps>;
      [DOT.O]: React.PropsWithChildren<OProps>;
      [DOT.SUB]: React.PropsWithChildren<SubProps>;
      [DOT.SUP]: React.PropsWithChildren<SupProps>;
      [DOT.S]: React.PropsWithChildren<SProps>;
      [DOT.HR]: HrProps;
      [DOT.VR]: VrProps;
    }
  }
}
