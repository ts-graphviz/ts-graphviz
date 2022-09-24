export * from './type/index.js';
export * from './attribute/index.js';
export * from './models.js';
export * from './models-context.js';

// NOTE: side effect is needed to prepare the RootModelsContext
import '#lib/core';
