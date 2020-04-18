/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable no-console */
/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */
/* eslint-disable prefer-rest-params */

export const Debug = (target: any, name: string, descriptor: PropertyDescriptor) => {
  const delegate = descriptor.value;
  descriptor.value = function debug() {
    const args: string[] = [];
    for (let i = 0; i < arguments.length; i++) {
      args.push(arguments[i]);
    }
    console.log(`${name} in:\n`, args);
    const result = delegate.apply(this, arguments);
    console.log(`${name} out:\n`, result);
    return result;
  };
  return descriptor;
};
