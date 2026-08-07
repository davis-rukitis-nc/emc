import { copyFile } from 'node:fs/promises';
import { resolve } from 'node:path';

await import('./build.mjs');

const root = resolve(import.meta.dirname, '..');
await copyFile(resolve(root, 'worker/pages.js'), resolve(root, 'dist/_worker.js'));

console.log('Added the password-protection Worker for Cloudflare Pages.');
