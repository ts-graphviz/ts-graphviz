// Each statement below is reported by one of the plugins.
import { execFile, spawn, spawnSync } from 'node:child_process';
import { createWriteStream } from 'node:fs';

declare const Deno: any;
declare function ownOptions<T>(options: T): T;

export function f(options: { a?: number }, props: { b?: string }) {
  const { a } = options;
  const { b } = props;
  spawn('dot', [], { stdio: 'pipe' });
  spawn('dot', { shell: true });
  spawnSync('dot', { shell: true });
  execFile('dot', [], { shell: true }, () => {});
  // only a nested object has a null prototype
  spawn('dot', [], { env: { __proto__: null } as never });
  spawn('dot', [], { shell: true } as never);
  spawn('dot', [], ({ shell: true } as unknown) as never);
  new Deno.Command('dot', { args: [] });
  Deno.open('x', { write: true });
  new ReadableStream({ start() {} });
  createWriteStream('x');
  let c: number | undefined;
  ({ a: c } = options);
  return [a, b, c];
}

export class Unnormalised {
  constructor(private options: { a?: number }) {}
  get a() {
    const { a } = this.options;
    return a;
  }
}

export class Normalised {
  constructor(private options: { a?: number }) {
    this.options = ownOptions(options);
  }
}
