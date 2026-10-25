// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { mockMatchMedia } from '../../../test/mocks/match-media';
import TSGraphvizLiveEditor from '.';

// Monaco cannot run in jsdom; a stand-in records what the editor passes it.
const monacoProps = vi.hoisted(() => ({
  current: null as Record<string, unknown> | null,
  byValue: new Map<unknown, Record<string, unknown>>(),
}));
vi.mock('@monaco-editor/react', () => ({
  default: (props: Record<string, unknown>) => {
    monacoProps.current = props;
    monacoProps.byValue.set(props.defaultValue, props);
    return <div data-testid="monaco">{String(props.defaultValue)}</div>;
  },
}));

describe('TSGraphvizLiveEditor on touch devices', () => {
  it('edits in a text area and reports changes', () => {
    mockMatchMedia(['(pointer: coarse)']);
    const onChange = vi.fn();
    render(<TSGraphvizLiveEditor script="digraph('G');" onChange={onChange} />);
    const textarea = screen.getByRole('textbox', { name: 'TypeScript code' });
    expect((textarea as HTMLTextAreaElement).value).toBe("digraph('G');");
    expect(textarea.getAttribute('autocapitalize')).toBe('off');
    expect(textarea.getAttribute('spellcheck')).toBe('false');
    fireEvent.change(textarea, { target: { value: "graph('H');" } });
    expect(onChange).toHaveBeenCalledWith("graph('H');");
    expect(screen.queryByTestId('monaco')).toBeNull();
  });

  it('runs on Ctrl+Enter and Cmd+Enter only', () => {
    mockMatchMedia(['(pointer: coarse)']);
    const onRun = vi.fn();
    render(<TSGraphvizLiveEditor script="" onRun={onRun} />);
    const textarea = screen.getByRole('textbox');
    fireEvent.keyDown(textarea, { key: 'Enter' });
    expect(onRun).not.toHaveBeenCalled();
    fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: true });
    fireEvent.keyDown(textarea, { key: 'Enter', metaKey: true });
    expect(onRun).toHaveBeenCalledTimes(2);
  });

  it('shows read-only code as a code block', () => {
    mockMatchMedia(['(pointer: coarse)']);
    const { container } = render(
      <TSGraphvizLiveEditor script="const x = 1;" readOnly />,
    );
    expect(screen.queryByRole('textbox')).toBeNull();
    expect(container.querySelector('pre')?.textContent).toBe('const x = 1;');
  });
});

describe('TSGraphvizLiveEditor with a mouse', () => {
  it('switches to Monaco once it has mounted, keeping the text', async () => {
    mockMatchMedia([]);
    const onRun = vi.fn();
    const { container } = render(
      <TSGraphvizLiveEditor script="digraph('G');" onRun={onRun} readOnly />,
    );
    const root = container.firstElementChild as HTMLElement;
    // Until Monaco mounts, the code is readable as a code block.
    expect(root.dataset.editor).toBe('plain');
    await screen.findByTestId('monaco');
    const props = monacoProps.current as Record<string, any>;
    expect(props.defaultValue).toBe("digraph('G');");
    expect(props.options.readOnly).toBe(true);
    expect(props.path).toMatch(/^file:\/\/\/[\w-]+\.ts$/);

    // Mount: Ctrl/Cmd+Enter is bound, and the plain view goes away.
    const commands: Array<() => void> = [];
    const editor = {
      getValue: () => "digraph('G');",
      setValue: vi.fn(),
      addCommand: (_key: number, run: () => void) => commands.push(run),
      getContentHeight: () => 120,
      onDidContentSizeChange: () => {},
    };
    const monaco = { KeyMod: { CtrlCmd: 1 }, KeyCode: { Enter: 2 } };
    const { act } = await import('@testing-library/react');
    act(() => props.onMount(editor, monaco));
    expect(root.dataset.editor).toBe('monaco');
    expect(container.querySelector('pre')).toBeNull();
    commands[0]();
    expect(onRun).toHaveBeenCalledOnce();
  });

  it('keeps text typed before Monaco mounted', async () => {
    mockMatchMedia([]);
    const onChange = vi.fn();
    render(<TSGraphvizLiveEditor script="before" onChange={onChange} />);
    // The plain view is editable while Monaco loads.
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'typed' },
    });
    expect(onChange).toHaveBeenCalledWith('typed');
    await screen.findByTestId('monaco');
    const props = monacoProps.byValue.get('before') ?? monacoProps.current;
    const editor = {
      // Monaco was created with the text it had when it started loading.
      getValue: () => 'before',
      setValue: vi.fn(),
      addCommand: () => {},
      getContentHeight: () => 120,
      onDidContentSizeChange: () => {},
    };
    const { act } = await import('@testing-library/react');
    act(() =>
      (props as Record<string, any>).onMount(editor, {
        KeyMod: { CtrlCmd: 1 },
        KeyCode: { Enter: 2 },
      }),
    );
    expect(editor.setValue).toHaveBeenCalledWith('typed');
  });

  it('shows the plain view again until a remounted Monaco is ready', async () => {
    const media = mockMatchMedia([]);
    const { container } = render(<TSGraphvizLiveEditor script="x" readOnly />);
    const root = container.firstElementChild as HTMLElement;
    await screen.findByTestId('monaco');
    const mount = (monacoProps.current as Record<string, any>).onMount;
    const editor = {
      getValue: () => 'x',
      setValue: () => {},
      addCommand: () => {},
      getContentHeight: () => 120,
      onDidContentSizeChange: () => {},
    };
    const monaco = { KeyMod: { CtrlCmd: 1 }, KeyCode: { Enter: 2 } };
    const { act } = await import('@testing-library/react');
    act(() => mount(editor, monaco));
    expect(root.dataset.editor).toBe('monaco');

    act(() => media.setMatching(['(pointer: coarse)']));
    expect(screen.queryByTestId('monaco')).toBeNull();
    expect(root.dataset.editor).toBe('plain');

    act(() => media.setMatching([]));
    await screen.findByTestId('monaco');
    // The new Monaco has not mounted yet: the code stays readable.
    expect(root.dataset.editor).toBe('plain');
    expect(container.querySelector('pre')?.textContent).toBe('x');
  });

  it('gives each editor its own model', async () => {
    mockMatchMedia([]);
    render(
      <>
        <TSGraphvizLiveEditor script="a" />
        <TSGraphvizLiveEditor script="b" />
      </>,
    );
    await vi.waitFor(() =>
      expect(screen.getAllByTestId('monaco')).toHaveLength(2),
    );
    // Monaco shares a model between editors with the same path.
    expect(monacoProps.byValue.get('a')?.path).not.toBe(
      monacoProps.byValue.get('b')?.path,
    );
  });
});
