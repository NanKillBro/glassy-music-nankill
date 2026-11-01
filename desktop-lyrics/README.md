# Desktop Lyrics

Optional Windows plugin for Glassy Music. It displays Better Lyrics in a separate transparent window, using the original computed font family, weight and spacing, plus lightweight word-timed opacity animations.

## User behavior

- Disabled by default. Enabling the plugin does not open a window.
- **Plugins → Desktop Lyrics → Show desktop lyrics** opens or focuses the overlay.
- **Hide desktop lyrics**, the close button, or **Alt+Shift+L** hides it without disabling the plugin. The menu or shortcut can reopen it.
- Disabling the plugin closes the overlay, disposes its source bridge, and unregisters its IPC listeners, shortcuts and player event listeners.
- **Open on startup** is a separate, opt-in preference, off by default.
- **Alt+Shift+K** toggles click-through mode. Click-through is unavailable if its recovery shortcut cannot be registered.
- The plugin does not change the main player's minimum size or global preferences.

Better Lyrics must be enabled and its lyrics view loaded. The overlay reuses that view's lyrics; it does not fetch or log songs, start another music player, or communicate with Codex. It is a floating window, not a Windows desktop-shell extension.

The overlay toolbar supports window size presets, font sizing, pinning and returning to the player. Native drag-resizing of transparent windows is deliberately avoided. Window position and font size currently reset when the overlay is closed.

## Integration

`src/plugins/desktop-lyrics/index.ts` uses the existing `createPlugin` backend lifecycle and configuration store. `electron-builder.yml` packages this directory as an extra resource. Development resolves the resources from the project root. No application entry-point patch or dependency additions are required for this source integration.

`runtime.cjs` exports a controller with explicit `start`, `stop`, `open`, `close`, `toggle` and `isOpen` methods. Importing it does not install listeners or start timers. Backend enable/disable calls `start`/`stop`. Opening a window installs the bridge in the player; closing the window removes it. Both operations are idempotent.

The main process validates message senders and bounds text and word data. The local overlay uses a sandboxed preload with context isolation, no Node integration, and a restrictive CSP. It inserts lyrics as text, never as HTML.

## Validation

Run `pnpm test:desktop-lyrics`, or `node --test tests/desktop-lyrics*.test.cjs` directly. These dependency-free tests cover the controller lifecycle, reopening after closing, disabled state, repeated enable/disable, bridge disposal, renderer animation disposal and typography inheritance. Tests use simulated Electron/DOM objects; they do not replace a packaged Windows smoke test.

The application core now builds successfully, and an unpacked Windows package was exercised with the native plugin menu and actual Better Lyrics playback. Project-wide checks were also run and exposed existing failures outside this contribution. See [VALIDATION.md](VALIDATION.md) for the commands, results and packaging limitations.

Word highlighting approximates the original renderer; its full shader, blur and spring-animation pipeline is not duplicated. RAM savings and a fix for any separate Codex memory issue are not claimed.
