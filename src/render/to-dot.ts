/* eslint-disable @typescript-eslint/no-use-before-define */
import { Renderer } from './renderer';
import { IContext } from '../types';

export function toDot(object: unknown, context?: IContext): string | undefined {
  const renderer = new Renderer(context);
  return renderer.render(object);
}
