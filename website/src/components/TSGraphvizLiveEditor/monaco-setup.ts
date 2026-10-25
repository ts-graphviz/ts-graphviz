import type * as Monaco from 'monaco-editor';

const configured = new WeakSet<object>();

/**
 * Point Monaco's TypeScript service at the ts-graphviz type definitions
 * (`/dts.json`, made by scripts/extract-dts.mts). Every editor on a page
 * shares one Monaco instance, so this runs once per instance.
 */
export function configureMonaco(monaco: typeof Monaco, dtsUrl: string): void {
  if (configured.has(monaco)) return;
  configured.add(monaco);
  const defaults = monaco.languages.typescript.typescriptDefaults;
  defaults.setEagerModelSync(true);
  defaults.setCompilerOptions({
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    target: monaco.languages.typescript.ScriptTarget.ESNext,
    allowNonTsExtensions: true,
    strict: true,
  });
  defaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
  });
  fetch(dtsUrl)
    .then((response) => response.json())
    .then((libs: { content: string; filePath?: string }[]) => {
      defaults.setExtraLibs(libs);
    })
    .catch((error: unknown) => {
      // Editing still works; only completions and type errors are missing.
      console.warn('Could not load the ts-graphviz type definitions', error);
    });
}
