# Validation — November 1, 2026

Tested against base commit `cf935d1f6ef91004e2ec3ec135a7a02a6ef99a24`, on Windows 11, with Node 26.2.0 and Electron 44.9.1.

## Passed

- Frozen root dependency installation, without lifecycle scripts; Electron was installed separately.
- `node --test tests/desktop-lyrics*.test.cjs`: all three test files pass. The simulated controller and bridge each survive 1,000 lifecycle cycles without retaining their tracked listeners/timers/shortcuts. The renderer cancels old animations and unsubscribes on unload.
- `node node_modules/oxlint/bin/oxlint --type-aware src/plugins/desktop-lyrics/index.ts`.
- `node node_modules/oxfmt/bin/oxfmt --check src/plugins/desktop-lyrics/index.ts tests/desktop-lyrics*.test.cjs desktop-lyrics/*.cjs desktop-lyrics/overlay.js`.
- `node tooling/changelog-validate.mjs`.
- `node node_modules/electron-vite/bin/electron-vite.js build`: main, preload and renderer bundles build, including the native plugin adapter.
- Electron Builder unpacked Windows x64 directory packaging, with the runtime and overlay included in `resources/desktop-lyrics`.

## Actual packaged Windows smoke test

Used a separate application/profile inside the validation workspace; the regular installation/profile was not modified by this test.

- Desktop Lyrics starts disabled; no overlay is created.
- Enabling through the native Plugins menu does not automatically create an overlay.
- **Show desktop lyrics** opens the transparent window; the player minimizes.
- Closing the overlay with the window close command leaves the plugin enabled.
- **Show desktop lyrics** reopens a new overlay after closing it.
- Unchecking **Enabled** closes the overlay; the isolated config records `enabled: false`.
- With Better Lyrics and Better Lyrics Shaders enabled, played a public track without signing in. The overlay receives actual word-timed lyrics and the following line, and advances while the player is minimized.

The global reopen shortcut did not reopen the validation window in this session, so its native behavior is not marked passed. A separate Glassy installation was present; shortcut availability/conflicts need a clean single-instance check. The menu fallback works. Simulated tests cover shortcut registration and cleanup.

## Existing project-wide check failures

- Root typecheck reports `src/plugins/precise-volume/index.ts:45`, TS2353: `settings` is not a property of the plugin definition. The same error occurs when Desktop Lyrics is excluded. That file is unchanged by this contribution.
- Root lint reports errors in existing files outside Desktop Lyrics, including import order, quotes and unsafe types.
- Root formatting check reports 36 existing files outside Desktop Lyrics. Those files are unchanged by this contribution.

These failures are reported rather than included as unrelated changes in this PR.

## Scope of the build and remaining verification

The app core and plugin were built from source. The normal prebuild extension synchronization could not run because this environment's shell could not initialize submodules through the normal helper. Pinned extension checkouts were obtained separately. For the Windows smoke package, extension assets were reused from the installed 4.1.1 application; they were not rebuilt from those checkouts. Better Lyrics used its original script, without the separate local metadata-polling experiment.

Packaging used `npmRebuild: false`, the installed Electron distribution, disabled executable signing/editing, and an isolated validation entry point/profile. This validates an unpacked executable, not a signed installer or a complete release build.

Still needed before claiming release readiness: a normal extension/release build in the maintainer's environment, a clean-instance shortcut/startup check, and a sustained playback memory profile. No measured RAM reduction or fix for a separate Codex/ChatGPT memory issue is claimed. Word highlighting remains a lightweight approximation of the original shader/spring pipeline.
