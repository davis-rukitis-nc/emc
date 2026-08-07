import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const required = [
  'src/index.html', 'src/styles.css', 'src/app.js',
  'scripts/build-pages.mjs',
  'src/assets/data/route.json', 'src/assets/data/elevation.json',
  'src/assets/images/diribe-welteji-world-record.jpg',
  'src/assets/images/hobbs-kessler-world-record.jpg',
  'src/assets/images/team-2026.jpg',
  'worker/index.js', 'worker/pages.js', 'wrangler.worker.jsonc'
];
for (const file of required) await access(resolve(root, file));
const html = await readFile(resolve(root, 'src/index.html'), 'utf8');
for (const id of ['welcome','reason-1','reason-2','reason-3','reason-4','reason-5','reason-6','reason-7','offer','classics-sequence','europe-map']) {
  if (!html.includes(`id="${id}"`)) throw new Error(`Missing #${id}`);
}
const fullHtml = await readFile(resolve(root, 'src/full/index.html'), 'utf8');
for (const id of ['hero-classics-sequence', 'classics-sequence', 'europe-map', 'course-map', 'growth-chart', 'kids-chart']) {
  if (!fullHtml.includes(`id="${id}"`)) throw new Error(`Archived proposal is missing #${id}`);
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
const pagesBuild = await readFile(resolve(root, 'scripts/build-pages.mjs'), 'utf8');
if (!pagesBuild.includes("dist/_worker.js")) throw new Error('Pages build does not install the password-protection Worker.');

const styles = await readFile(resolve(root, 'src/styles.css'), 'utf8');
if (styles.includes('margin-top:-3px')) throw new Error('Negative Classics race-card margin remains.');
for (const marker of ['.label-physics-copy{','justify-content:flex-end','height:900px','.growth-trajectory{']) {
  if (!styles.includes(marker)) throw new Error(`Missing final visual-polish marker: ${marker}`);
}
if (!html.includes('<strong>≈ 342 t</strong>')) throw new Error('Sustainability total is not using the approximate value.');

console.log('Validation passed.');
