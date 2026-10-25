/** The modules a Playground script can import, by specifier. */
export type ModuleMap = Readonly<Record<string, unknown>>;

export interface Evaluation {
  /** The completion value of the script: the value of its last expression. */
  completion: unknown;
  /** What the script exported (`module.exports`). */
  exports: Record<string, unknown>;
}

/**
 * Run CommonJS JavaScript produced by {@link transpile}.
 *
 * `require` resolves only the specifiers in `modules`; anything else throws.
 * This keeps scripts on the bundled ts-graphviz. It is not a security
 * boundary: the code runs with the page's (in practice the worker's)
 * privileges, and the only code it runs is code the visitor typed.
 */
export function evaluate(code: string, modules: ModuleMap): Evaluation {
  const module = { exports: {} as Record<string, unknown> };
  const require = (specifier: string): unknown => {
    if (Object.hasOwn(modules, specifier)) {
      return modules[specifier];
    }
    const allowed = Object.keys(modules)
      .map((name) => `'${name}'`)
      .join(', ');
    throw new Error(
      `Cannot import '${specifier}'. The Playground can import ${allowed}.`,
    );
  };
  const completion = run(code, require, module.exports, module);
  return { completion, exports: module.exports };
}

// A direct eval, unlike `new Function`, yields the completion value, and it
// sees this function's parameters as the CommonJS module scope.
function run(
  code: string,
  // biome-ignore lint/correctness/noUnusedFunctionParameters: read by the evaluated code
  require: (specifier: string) => unknown,
  // biome-ignore lint/correctness/noUnusedFunctionParameters: read by the evaluated code
  exports: Record<string, unknown>,
  // biome-ignore lint/correctness/noUnusedFunctionParameters: read by the evaluated code
  module: { exports: Record<string, unknown> },
): unknown {
  // biome-ignore lint/security/noGlobalEval: running the visitor's own script is the Playground's purpose
  return eval(code);
}
