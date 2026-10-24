import type { Engine } from '@hpcc-js/wasm-graphviz';
// import { monaco as monaco_editor } from 'monaco-editor';
import CodeBlock from '@theme/CodeBlock';
import TabItem from '@theme/TabItem';
import Tabs from '@theme/Tabs';
import { clsx } from 'clsx';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { OrbitProgress, Riple } from 'react-loading-indicators';

import { Graphviz } from '@site/src/components/Graphviz';
import { useContainer } from '@site/src/contexts/WebContainer';

import Translate, { translate } from '@docusaurus/Translate';
import TSGraphvizLiveEditor from '@site/src/components/TSGraphvizLiveEditor';
import { useGraphviz } from '@site/src/contexts/Graphviz';
import styles from './styles.module.css';

interface Props {
  script: string;
  className?: string;
}

function TSGraphvizPreviewEditor({ script, className }: Props): JSX.Element {
  const [dot, setDot] = useState<string>(null);
  const container = useContainer();
  useEffect(() => {
    if (!dot && container.status === 'ready') {
      container.run(script).then(setDot);
    }
  }, [dot, container.status, container.run, script, setDot]);

  const [tsCode, setTsCode] = useState<string>(script);
  const onChangeCallback = useCallback(
    (value: string) => {
      setTsCode(value);
    },
    [setTsCode],
  );

  const [engine, setEngine] = useState<Engine>('dot');

  const run = useCallback(() => {
    console.log('run', tsCode, container.status);
    if (container.status === 'ready') {
      setDot(null);
      container.run(tsCode).then(setDot);
    }
  }, [container.status, container.run, tsCode, setDot]);
  const graphviz = useGraphviz();
  const version = useMemo(() => graphviz.version, [graphviz]);
  return (
    <div>
      <div className={clsx([styles.container, className])}>
        <div className={styles.editorContainer}>
          <div className={styles.actionMenu}>
            <button
              type="button"
              disabled={container.status !== 'ready'}
              onClick={run}
              className={clsx('button button--primary')}
            >
              <Translate>Run</Translate>
            </button>
          </div>
          <TSGraphvizLiveEditor
            script={script}
            className={styles.editor}
            onMount={() => {}}
            onChange={onChangeCallback}
          />
        </div>
        <div
          className={styles.result}
          style={
            container.status === 'booted' || container.status === 'installing'
              ? {
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }
              : null
          }
        >
          {container.status === 'booted' ||
          container.status === 'installing' ? (
            <OrbitProgress
              color="#3478c6"
              size="medium"
              text="Installing ts-graphviz"
              textColor="white"
              easing="ease-in-out"
            />
          ) : (
            <Tabs className={styles.tabs}>
              <TabItem
                value="image"
                label={translate({ message: 'Image' })}
                default
              >
                {container.status === 'processing' ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Riple color="#3478c6" size="medium" />
                  </div>
                ) : (
                  <>
                    <div className={styles.graphvizHeader}>
                      <label htmlFor="engine">
                        {translate({
                          message: 'Layout Engine:',
                        })}
                        <select
                          id="engine"
                          value={engine}
                          onChange={(e) => setEngine(e.target.value as Engine)}
                        >
                          <option value="dot">dot</option>
                          {/* <option value="cicro">cicro</option> */}
                          <option value="sfdp">sfdp</option>
                          <option value="fdp">fdp</option>
                          <option value="neato">neato</option>
                          <option value="osage">osage</option>
                          <option value="patchwork">patchwork</option>
                          <option value="twopi">twopi</option>
                          <option value="nop">nop</option>
                          <option value="nop2">nop2</option>
                        </select>
                      </label>
                      <p>
                        {translate(
                          {
                            message: 'Graphviz Version: {version}',
                          },
                          { version },
                        )}
                      </p>
                    </div>
                    <Graphviz
                      className={styles.graphviz}
                      dot={dot}
                      engine={engine}
                    />
                  </>
                )}
              </TabItem>
              <TabItem value="dot" label={translate({ message: 'DOT' })}>
                <div className={styles.dot}>
                  {container.status === 'processing' ? (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Riple color="#3478c6" size="medium" />
                    </div>
                  ) : (
                    <CodeBlock language="dot">{dot}</CodeBlock>
                  )}
                </div>
              </TabItem>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(TSGraphvizPreviewEditor);
