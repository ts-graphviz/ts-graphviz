import { translate } from '@docusaurus/Translate';
import { useColorMode } from '@docusaurus/theme-common';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { COARSE_POINTER, useMediaQuery } from '@site/src/hooks/useMediaQuery';
import CodeBlock from '@theme/CodeBlock';
import clsx from 'clsx';
import type * as Monaco from 'monaco-editor';
import {
  type JSX,
  lazy,
  memo,
  Suspense,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { configureMonaco } from './monaco-setup';
import styles from './styles.module.css';

// Monaco (with its TypeScript service) is large; only fine-pointer devices
// that show an editor download it.
const MonacoEditor = lazy(() => import('@monaco-editor/react'));

interface Props {
  script: string;
  className?: string;
  readOnly?: boolean;
  /**
   * `content` (the default) grows with the code, for code blocks in pages;
   * `fill` takes the height of the container, for the Playground.
   */
  height?: 'content' | 'fill';
  onChange?: (value: string) => void;
  /** Ctrl/Cmd+Enter. */
  onRun?: () => void;
}

const MIN_HEIGHT = 60;
const MAX_HEIGHT = 500;

/**
 * A TypeScript editor for ts-graphviz code.
 *
 * Monaco, with completions and type errors from the ts-graphviz types, on
 * devices with a mouse. On touch devices, and before Monaco loads, a plain
 * text area (or a highlighted code block when read-only) that works with
 * on-screen keyboards and scrolls like the rest of the page.
 */
function TSGraphvizLiveEditor({
  script,
  className,
  readOnly = false,
  height = 'content',
  onChange,
  onRun,
}: Props): JSX.Element {
  const coarse = useMediaQuery(COARSE_POINTER);
  const [value, setValue] = useState(script);
  const [monacoReady, setMonacoReady] = useState(false);
  const change = useCallback(
    (next: string) => {
      setValue(next);
      onChange?.(next);
    },
    [onChange],
  );
  const showMonaco = coarse === false;
  // A Monaco that unmounted (the pointer became coarse) is no longer ready;
  // the next one shows the plain view until it mounts.
  useEffect(() => {
    if (!showMonaco) setMonacoReady(false);
  }, [showMonaco]);

  return (
    <div
      className={clsx(
        className,
        styles.editor,
        height === 'fill' && styles.fill,
      )}
      data-editor={showMonaco && monacoReady ? 'monaco' : 'plain'}
    >
      {showMonaco ? (
        <Suspense fallback={null}>
          <MonacoView
            value={value}
            readOnly={readOnly}
            height={height}
            onChange={change}
            onRun={onRun}
            onReady={() => setMonacoReady(true)}
          />
        </Suspense>
      ) : null}
      {showMonaco && monacoReady ? null : (
        <PlainView
          value={value}
          readOnly={readOnly}
          onChange={change}
          onRun={onRun}
        />
      )}
    </div>
  );
}

function PlainView({
  value,
  readOnly,
  onChange,
  onRun,
}: {
  value: string;
  readOnly: boolean;
  onChange: (value: string) => void;
  onRun?: () => void;
}): JSX.Element {
  if (readOnly) {
    return (
      <CodeBlock language="ts" className={styles.codeBlock}>
        {value}
      </CodeBlock>
    );
  }
  return (
    <textarea
      className={styles.textarea}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
          event.preventDefault();
          onRun?.();
        }
      }}
      aria-label={translate({ message: 'TypeScript code' })}
      spellCheck={false}
      autoCapitalize="off"
      autoComplete="off"
      autoCorrect="off"
      wrap="off"
    />
  );
}

const MONACO_THEMES = { dark: 'vs-dark', light: 'vs' } as const;

function MonacoView({
  value,
  readOnly,
  height,
  onChange,
  onRun,
  onReady,
}: {
  value: string;
  readOnly: boolean;
  height: 'content' | 'fill';
  onChange: (value: string) => void;
  onRun?: () => void;
  onReady: () => void;
}): JSX.Element {
  const { colorMode } = useColorMode();
  const dtsUrl = useBaseUrl('/dts.json');
  const path = `file:///${useId().replace(/[^\w-]/g, '')}.ts`;
  const [contentHeight, setContentHeight] = useState<number | null>(null);
  // Monaco keeps the first command callback; read the latest onRun from a ref.
  const onRunRef = useRef(onRun);
  // Text typed into the plain view while Monaco was loading.
  const valueRef = useRef(value);
  useEffect(() => {
    onRunRef.current = onRun;
    valueRef.current = value;
  }, [onRun, value]);

  return (
    <div
      className={styles.monaco}
      style={height === 'content' ? { height: contentHeight ?? 0 } : undefined}
    >
      <MonacoEditor
        defaultLanguage="typescript"
        defaultValue={value}
        // Monaco shares a model between editors with the same path.
        path={path}
        theme={MONACO_THEMES[colorMode]}
        loading={null}
        beforeMount={(monaco) => configureMonaco(monaco, dtsUrl)}
        onMount={(editor: Monaco.editor.IStandaloneCodeEditor, monaco) => {
          if (editor.getValue() !== valueRef.current) {
            editor.setValue(valueRef.current);
          }
          editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () =>
            onRunRef.current?.(),
          );
          if (height === 'content') {
            const fitHeight = () =>
              setContentHeight(
                Math.min(
                  Math.max(editor.getContentHeight(), MIN_HEIGHT),
                  MAX_HEIGHT,
                ),
              );
            editor.onDidContentSizeChange(fitHeight);
            fitHeight();
          }
          onReady();
        }}
        onChange={(next) => onChange(next ?? '')}
        options={{
          readOnly,
          domReadOnly: readOnly,
          automaticLayout: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          renderLineHighlight: 'none',
          hideCursorInOverviewRuler: true,
          overviewRulerLanes: 0,
          lineDecorationsWidth: 0,
          tabSize: 2,
          fixedOverflowWidgets: true,
          scrollbar: { alwaysConsumeMouseWheel: false },
        }}
      />
    </div>
  );
}

export default memo(TSGraphvizLiveEditor);
