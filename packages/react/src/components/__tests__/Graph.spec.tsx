import React from 'react';
import { Graph } from '../Graph';
import { DuplicatedRootClusterErrorMessage } from '../../errors';
import { renderExpectToThrow } from './utils/renderExpectToThrow';

describe('Graph', () => {
  // eslint-disable-next-line jest/expect-expect
  test('An error occurs when duplicate <Graph />', () => {
    renderExpectToThrow(
      <Graph>
        <Graph />
      </Graph>,
      DuplicatedRootClusterErrorMessage,
    );
  });
});
