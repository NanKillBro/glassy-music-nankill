# Desktop Lyrics

Optional Windows and Linux plugin for Glassy Music. It displays Better Lyrics in a separate transparent window, using the original computed font family, weight and spacing, plus lightweight word-timed opacity animations.

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

Line changes prefer the outgoing active line over an incoming line selected early for scrolling. A connected outgoing line remains visible through a gap and is not replaced by a future-timestamped line. Seeking or changing tracks resets that retained reference. Transitions use a single 200 ms opacity/translation animation, cancelled on replacement, completion and unload; reduced-motion preferences disable it.

## Integration

All plugin code, assets and tests live in `src/plugins/desktop-lyrics/`, following `dev.md`. `index.ts` uses the existing `createPlugin` lifecycle and configuration store. The backend is loaded only when enabled. Vite imports embed the overlay HTML, CSS and JavaScript into the backend bundle and emit its sandboxed preload with `?asset`. No package scripts, builder configuration, extra resources or dependency additions are required.

`runtime.cjs` exports a controller with explicit `start`, `stop`, `open`, `close`, `toggle` and `isOpen` methods. Importing it does not install listeners or start timers. Backend enable/disable calls `start`/`stop`. Opening a window installs the bridge in the player; closing the window removes it. Both operations are idempotent.

The main process validates message senders and bounds text and word data. The overlay uses a sandboxed preload with context isolation and no Node integration. Its CSP allows only the exact bundled CSS/JavaScript hashes, with no network access or `unsafe-inline`. It inserts lyrics as text, never as HTML. Controls and diagnostic messages are in English.

## Tests

Run `node --test src/plugins/desktop-lyrics/tests/*.test.cjs`. Tests cover lifecycle cleanup, reopening, line timing, bounded animations, typography, reduced motion and the bundled document's CSP. Electron/DOM lifecycle tests use simulated objects.

Word highlighting approximates the original renderer; its full shader, blur and spring-animation pipeline is not duplicated. RAM savings and a fix for any separate Codex memory issue are not claimed.
