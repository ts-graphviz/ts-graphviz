export const Debug = (target: any, name: string, descriptor: PropertyDescriptor) => {
  const delegate = descriptor.value;
  descriptor.value = function() {
    const args: string[] = [];
    // tslint:disable-next-line: prefer-for-of
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
