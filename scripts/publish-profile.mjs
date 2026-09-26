// Publishes github-profile/README.md to the GitHub profile repository
// (github.com/<user>/<user>, the one whose README shows on your profile page).
//
// Run it through `npm run sync:profile`, which regenerates the README first.
// It clones into a temp directory, so nothing here touches your working tree.

import { execFileSync } from 'node:child_process';
import { readFile, writeFile, rm, mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const root = new URL('../', import.meta.url);
const source = new URL('github-profile/README.md', root);

/** The profile repo is the one named after the user: github.com/me/me. */
const profileTs = await readFile(new URL('src/data/profile.ts', root), 'utf8');
const user = profileTs.match(/github:\s*'https:\/\/github\.com\/([^'/]+)'/)?.[1];

if (!user) {
  console.error("Could not read the GitHub username from profile.ts (the `github` field).");
  process.exit(1);
}

const repo = `https://github.com/${user}/${user}.git`;
const markdown = await readFile(source, 'utf8');

const workspace = await mkdtemp(join(tmpdir(), 'profile-readme-'));
const git = (...args) => execFileSync('git', ['-C', workspace, ...args], { encoding: 'utf8' });

try {
  execFileSync('git', ['clone', '--depth', '1', '--quiet', repo, workspace], { stdio: 'inherit' });
  await writeFile(join(workspace, 'README.md'), markdown, 'utf8');

  git('add', 'README.md');

  /*
   * Ask the index, not the working tree. Git normalises line endings on the
   * way in, so on Windows a file can look modified in `git status` and still
   * stage as no change at all — which would then fail as an empty commit.
   */
  if (git('diff', '--cached', '--name-only').trim() === '') {
    console.log(`No change: ${user}/${user} already has this README.`);
    process.exit(0);
  }
  git('commit', '--quiet', '-m', 'Update profile README\n\nGenerated from the portfolio by `npm run sync:profile`.');
  git('push', '--quiet', 'origin', 'HEAD');

  console.log(`Published to https://github.com/${user}`);
} finally {
  await rm(workspace, { recursive: true, force: true });
}
