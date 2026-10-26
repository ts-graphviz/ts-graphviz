// Nothing below is reported.
import { spawn } from 'node:child_process';

declare function ownOptions<T>(options: T): T;
declare const Deno: any;

export function f(options: { a?: number }) {
  const own = ownOptions(options);
  const { a } = own;
  spawn('dot', [], { __proto__: null, stdio: 'pipe', shell: false } as never);
  new Deno.Command('dot', { __proto__: null, args: [] });
  new ReadableStream({ __proto__: null, start() {} } as never);
  return a;
}

export class C {
  constructor(private options: { a?: number }) {
    this.options = ownOptions(options);
  }
  get a() {
    const { a } = this.options;
    return a;
  }
}
