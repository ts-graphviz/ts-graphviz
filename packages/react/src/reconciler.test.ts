import { describe, expect, it } from 'vitest';
import { createReconciler } from './reconciler.js';

describe('createReconciler()', () => {
  // createRoot passes the arguments of createContainer by position. If an
  // update of react-reconciler changes them, update the call in createRoot
  // and its type in createReconciler together with this test.
  it('has the createContainer signature that createRoot calls', () => {
    const reconciler = createReconciler();
    expect(reconciler.createContainer).toHaveLength(10);
    expect(reconciler.updateContainerSync).toBeTypeOf('function');
    expect(reconciler.flushSyncWork).toBeTypeOf('function');
  });
});
