import { ReactNode } from 'react';
import createReactReconciler from 'react-reconciler';
import * as gv from 'ts-graphviz';
import { HostConfig } from './host-config';

const hostConfig = new HostConfig();
const reconciler = createReactReconciler(hostConfig);

// export function render(element: ReactNode) {
//   const dot: string = '';
//   const container = reconciler.createContainer(
//     {
//       dot,
//       isGraphviz: true,
//     },
//     true,
//     true,
//   );
//   reconciler.updateContainer(element, container, null, () => console.log('callback'));
// }

export function toDot(element: ReactNode) {
  const containerInfo = {};
  const container = reconciler.createContainer(containerInfo, false, false);
  reconciler.updateContainer(element, container, null, () => console.log('callback'));
  return reconciler.getPublicRootInstance(container);
  // return {
  //   get dot() {
  //     return '';
  //   },
  // };
}
