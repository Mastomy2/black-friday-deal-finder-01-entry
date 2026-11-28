// FridayFinds — a Black Friday deal finder entry (Node 22, standard library
// only): the site is this directory's app/ folder, plain static files a
// browser opens at app/index.html (ES modules, CSS, no build step), its 49
// deals held in its own files: nothing it runs, styles or shows loads over
// the network, and each deal links out to its store. The program hands it
// in: it copies app/ and screenshots/ from beside this file to /output and
// writes /output/dossier.json, the summary the judge reads (your
// screenshots, the first load's files and bytes, and your source), with the
// vendored make.fun library. Leave vendor/makefun-frontend.ts as it is: the
// scorer requires dossier.json to be byte for byte what its own copy writes.
//
// Serve it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The gate refuses a screenshot whose long side is over 1280 px, whose short
// side is under 360 px, or that is over 256 KiB: check the files first and
// fail loudly here, while the maker can still retake them, instead of
// handing in an entry the scorer would refuse.
function shotSize(buf) {
  if (buf.length > 24 && buf.readUInt32BE(0) === 0x89504e47) {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }
  if (buf.length > 2 && buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    while (i + 9 < buf.length) {
      if (buf[i] !== 0xff) break;
      const marker = buf[i + 1];
      const len = buf.readUInt16BE(i + 2);
      if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
        return { width: buf.readUInt16BE(i + 7), height: buf.readUInt16BE(i + 5) };
      }
      i += 2 + len;
    }
  }
  return null;
}
const shotsDir = join(here, 'screenshots');
for (const name of readdirSync(shotsDir)) {
  const file = join(shotsDir, name);
  if (!statSync(file).isFile()) continue;
  const buf = readFileSync(file);
  if (buf.length > 262144) throw new Error(`screenshot ${name} is ${buf.length} bytes, over the 256 KiB cap`);
  const size = shotSize(buf);
  if (!size) throw new Error(`screenshot ${name} is not a readable PNG or JPEG`);
  const long = Math.max(size.width, size.height);
  const short = Math.min(size.width, size.height);
  if (long > 1280 || short < 360) {
    throw new Error(`screenshot ${name} is ${size.width}x${size.height}: long side over 1280 or short side under 360`);
  }
}

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes; the others refuse an entry the
// scorer would refuse (more than 4 screenshots or one over 256 KiB; more than 993 files and directories in app/ or
// 16 MiB of app files: app/ counts beside /output's own 1000-entry cap, its screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 16777216 }),
);
