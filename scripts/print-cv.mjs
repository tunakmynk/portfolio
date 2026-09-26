// Renders the /cv page to a PDF with headless Chrome and checks it is one page.
//
// Why not print by hand: the CV is tuned to fill a single A4 sheet, and print
// lays out slightly taller than the screen does — a page that measures as
// fitting by a millimetre still breaks in two. This renders the real thing and
// reads the page count out of the PDF, so the answer is never a guess.
//
//   npm run cv:pdf        →  /cv     →  public/cv/Tuna-Kimyonok-CV.pdf
//   npm run cv:pdf:tr     →  /tr/cv  →  public/cv/Tuna-Kimyonok-Ozgecmis.pdf
//
// Takes a language, not a path: a leading-slash argument gets rewritten into a
// Windows path by Git Bash, which is a confusing way to fail.

import { execFileSync } from 'node:child_process';
import { readFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const TARGETS = {
  en: { path: '/cv', output: 'public/cv/Tuna-Kimyonok-CV.pdf' },
  tr: { path: '/tr/cv', output: 'public/cv/Tuna-Kimyonok-Ozgecmis.pdf' },
};

const lang = (process.argv[2] ?? 'en').toLowerCase();
const target = TARGETS[lang];

if (!target) {
  console.error(`Unknown language "${lang}". Use "en" or "tr".`);
  process.exit(1);
}

const { path: pagePath, output } = target;

const CHROME_PATHS = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  `${process.env.LOCALAPPDATA}/Google/Chrome/Application/chrome.exe`,
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
];

async function findChrome() {
  for (const path of CHROME_PATHS) {
    try {
      await access(path);
      return path;
    } catch {
      // Not installed here; try the next one.
    }
  }
  return null;
}

async function findPort() {
  for (let port = 4321; port <= 4325; port++) {
    try {
      const response = await fetch(`http://localhost:${port}${pagePath}`, {
        signal: AbortSignal.timeout(2000),
      });
      if (response.ok) return port;
    } catch {
      // Nothing useful on this port.
    }
  }
  return null;
}

/** Chrome writes an uncompressed page tree, so /Count is readable. */
async function pageCount(file) {
  const bytes = await readFile(file);
  const counts = [...bytes.toString('latin1').matchAll(/\/Count\s+(\d+)/g)].map((m) => Number(m[1]));
  return counts.length > 0 ? Math.max(...counts) : null;
}

const chrome = await findChrome();
if (!chrome) {
  console.error('No Chrome or Edge found. Print the page by hand instead: npm run cv');
  process.exit(1);
}

const port = await findPort();
if (port === null) {
  console.error(`No dev server answering ${pagePath} on ports 4321-4325.`);
  console.error('Run "npm run cv:pdf", which starts one first.');
  process.exit(1);
}

const file = fileURLToPath(new URL(`../${output}`, import.meta.url));

execFileSync(
  chrome,
  [
    '--headless',
    '--disable-gpu',
    '--no-pdf-header-footer',
    `--print-to-pdf=${file}`,
    `http://localhost:${port}${pagePath}`,
  ],
  { stdio: ['ignore', 'ignore', 'ignore'] },
);

const pages = await pageCount(file);
console.log(`\n  Wrote ${output}`);

if (pages === 1) {
  console.log('  One page, as intended.\n');
} else if (pages === null) {
  console.log('  Could not read the page count — open the PDF and check it yourself.\n');
} else {
  console.log(`\n  ${pages} pages — the CV is meant to be one.`);
  console.log('  Lower --density in src/views/CvPage.astro and run this again,');
  console.log('  or cut the weakest bullet if the type is already at about 9pt.\n');
  process.exit(1);
}
