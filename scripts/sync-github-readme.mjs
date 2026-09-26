// Copies the README that `astro build` generated into github-profile/README.md,
// then removes it from dist/ so it is not published on the site.
// Run through `npm run sync`, which builds first.

import { readFile, writeFile, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const built = new URL('dist/github-readme.md', root);
const target = new URL('github-profile/README.md', root);

let markdown;
try {
  markdown = await readFile(built, 'utf8');
} catch {
  console.error('dist/github-readme.md is missing. Run "npm run build" first (or use "npm run sync").');
  process.exit(1);
}

const previous = await readFile(target, 'utf8').catch(() => null);
await writeFile(target, markdown, 'utf8');
await rm(built, { force: true });

const path = fileURLToPath(target);
console.log(previous === markdown ? `No change: ${path}` : `Updated: ${path}`);
console.log('Copy its contents into the README.md of github.com/tunakmynk/tunakmynk.');
