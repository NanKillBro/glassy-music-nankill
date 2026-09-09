/**
 * The Glassy merge theme ships as a package: its CSS and the Better Lyrics
 * Shaders background are tuned against each other, so while it is active the
 * shaders extension is pinned to its defaults and its settings are locked.
 *
 * Everything here is plain data and pure functions with no imports — the whole
 * module is safe to pull into the renderer and preload bundles, unlike anything
 * that reaches `@/config`. See the note in `index.ts` about module scope.
 */

export const GLASSY_MERGE_THEME = 'glassy-merge-theme';

/**
 * Written on the music.youtube.com origin by the Better Lyrics preload and read
 * by the shaders content script, which shares that origin's localStorage even
 * from its isolated world. Must stay in sync with `THEME_LOCK_FLAG` in
 * `extensions-src/shaders-glassy/shared/constants/themeLock.ts`.
 */
export const GLASSY_THEME_LOCK_KEY = 'blsGlassyThemeLock';

/**
 * The same signal on the document element. The DOM is shared across every
 * JavaScript world on the page, so this is the channel that does not depend on
 * how storage is partitioned; the two are written together and either one is
 * enough. Matches `THEME_LOCK_ATTRIBUTE` in the extension.
 */
export const GLASSY_THEME_LOCK_ATTRIBUTE = 'data-bls-glassy-lock';

/**
 * Appended to the shaders popup URL so the popup knows it is locked on its very
 * first paint. Must stay in sync with `POPUP_LOCK_HASH` in the same file.
 */
export const POPUP_LOCK_HASH = '#glassy-locked';

/** An unset theme means the default, which is the glassy merge theme. */
export const isGlassyMergeTheme = (activeTheme?: string): boolean =>
  !activeTheme || activeTheme === GLASSY_MERGE_THEME;
