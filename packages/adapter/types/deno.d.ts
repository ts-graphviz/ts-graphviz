export declare global {
  declare namespace Deno {
    // biome-ignore lint/style/noVar: <explanation>
    declare var open: typeof import('@deno/shim-deno').Deno.open;
    // biome-ignore lint/style/noVar: <explanation>
    declare var errors: typeof import('@deno/shim-deno').Deno.errors;

    declare class Command {
      constructor(
        command: string,
        options: {
          args: string[];
          stdin: 'piped';
          stdout: 'piped';
        },
      );
      spawn(): Deno.Process;
    }
  }
}
