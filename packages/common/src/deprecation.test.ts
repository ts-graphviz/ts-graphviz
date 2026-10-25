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

describe('warnDeprecated', () => {
  it('emits a Node.js DeprecationWarning with the code, once per code', async () => {
    const { warnDeprecated } = await load();
    const emit = vi
      .spyOn(process, 'emitWarning')
      .mockImplementation(() => undefined);
    warnDeprecated('TSG_DEP_PARSE_START_RULE', 'use parseFragment');
    warnDeprecated('TSG_DEP_PARSE_START_RULE', 'use parseFragment');
    expect(emit).toHaveBeenCalledTimes(1);
    expect(emit).toHaveBeenCalledWith('use parseFragment', {
      type: 'DeprecationWarning',
      code: 'TSG_DEP_PARSE_START_RULE',
    });
  });

  it('falls back to console.warn where there is no process.emitWarning (browsers)', async () => {
    const { warnDeprecated } = await load();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const original = process.emitWarning;
    try {
      (process as { emitWarning?: unknown }).emitWarning = undefined;
      warnDeprecated('TSG_DEP_PARSE_START_RULE', 'use parseFragment');
      warnDeprecated('TSG_DEP_PARSE_START_RULE', 'use parseFragment');
    } finally {
      process.emitWarning = original;
    }
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(
      '[TSG_DEP_PARSE_START_RULE] DeprecationWarning: use parseFragment',
    );
  });

  it('codes are unique and prefixed', async () => {
    const { DEPRECATION_CODES } = await load();
    expect(new Set(DEPRECATION_CODES).size).toBe(DEPRECATION_CODES.length);
    for (const code of DEPRECATION_CODES) {
      expect(code).toMatch(/^TSG_DEP_[A-Z_]+$/);
    }
  });
});
