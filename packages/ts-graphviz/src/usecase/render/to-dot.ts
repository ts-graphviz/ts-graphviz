import { Renderer, Dot } from './renderer.js';

export function toDot(object: Dot): string {
  const renderer = new Renderer();
  return renderer.render(object);
}
