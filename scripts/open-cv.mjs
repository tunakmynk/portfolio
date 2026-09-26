// Opens the print-ready CV page in the browser.
// Runs after `astro dev`, which starts the server in the background and exits.
//
// Astro's own --open flag is a boolean in this version: `astro dev --open /cv`
// makes the dev server fail to start, which is why this script exists.

const path = process.argv[2] ?? '/cv';

/** Astro moves to the next free port when 4321 is taken. */
async function findPort() {
  for (let port = 4321; port <= 4325; port++) {
    try {
      const response = await fetch(`http://localhost:${port}${path}`, {
        signal: AbortSignal.timeout(2000),
      });
      if (response.ok) return port;
    } catch {
      // Nothing listening on this port, or it is not our server. Try the next.
    }
  }
  return null;
}

const port = await findPort();

if (port === null) {
  console.error(`No dev server answering ${path} on ports 4321-4325.`);
  console.error('Start it yourself with "npm run dev", then open the page by hand.');
  process.exit(1);
}

const url = `http://localhost:${port}${path}`;
const { spawn } = await import('node:child_process');

const opener =
  process.platform === 'win32'
    ? ['cmd', ['/c', 'start', '', url]]
    : process.platform === 'darwin'
      ? ['open', [url]]
      : ['xdg-open', [url]];

spawn(opener[0], opener[1], { stdio: 'ignore', detached: true }).unref();

console.log(`\n  ${url}`);
console.log('  Print from the button at the top, save over public/cv/Tuna-Kimyonok-CV.pdf.');
console.log('  Stop the server with: npx astro dev stop\n');
