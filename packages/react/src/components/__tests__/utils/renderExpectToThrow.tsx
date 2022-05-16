/* eslint-disable react/destructuring-assignment */
import React, { Component, ReactElement } from 'react';
import { render } from '../../../renderer/render';

export function renderExpectToThrow(element: ReactElement, expectedError: string) {
  const errors: Error[] = [];
  class ErrorBoundary extends Component<Record<string, never>, { hasError: boolean }> {
    constructor(props: Record<string, never>) {
      super(props);
      this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
      return { hasError: true };
    }

    componentDidCatch(error: Error) {
      errors.push(error);
    }

    render() {
      if (this.state.hasError) {
        return null;
      }
      return this.props.children;
    }
  }

  try {
    // TODO
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    render(<ErrorBoundary>{element}</ErrorBoundary>, {});
  } catch (e) {
    if (e instanceof Error) {
      errors.push(e);
    }
  }

  expect(errors.length).toBe(1);
  expect(errors[0].message).toContain(expectedError);
}
