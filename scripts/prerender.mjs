// Prerender the single page into dist/index.html so it is readable without
// JavaScript and paints immediately; the client then hydrates it.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const dist = path.join(root, 'dist');
const ssrEntry = path.join(root, '.cache', 'ssr', 'entry-server.js');

const { render } = await import(pathToFileURL(ssrEntry).href);
const html = render();
const file = path.join(dist, 'index.html');
let page = fs.readFileSync(file, 'utf8');
if (!page.includes('<!--app-html-->')) throw new Error('app placeholder missing');
page = page.replace('<!--app-html-->', html);

// preload the latin Archivo file and the hero image candidates
const assets = fs.readdirSync(path.join(dist, 'assets'));
const font = assets.find((f) => /^archivo-latin-wdth-normal.*\.woff2$/.test(f));
const preloads = [];
if (font) preloads.push(`<link rel="preload" href="/assets/${font}" as="font" type="font/woff2" crossorigin />`);
page = page.replace('<!--preload-->', preloads.join('\n    '));
fs.writeFileSync(file, page);
console.log(`prerendered ${(html.length / 1024).toFixed(1)} KB of HTML into dist/index.html`);
