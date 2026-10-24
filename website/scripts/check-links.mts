/**
 * Crawl the built site (`build/`, with the API reference under `build/api/`)
 * and fail on broken internal links, missing assets and images.
 *
 * Docusaurus only checks links between its own routes; this also covers the
 * typedoc pages, static files and everything the pages link to. The build is
 * served the way GitHub Pages serves it (a directory URL without a trailing
 * slash redirects; `index.html` is the directory index). External links are
 * skipped: they depend on other sites and are not this build's concern.
 *
 * Run after `pnpm build` and `pnpm copy-api`: `pnpm check-links`.
 */
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { check } from 'linkinator';

const root = resolve(fileURLToPath(import.meta.url), '..', '..', 'build');
if (!existsSync(join(root, 'index.html'))) {
  throw new Error(`no site build at ${root}; run docusaurus build first`);
}

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.xml': 'application/xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

const server = createServer((request, response) => {
  const url = new URL(request.url ?? '/', 'http://localhost');
  const relative = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, '');
  let file = join(root, relative);
  if (!file.startsWith(root + sep) && file !== root) {
    response.writeHead(403).end();
    return;
  }
  if (existsSync(file) && statSync(file).isDirectory()) {
    if (!url.pathname.endsWith('/')) {
      response.writeHead(301, { location: `${url.pathname}/${url.search}` }).end();
      return;
    }
    file = join(file, 'index.html');
  } else if (!existsSync(file) && existsSync(`${file}.html`)) {
    file = `${file}.html`;
  }
  if (!existsSync(file) || statSync(file).isDirectory()) {
    response.writeHead(404).end();
    return;
  }
  response.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
  createReadStream(file).pipe(response);
});

await new Promise<void>((done) => server.listen(0, '127.0.0.1', done));
const address = server.address();
const base = typeof address === 'object' && address ? `http://127.0.0.1:${address.port}/` : '';

try {
  const result = await check({
    path: base,
    recurse: true,
    concurrency: 50,
    // external links are not checked here
    linksToSkip: ['^https?://(?!127\\.0\\.0\\.1)'],
  });
  const broken = result.links.filter((link) => link.state === 'BROKEN');
  const local = (url?: string) => (url ?? '').replace(base, '/');
  console.log(`checked ${result.links.length} links, ${broken.length} broken`);
  for (const link of broken) {
    console.log(`  [${link.status ?? '???'}] ${local(link.url)}  <- ${local(link.parent)}`);
  }
  process.exitCode = broken.length === 0 ? 0 : 1;
} finally {
  server.close();
}
