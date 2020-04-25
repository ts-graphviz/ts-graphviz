import React from 'react';
import { Digraph } from '../Digraph';
import { DuplicatedRootClusterErrorMessage } from '../../utils/errors';
import { renderExpectToThrow } from './utils/renderExpectToThrow';

describe('Digraph', () => {
  // eslint-disable-next-line jest/expect-expect
  test('An error occurs when duplicate <Digraph />', () => {
    renderExpectToThrow(
      <Digraph>
        <Digraph />
      </Digraph>,
      DuplicatedRootClusterErrorMessage,
    );
  });
});
