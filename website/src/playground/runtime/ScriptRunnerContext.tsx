import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { ScriptRunner, type ScriptRunnerOptions } from './runner';

const ScriptRunnerContext = createContext<ScriptRunner | null>(null);

function createWorker() {
  return new Worker(new URL('./worker.ts', import.meta.url), {
    name: 'ts-graphviz-playground',
  });
}

/**
 * Provides a {@link ScriptRunner} to the Playground. The runner (and its
 * worker) exists only in the browser, from mount to unmount.
 */
export function ScriptRunnerProvider({
  children,
  options,
}: {
  children: ReactNode;
  /** Runner options; tests pass a fake worker. */
  options?: Partial<ScriptRunnerOptions>;
}) {
  const [runner, setRunner] = useState<ScriptRunner | null>(null);
  useEffect(() => {
    const instance = new ScriptRunner({ createWorker, ...options });
    setRunner(instance);
    return () => instance.dispose();
  }, [options]);
  return (
    <ScriptRunnerContext.Provider value={runner}>
      {children}
    </ScriptRunnerContext.Provider>
  );
}

/** The runner, or `null` before it is ready (and during server rendering). */
export function useScriptRunner(): ScriptRunner | null {
  return useContext(ScriptRunnerContext);
}
