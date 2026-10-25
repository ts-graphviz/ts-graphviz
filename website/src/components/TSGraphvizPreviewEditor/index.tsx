import Translate, { translate } from '@docusaurus/Translate';
import type { Engine } from '@hpcc-js/wasm-graphviz';
import { Graphviz } from '@site/src/components/Graphviz';
import TSGraphvizLiveEditor from '@site/src/components/TSGraphvizLiveEditor';
import { useGraphviz } from '@site/src/contexts/Graphviz';
import type { RunResult } from '@site/src/playground/runtime/protocol';
import { useScriptRunner } from '@site/src/playground/runtime/ScriptRunnerContext';
import CodeBlock from '@theme/CodeBlock';
import TabItem from '@theme/TabItem';
import Tabs from '@theme/Tabs';
import { clsx } from 'clsx';
import {
  type JSX,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import styles from './styles.module.css';

interface Props {
  script: string;
  className?: string;
}

export const ENGINES: readonly Engine[] = [
  'dot',
  'neato',
  'fdp',
  'sfdp',
  'circo',
  'twopi',
  'osage',
  'patchwork',
];

type Output = { state: 'running' } | ({ state: 'done' } & RunResult);

/**
 * The Playground: a ts-graphviz script on one side, the graph it produces
 * on the other (side by side on wide screens, stacked on narrow ones).
 *
 * Needs a ScriptRunnerProvider and a GraphvizProvider above it. The script
 * runs once when the runner is ready, then on Run or Ctrl/Cmd+Enter.
 */
function TSGraphvizPreviewEditor({ script, className }: Props): JSX.Element {
  const runner = useScriptRunner();
  const graphviz = useGraphviz();
  const source = useRef(script);
  const latestRun = useRef(0);
  const [output, setOutput] = useState<Output>({ state: 'running' });
  const [engine, setEngine] = useState<Engine>('dot');

  const run = useCallback(() => {
    if (runner === null) return;
    const id = ++latestRun.current;
    setOutput({ state: 'running' });
    runner.run(source.current).then((result) => {
      // A newer run replaces this one.
      if (id === latestRun.current) setOutput({ state: 'done', ...result });
    });
  }, [runner]);

  useEffect(() => {
    run();
  }, [run]);

  const onChange = useCallback((value: string) => {
    source.current = value;
  }, []);

  const running = runner === null || output.state === 'running';

  return (
    <div className={clsx(styles.playground, className)}>
      <section
        className={styles.editorPane}
        aria-label={translate({ message: 'Script' })}
      >
        <div className={styles.toolbar}>
          <button
            type="button"
            className="button button--primary"
            disabled={runner === null}
            onClick={run}
          >
            <Translate>Run</Translate>
          </button>
          <span className={styles.hint}>
            <kbd>Ctrl</kbd>/<kbd>⌘</kbd> + <kbd>Enter</kbd>
          </span>
        </div>
        <TSGraphvizLiveEditor
          script={script}
          height="fill"
          className={styles.editor}
          onChange={onChange}
          onRun={run}
        />
      </section>
      <section
        className={styles.resultPane}
        aria-label={translate({ message: 'Result' })}
        aria-busy={running}
      >
        {running ? (
          <output className={styles.message}>
            <span className={styles.spinner} aria-hidden="true" />
            <Translate>Running…</Translate>
          </output>
        ) : output.state === 'done' && !output.ok ? (
          <div role="alert" className={styles.error}>
            <strong>{output.error.name}</strong>
            <pre>{output.error.message}</pre>
          </div>
        ) : output.state === 'done' && output.ok ? (
          <Tabs className={styles.tabs} lazy>
            <TabItem
              value="image"
              label={translate({ message: 'Image' })}
              default
            >
              <div className={styles.imageHeader}>
                <label className={styles.engine}>
                  <Translate>Layout engine</Translate>
                  <select
                    value={engine}
                    onChange={(event) =>
                      setEngine(event.target.value as Engine)
                    }
                  >
                    {ENGINES.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </label>
                {graphviz.status === 'ready' ? (
                  <span className={styles.version}>
                    {translate(
                      { message: 'Graphviz {version}' },
                      { version: graphviz.version },
                    )}
                  </span>
                ) : null}
              </div>
              <Graphviz
                className={styles.graph}
                dot={output.dot}
                engine={engine}
              />
            </TabItem>
            <TabItem value="dot" label="DOT">
              <CodeBlock language="dot" className={styles.dot}>
                {output.dot}
              </CodeBlock>
            </TabItem>
          </Tabs>
        ) : null}
      </section>
    </div>
  );
}

export default memo(TSGraphvizPreviewEditor);
