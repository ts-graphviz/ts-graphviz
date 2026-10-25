// @vitest-environment jsdom
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { FakeWorker } from '../../../test/fake-worker';
import { mockMatchMedia } from '../../../test/mocks/match-media';
import { ScriptRunnerProvider } from '../../playground/runtime/ScriptRunnerContext';
import TSGraphvizPreviewEditor from '.';

const options = { createWorker: () => new FakeWorker(), timeoutMs: 1000 };
const worker = () => FakeWorker.instances[0];

/** Let the worker answer everything queued, until nothing new is queued. */
async function settle() {
  for (let i = 0; i < 5; i++) {
    await act(async () => {
      worker()?.respondAll();
    });
  }
}

function renderPlayground(script: string) {
  return render(
    <ScriptRunnerProvider options={options}>
      <TSGraphvizPreviewEditor script={script} />
    </ScriptRunnerProvider>,
  );
}

const result = () => screen.getByRole('region', { name: 'Result' });
const showDot = () =>
  fireEvent.click(within(result()).getByRole('tab', { name: 'DOT' }));

beforeAll(() => {
  let n = 0;
  URL.createObjectURL = () => `blob:test/${n++}`;
  URL.revokeObjectURL = () => {};
});
beforeEach(() => {
  FakeWorker.instances = [];
  mockMatchMedia(['(pointer: coarse)']);
});

describe('TSGraphvizPreviewEditor', () => {
  it('runs the script on load and shows the graph', async () => {
    renderPlayground("'digraph { a -> b }'");
    expect(within(result()).getByRole('status').textContent).toContain(
      'Running',
    );
    await settle();
    expect(
      within(result()).getByRole('img', { name: 'Rendered graph' }),
    ).toBeTruthy();
    expect(result().textContent).toContain('Graphviz 99.0.0');
    showDot();
    expect(within(result()).getByText('digraph { a -> b }')).toBeTruthy();
  });

  it('shows that the layout is in progress', async () => {
    renderPlayground("'digraph { a }'");
    await act(async () => {
      worker().respond(); // the script, not yet the layout
    });
    expect(within(result()).getByRole('status').textContent).toContain(
      'Laying out',
    );
    expect(worker().queue).toMatchObject([
      { type: 'layout', dot: 'digraph { a }', engine: 'dot' },
    ]);
  });

  it('runs the edited script on Run', async () => {
    renderPlayground("'digraph { a }'");
    await settle();
    fireEvent.change(screen.getByRole('textbox'), {
      target: {
        value: "import { graph } from 'ts-graphviz'; graph('Edited');",
      },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Run' }));
    expect(result().getAttribute('aria-busy')).toBe('true');
    await settle();
    showDot();
    expect(result().textContent).toContain('graph "Edited" {');
  });

  it('shows script errors', async () => {
    renderPlayground("throw new RangeError('out of range');");
    await settle();
    const alert = within(result()).getByRole('alert');
    expect(alert.textContent).toContain('RangeError');
    expect(alert.textContent).toContain('out of range');
  });

  it('shows layout errors', async () => {
    renderPlayground("'digraph { ! }'");
    await settle();
    expect(within(result()).getByRole('alert').textContent).toBe(
      "Failed to render graph: syntax error near '!'",
    );
    // The DOT is still there to look at.
    showDot();
    expect(result().textContent).toContain('digraph { ! }');
  });

  it('keeps the latest run when an older one answers last', async () => {
    renderPlayground("'digraph { first }'");
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: "'digraph { second }'" },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Run' }));
    });
    const [first, second] = worker().queue;
    expect([first.type, second.type]).toEqual(['run', 'run']);
    await act(async () => {
      worker().respond(second);
    });
    await act(async () => {
      worker().respond(first);
    });
    await settle();
    showDot();
    expect(result().textContent).toContain('second');
    expect(result().textContent).not.toContain('first');
  });

  it('runs on Ctrl+Enter in the editor', async () => {
    renderPlayground("'digraph { a }'");
    await settle();
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: "'digraph { keyboard }'" } });
    fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: true });
    await settle();
    showDot();
    expect(result().textContent).toContain('keyboard');
  });

  it('lays out again with the chosen engine', async () => {
    renderPlayground("'digraph { a }'");
    await settle();
    fireEvent.change(within(result()).getByLabelText('Layout engine'), {
      target: { value: 'circo' },
    });
    expect(worker().queue).toMatchObject([{ type: 'layout', engine: 'circo' }]);
    await settle();
    expect(within(result()).getByRole('img')).toBeTruthy();
  });
});
