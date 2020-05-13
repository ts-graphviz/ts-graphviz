import React from 'react';
import { DOT } from '../../components/HtmlLike';
import { renderId } from '../render-id';

describe('renderId', () => {
  test('return undefined when give parameter is undefined', () => {
    expect(renderId(undefined)).toBeUndefined();
  });

  test.each([
    'hoge',
    '<<b>bold</b>>',
    <DOT.B>bold</DOT.B>,
    <>
      label
      <DOT.PORT>port</DOT.PORT>
    </>,
    <DOT.TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0">
      <DOT.TR>
        <DOT.TD>left</DOT.TD>
        <DOT.TD PORT="m">middle</DOT.TD>
        <DOT.TD PORT="r">right</DOT.TD>
      </DOT.TR>
    </DOT.TABLE>,
  ])('case', (id) => {
    expect(renderId(id)).toMatchSnapshot();
  });
});
