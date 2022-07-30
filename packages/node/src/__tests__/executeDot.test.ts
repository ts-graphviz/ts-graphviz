import { describe } from 'vitest';
// import { executeDot } from '../executeDot.js';
// import { execFile, writeFile } from '../utils.js';

// vi.mock('../utils');
// vi.mock('tmp-promise');

describe.todo('executeDot');

// describe('executeDot', () => {
//   const dot = 'digraph g { a -> b; }';
//   afterEach(() => {
//     vi.clearAllMocks();
//   });

//   test('input can be given as string type', async () => {
//     await executeDot(dot);

//     expect(writeFile).toBeCalledWith(0, dot);
//     expect(execFile).toBeCalledWith('dot', ['/path/to/mock'], {
//       encoding: 'buffer',
//     });
//   });

//   test('output can be specified as an option', async () => {
//     await executeDot(dot, {
//       output: '/path/to/output',
//     });
//     expect(execFile).toBeCalledWith('dot', ['-o', '/path/to/output', '/path/to/mock'], {
//       encoding: 'buffer',
//     });
//   });

//   test('suppress warning messages as an option', async () => {
//     await executeDot(dot, {
//       suppressWarnings: true,
//     });
//     expect(execFile).toBeCalledWith('dot', ['-q', '/path/to/mock'], {
//       encoding: 'buffer',
//     });
//   });

//   test('format can be specified as an option', async () => {
//     await executeDot(dot, {
//       format: 'pdf',
//     });
//     expect(execFile).toBeCalledWith('dot', ['-Tpdf', '/path/to/mock'], {
//       encoding: 'buffer',
//     });
//   });

//   test('output and format can be specified as an option', async () => {
//     await executeDot(dot, {
//       format: 'pdf',
//       output: '/path/to/output',
//     });
//     expect(execFile).toBeCalledWith('dot', ['-Tpdf', '-o', '/path/to/output', '/path/to/mock'], {
//       encoding: 'buffer',
//     });
//   });
// });
