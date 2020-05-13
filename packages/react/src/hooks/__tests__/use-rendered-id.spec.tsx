import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { context } from './utils/wrapper';
import { useRenderedID } from '../use-rendered-id';
import { DOT } from '../../components/HtmlLike';

describe('useRenderedID', () => {
  test.each([
    'hoge',
    '<<b>bold</b>>',
    <DOT.B>bold</DOT.B>,
    <DOT.TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0">
      <DOT.TR>
        <DOT.TD>left</DOT.TD>
        <DOT.TD PORT="m">middle</DOT.TD>
        <DOT.TD PORT="r">right</DOT.TD>
      </DOT.TR>
    </DOT.TABLE>,
  ])('', (id) => {
    const { result } = renderHook(() => useRenderedID(id), {
      wrapper: context(),
    });
    expect(result.current).toMatchSnapshot();
  });
});
