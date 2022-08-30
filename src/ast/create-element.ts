import { Builder } from './builder.js';

const builder = new Builder();

export const createElement = builder.createElement.bind(builder);
