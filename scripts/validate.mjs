import { access, readFile, readdir } from 'node:fs/promises';
import { extname, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const required = [
  'src/index.html', 'src/styles.css', 'src/app.js',
  'src/assets/data/route.json', 'src/assets/data/elevation.json',
  'src/assets/images/diribe-welteji-world-record.jpg',
  'src/assets/images/hobbs-kessler-world-record.jpg',
  'src/assets/images/team-2026.jpg',
  'worker/index.js', 'wrangler.jsonc'
];
for (const file of required) await access(resolve(root, file));
const html = await readFile(resolve(root, 'src/index.html'), 'utf8');
for (const id of ['welcome','reason-1','reason-2','reason-3','reason-4','reason-5','reason-6','reason-7','offer','hero-classics-sequence','classics-sequence','europe-map','course-map']) {
  if (!html.includes(`id="${id}"`)) throw new Error(`Missing #${id}`);
}
for (const word of ['honoured', 'honour', 'Sceptics', 'criterion']) {
  if (!html.includes(word)) throw new Error(`Expected British-English copy marker: ${word}`);
}
for (const removed of ['id="city-calendar"','id="hero-calendar"','photo-slot-tall','class="course-overview"']) {
  if (html.includes(removed)) throw new Error(`Old component still present: ${removed}`);
}
const app = await readFile(resolve(root, 'src/app.js'), 'utf8');
for (const marker of ['dark_nolabels','renderClassicsSequence','initMedalTilt','renderElevation','DISTANCE_COLOURS','The circle continues']) {
  if (!app.includes(marker)) throw new Error(`Missing interaction marker: ${marker}`);
}

const styles = await readFile(resolve(root, 'src/styles.css'), 'utf8');
if (styles.includes('margin-top:-3px')) throw new Error('Negative Classics race-card margin remains.');
for (const marker of ['.label-physics-copy{','justify-content:flex-end','height:900px','.growth-trajectory{']) {
  if (!styles.includes(marker)) throw new Error(`Missing final visual-polish marker: ${marker}`);
}
if (!html.includes('<strong>≈ 342 t</strong>')) throw new Error('Sustainability total is not using the approximate value.');

const files = await readdir(resolve(root, 'src/assets/fonts'));
if (files.some(file => ['.ttf','.otf','.woff','.woff2'].includes(extname(file).toLowerCase()))) {
  throw new Error('Font binaries must not be distributed in the project archive.');
}
console.log('Validation passed.');
