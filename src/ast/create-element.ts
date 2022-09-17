import { Builder, CreateElement } from './builder/index.js';

export const createElement: CreateElement = Builder.prototype.createElement.bind(new Builder());
