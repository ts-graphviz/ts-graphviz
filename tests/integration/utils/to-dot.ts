import { pipe } from '../../src/utils/index.js';
import { wrap } from 'jest-snapshot-serializer-raw';
import { toDot as _toDot } from 'ts-graphviz';

export const toDot = pipe(_toDot, wrap);
