/* eslint-disable @typescript-eslint/no-use-before-define */
import { Renderer, Dot } from './renderer';

export function toDot(object: Dot): string {
  const renderer = new Renderer();
  return renderer.render(object);
}
