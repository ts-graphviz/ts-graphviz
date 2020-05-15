/* eslint-disable @typescript-eslint/no-use-before-define */
import { Renderer } from './renderer';
import { IDotContext, Dot } from '../types';

export function toDot(object: Dot, context?: IDotContext): string {
  const renderer = new Renderer(context);
  return renderer.render(object);
}
