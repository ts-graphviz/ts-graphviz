import { describe, expect, it } from 'vitest';
import {
  ConversionError,
  InvalidModelError,
  InvalidValueError,
  ResourceLimitError,
  TsGraphvizError,
  UnsupportedEnvironmentError,
} from './errors.js';

describe('error classes', () => {
  it.each([
    InvalidModelError,
    InvalidValueError,
    ConversionError,
    ResourceLimitError,
    UnsupportedEnvironmentError,
  ])('%o is a TsGraphvizError and an Error with its own name', (Cls) => {
    const error = new Cls('why', { cause: 'root' });
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(TsGraphvizError);
    expect(error).toBeInstanceOf(Cls);
    expect(error.name).toBe(Cls.name);
    expect(error.message).toBe('why');
    expect(error.cause).toBe('root');
  });

  it('keeps the name on subclasses defined by users', () => {
    class MyError extends ConversionError {}
    expect(new MyError().name).toBe('MyError');
    expect(new MyError()).toBeInstanceOf(ConversionError);
  });
});
