export type F<A extends any[], O> = (...args: A) => O;

export type IO<I, O> = F<[I], O>;

function _pipe<T extends any[], R>(
  ...args: [o1: F<T, any>, ...operations: IO<any, any>[]]
): F<T, R> {
  const [o1, ...operations] = args;
  return (...t: T) => operations.reduce((acc, f) => f(acc), o1(...t));
}

export function pipe<I extends any[], O>(f0: F<I, O>): F<I, O>;
export function pipe<I extends any[], T1, O>(
  f0: F<I, T1>,
  f1: IO<T1, O>,
): F<I, O>;
export function pipe<I extends any[], T1, T2, O>(
  f0: F<I, T1>,
  f1: IO<T1, T2>,
  f2: IO<T2, O>,
): F<I, O>;
export function pipe<I extends any[], T1, T2, T3, O>(
  f0: F<I, T1>,
  f1: IO<T1, T2>,
  f2: IO<T2, T3>,
  f3: IO<T3, O>,
): F<I, O>;
export function pipe<I extends any[], T1, T2, T3, T4, O>(
  f0: F<I, T1>,
  f1: IO<T1, T2>,
  f2: IO<T2, T3>,
  f3: IO<T3, T4>,
  f4: IO<T4, O>,
): F<I, O>;
export function pipe<I extends any[], O>(
  o1: F<I, any>,
  ...operations: IO<any, any>[]
): F<I, O> {
  return _pipe(o1, ...operations);
}

const defer =
  <P, A extends any[], R>(fn: (src: P, ...args: A) => R) =>
  (...args: A) =>
  (src: P): R =>
    fn(src, ...args);

const toIterable = <T, TF extends () => IterableIterator<T>>(f: TF) => ({
  [Symbol.iterator]: f,
});

export const map = defer(
  <T, O>(src: Iterable<T>, selector: (item: T) => O): O[] =>
    Array.from(
      toIterable(function* () {
        for (const v of src) {
          yield selector(v);
        }
      }),
    ),
);

export const filter = defer(
  <T>(src: Iterable<T>, pred: (item: T) => boolean): T[] =>
    Array.from(
      toIterable(function* () {
        for (const x of src) {
          if (pred(x)) {
            yield x;
          }
        }
      }),
    ),
);
