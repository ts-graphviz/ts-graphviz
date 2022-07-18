import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import peggy from 'peggy';
import { options } from '../peggy/options.js';

const grammerFile = resolve(process.cwd(), process.argv[2]);
const outputFile = resolve(process.cwd(), process.argv[3]);
const grammer = await readFile(grammerFile, { encoding: 'utf8' });

const parser = peggy.generate(grammer, options);

await writeFile(outputFile, parser);
