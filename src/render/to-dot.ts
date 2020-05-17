/* eslint-disable @typescript-eslint/no-use-before-define */
import { Renderer } from './renderer';
import { Dot } from '../types';

export function toDot(object: Dot): string {
  const renderer = new Renderer();
  return renderer.render(object);
}
