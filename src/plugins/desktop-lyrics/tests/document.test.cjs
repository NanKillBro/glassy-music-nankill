const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { buildDocument } = require('../document.cjs');

test('bundled document embeds exact renderer bytes with restrictive CSP hashes', () => {
  const read = (name) =>
    fs.readFileSync(path.join(__dirname, '..', name), 'utf8');
  const css = read('overlay.css');
  const script = read('overlay.js');
  const html = buildDocument(read('overlay.html'), css, script);
  const hash = (text) => createHash('sha256').update(text).digest('base64');
  assert.ok(html.includes(`script-src 'sha256-${hash(script)}'`));
  assert.ok(html.includes(`style-src 'sha256-${hash(css)}'`));
  assert.ok(html.includes("default-src 'none'"));
  assert.ok(html.includes(`<script>${script}</script>`));
  assert.ok(html.includes(`<style>${css}</style>`));
  assert.ok(!html.includes('src="overlay.js"'));
  assert.ok(!html.includes('href="overlay.css"'));
  assert.ok(!html.includes("'unsafe-inline'"));
  assert.ok(html.includes('<html lang="en">'));
  assert.ok(!/[áéíóúñ¿]/i.test(read('overlay.html') + script));
});
