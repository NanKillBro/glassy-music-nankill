const { createHash } = require('node:crypto');

// Raw imports embed renderer assets into the existing main build. The small
// sandboxed preload is emitted separately by electron-vite's ?asset handler.
function buildDocument(html, css, script) {
  const hash = (text) => createHash('sha256').update(text).digest('base64');
  return html
    .replace(
      "script-src 'self'; style-src 'self'",
      `script-src 'sha256-${hash(script)}'; style-src 'sha256-${hash(css)}'`,
    )
    .replace(
      '<link rel="stylesheet" href="overlay.css">',
      `<style>${css}</style>`,
    )
    .replace(
      '<script src="overlay.js"></script>',
      `<script>${script}</script>`,
    );
}
module.exports = { buildDocument };
