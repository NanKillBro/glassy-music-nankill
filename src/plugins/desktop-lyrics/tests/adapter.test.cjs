const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { stripTypeScriptTypes } = require('node:module');

test('disable during lazy backend import never starts a stale controller', async () => {
  let resolveBackend;
  let starts = 0;
  let opens = 0;
  let stops = 0;
  const module = {
    createDesktopLyrics: () => ({
      start: () => starts++,
      stop: () => stops++,
      open: () => opens++,
      close() {},
    }),
  };
  const source = fs
    .readFileSync(path.join(__dirname, '../index.ts'), 'utf8')
    .replace(/^import[\s\S]*?;\r?\n/gm, '')
    .replace('export default ', 'globalThis.plugin = ')
    .replace("import('./backend')", 'loadBackend()');
  const context = vm.createContext({
    createPlugin: (plugin) => plugin,
    Platform: { Windows: 1, Linux: 4 },
    loadBackend: () =>
      new Promise((resolve) => {
        resolveBackend = resolve;
      }),
  });
  vm.runInContext(stripTypeScriptTypes(source), context);
  const plugin = context.plugin;
  assert.equal(plugin.config.enabled, false);
  assert.equal(plugin.platform, 5);
  const starting = plugin.backend.start({
    window: {},
    getConfig: async () => ({ enabled: true, openAtStartup: true }),
  });
  await new Promise(setImmediate);
  assert.equal(typeof resolveBackend, 'function');
  plugin.backend.stop();
  resolveBackend(module);
  await starting;
  assert.equal(starts, 0);
  context.loadBackend = async () => module;
  await plugin.backend.start({
    window: {},
    getConfig: async () => ({ enabled: true, openAtStartup: false }),
  });
  assert.equal(starts, 1);
  assert.equal(opens, 0);
  plugin.backend.stop();
  assert.equal(stops, 1);
});
