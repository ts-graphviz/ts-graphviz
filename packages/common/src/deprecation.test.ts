import diagnosticsChannel from 'node:diagnostics_channel';
import { afterEach, describe, expect, it, vi } from 'vitest';

// Each test loads the module afresh: a code is reported once per module
// instance.
const load = async () => {
  vi.resetModules();
  return import('./deprecation.js');
};

afterEach(() => {
  vi.restoreAllMocks();
});

const CODE = 'TSG_DEP_PARSE_START_RULE' as const;

describe('warnDeprecated', () => {
  it('emits a Node.js DeprecationWarning with the code, once per code', async () => {
    const { warnDeprecated } = await load();
    const emit = vi
      .spyOn(process, 'emitWarning')
      .mockImplementation(() => undefined);
    warnDeprecated(CODE, 'use parseFragment');
    warnDeprecated(CODE, 'use parseFragment');
    expect(emit).toHaveBeenCalledTimes(1);
    expect(emit).toHaveBeenCalledWith('use parseFragment', {
      type: 'DeprecationWarning',
      code: CODE,
    });
  });

  it('notifies listeners, once per code, until they unsubscribe', async () => {
    const { onDeprecation, warnDeprecated } = await load();
    vi.spyOn(process, 'emitWarning').mockImplementation(() => undefined);
    const listener = vi.fn();
    const off = onDeprecation(listener);
    warnDeprecated(CODE, 'use parseFragment');
    warnDeprecated(CODE, 'use parseFragment');
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith({
      code: CODE,
      message: 'use parseFragment',
    });
    off();
    expect(off).not.toThrow();
  });

  it('publishes on the ts-graphviz:deprecation diagnostics channel', async () => {
    const { DEPRECATION_CHANNEL, warnDeprecated } = await load();
    vi.spyOn(process, 'emitWarning').mockImplementation(() => undefined);
    const received: unknown[] = [];
    const subscriber = (message: unknown) => received.push(message);
    diagnosticsChannel.subscribe(DEPRECATION_CHANNEL, subscriber);
    try {
      warnDeprecated(CODE, 'use parseFragment');
    } finally {
      diagnosticsChannel.unsubscribe(DEPRECATION_CHANNEL, subscriber);
    }
    expect(received).toStrictEqual([
      { code: CODE, message: 'use parseFragment' },
    ]);
  });

  it('writes nothing to the console where there is no process (browsers)', async () => {
    const { onDeprecation, warnDeprecated } = await load();
    const warn = vi.spyOn(console, 'warn');
    const error = vi.spyOn(console, 'error');
    const listener = vi.fn();
    onDeprecation(listener);
    vi.stubGlobal('process', undefined);
    try {
      warnDeprecated(CODE, 'use parseFragment');
    } finally {
      vi.unstubAllGlobals();
    }
    expect(listener).toHaveBeenCalledTimes(1);
    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });

  it('does not fail the deprecated call when a listener throws', async () => {
    const { onDeprecation, warnDeprecated } = await load();
    vi.spyOn(process, 'emitWarning').mockImplementation(() => undefined);
    const microtasks = vi
      .spyOn(globalThis, 'queueMicrotask')
      .mockImplementation(() => undefined);
    onDeprecation(() => {
      throw new Error('listener');
    });
    expect(() => warnDeprecated(CODE, 'use parseFragment')).not.toThrow();
    expect(microtasks).toHaveBeenCalledTimes(1);
  });

  it('codes are unique and prefixed', async () => {
    const { DEPRECATION_CODES } = await load();
    expect(new Set(DEPRECATION_CODES).size).toBe(DEPRECATION_CODES.length);
    for (const code of DEPRECATION_CODES) {
      expect(code).toMatch(/^TSG_DEP_[A-Z_]+$/);
    }
  });
});
