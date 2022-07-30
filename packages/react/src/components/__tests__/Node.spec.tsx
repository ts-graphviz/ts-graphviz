import React from 'react';
import 'jest-graphviz';
import { Digraph } from '../Digraph';
import { Node } from '../Node';
import { DOT } from '../HtmlLike';
import { renderToDot } from '../../renderer/render';

describe('Node', () => {
  test('pass without optional props and render correctly', () => {
    const dot = renderToDot(
      <Digraph>
        <Node id="aaa" />
      </Digraph>,
    );
    expect(dot).toMatchSnapshot();
  });

  test('pass label with string and render correctly', () => {
    const dot = renderToDot(
      <Digraph>
        <Node id="aaa" label="label test" />
      </Digraph>,
    );
    expect(dot).toMatchSnapshot();
  });

  test('pass label with HTMLLike ReactElement and render correctly', () => {
    const dot = renderToDot(
      <Digraph>
        <Node
          id="aaa"
          label={
            <DOT.TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0">
              <DOT.TR>
                <DOT.TD>left</DOT.TD>
                <DOT.TD PORT="m">middle</DOT.TD>
                <DOT.TD PORT="r">right</DOT.TD>
              </DOT.TR>
            </DOT.TABLE>
          }
        />
      </Digraph>,
    );
    expect(dot).toMatchSnapshot();
  });

  test('pass xlabel with string and render correctly', () => {
    const dot = renderToDot(
      <Digraph>
        <Node id="aaa" xlabel="xlabel test" />
      </Digraph>,
    );
    expect(dot).toMatchSnapshot();
  });

  test('pass xlabel with HTMLLike ReactElement and render correctly', () => {
    const dot = renderToDot(
      <Digraph>
        <Node
          id="aaa"
          xlabel={
            <DOT.TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0">
              <DOT.TR>
                <DOT.TD>left</DOT.TD>
                <DOT.TD PORT="m">middle</DOT.TD>
                <DOT.TD PORT="r">right</DOT.TD>
              </DOT.TR>
            </DOT.TABLE>
          }
        />
      </Digraph>,
    );
    expect(dot).toMatchSnapshot();
  });
});
