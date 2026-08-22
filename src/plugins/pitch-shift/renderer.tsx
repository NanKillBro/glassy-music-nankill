import { createSignal } from 'solid-js';
import { render } from 'solid-js/web';

import { t } from '@/i18n';

import { PitchAudioGraph } from './audio-graph';
import { PitchControl } from './components/pitch-control';
import {
  MAX_SEMITONES,
  MIN_SEMITONES,
  type PitchShiftPluginConfig,
} from './constants';

import type { RendererContext } from '@/types/contexts';
import type { MusicPlayer } from '@/types/music-player';

/**
 * Session state, deliberately not persisted: a key that outlived a restart would
 * silently transpose the next launch with no visible cause. Module scope (the pattern
 * playback-speed uses for its speed) keeps the value across track changes, and the
 * renderer bundle is torn down on reload, so it resets exactly when the app does.
 *
 * Only signals and plain object construction may live at module scope in a plugin's
 * renderer: every plugin is statically imported into the renderer bundle, so anything
 * that runs on import runs whether or not the plugin is enabled.
 */
const [semitones, setSemitones] = createSignal(0);

const graph = new PitchAudioGraph();
const controlContainer = document.createElement('div');
// `contents` keeps the wrapper out of the player bar's flex layout.
controlContainer.style.display = 'contents';

const PLAYER_BAR_SELECTOR = '.right-controls-buttons';
const IPC_SET = 'pitch-shift:set';
const IPC_NUDGE = 'pitch-shift:nudge';

let playerBarObserver: MutationObserver | null = null;
let disposeControl: (() => void) | null = null;
let video: HTMLVideoElement | null = null;
let showControl = true;

/**
 * The signal is the single source of truth, so both entry points go through the
 * setter's updater form — that keeps the menu's relative nudges correct without
 * reading the signal outside a tracked scope.
 */
const commit = (compute: (previous: number) => number) => {
  setSemitones((previous) => {
    const next = Math.round(
      Math.min(Math.max(compute(previous), MIN_SEMITONES), MAX_SEMITONES),
    );
    graph.setSemitones(next);
    return next;
  });
};

export const applySemitones = (value: number) => commit(() => value);
export const nudgeSemitones = (delta: number) =>
  commit((previous) => previous + delta);

/**
 * Bracket keys are the DJ and karaoke convention for key changes, and all three are
 * unbound in YouTube Music. Arrows are deliberately avoided: precise-volume binds
 * ArrowUp and ArrowDown without inspecting modifiers, so even Shift+Arrow would move
 * the volume as well. `event.code` rather than `event.key` means Shift (which turns
 * `[` into `{`) does not change the binding — the choice precise-volume makes too.
 *
 * This lives in the renderer rather than as an Electron menu accelerator because an
 * accelerator fires even while the user is typing, which is what the guards below
 * exist to prevent.
 */
const onKeyDown = (event: KeyboardEvent) => {
  // Modifier combinations belong to Electron's accelerators and to the browser.
  if (event.ctrlKey || event.altKey || event.metaKey) return;

  // Without this the shortcuts transpose the song while a search query is typed.
  const searchBox = document.querySelector<HTMLElement & { opened?: boolean }>(
    'ytmusic-search-box',
  );
  if (searchBox?.opened) return;

  // The search box is the common case, but playlist renaming and comment boxes are
  // text inputs too, and none of them should reach a global shortcut.
  const active = document.activeElement;
  if (
    active instanceof HTMLElement &&
    (active.isContentEditable ||
      active.tagName === 'INPUT' ||
      active.tagName === 'TEXTAREA')
  ) {
    return;
  }

  switch (event.code) {
    case 'BracketRight': {
      event.preventDefault();
      nudgeSemitones(1);
      break;
    }

    case 'BracketLeft': {
      event.preventDefault();
      nudgeSemitones(-1);
      break;
    }

    case 'Backslash': {
      event.preventDefault();
      applySemitones(0);
      break;
    }
  }
};

const attach = (
  source: MediaElementAudioSourceNode | null,
  audioContext: AudioContext | null,
) => {
  // The graph re-applies the current semitone value onto each new node it builds,
  // so there is nothing to follow up with once this settles.
  graph.attach(source, audioContext);
};

const onAudioCanPlay = ({ detail }: CustomEvent<Compressor>) => {
  attach(detail.audioSource, detail.audioContext);
};

/**
 * A seek leaves up to ~60 ms of pre-seek audio in the vocoder's buffers, which would
 * play as a burst from the old position before the new audio arrives.
 */
const onFlushNeeded = () => graph.flush();

const mountControl = () => {
  const playerBar = document.querySelector(PLAYER_BAR_SELECTOR);
  if (!playerBar || playerBar.contains(controlContainer)) return;

  disposeControl ??= render(
    () => (
      <PitchControl
        label={t('plugins.pitch-shift.templates.control')}
        max={MAX_SEMITONES}
        min={MIN_SEMITONES}
        onChange={applySemitones}
        resetLabel={t('plugins.pitch-shift.templates.reset')}
        semitones={semitones()}
      />
    ),
    controlContainer,
  );

  playerBar.prepend(controlContainer);
};

const unmountControl = () => {
  controlContainer.remove();
  disposeControl?.();
  disposeControl = null;
};

// The player bar is re-rendered on navigation, so a one-shot mount does not survive.
const observePlayerBar = () => {
  mountControl();
  playerBarObserver ??= new MutationObserver(() => mountControl());
  playerBarObserver.observe(document.body, { childList: true, subtree: true });
};

const unobservePlayerBar = () => {
  playerBarObserver?.disconnect();
  playerBarObserver = null;
  unmountControl();
};

export const onRendererStart = async (
  context: RendererContext<PitchShiftPluginConfig>,
) => {
  const config = await context.getConfig();
  showControl = config.showPlayerBarControl;
  graph.setPhaseLocking(config.phaseLocking);

  document.addEventListener('peard:audio-can-play', onAudioCanPlay, {
    passive: true,
  });
  window.addEventListener('keydown', onKeyDown);

  // Re-enabled without a track change: splice back into the graph we remembered.
  if (graph.lastSource) attach(graph.lastSource, graph.lastContext);

  context.ipc.on(IPC_SET, (value: number) => applySemitones(value));
  context.ipc.on(IPC_NUDGE, (delta: number) => nudgeSemitones(delta));
};

export const onPlayerApiReady = (playerApi: MusicPlayer) => {
  // The audio graph only exists once playback has started. audio-compressor.ts
  // reloads the current track at its current position to force it into being, which
  // is the established way to pick up an enable that happened mid-song.
  if (playerApi.getPlayerState() === 1 && !graph.lastContext) {
    playerApi.loadVideoById(
      playerApi.getPlayerResponse().videoDetails.videoId,
      playerApi.getCurrentTime(),
      playerApi.getUserPlaybackQualityPreference(),
    );
  }

  video = document.querySelector<HTMLVideoElement>('video');
  video?.addEventListener('seeked', onFlushNeeded, { passive: true });
  video?.addEventListener('peard:src-changed', onFlushNeeded, {
    passive: true,
  });

  if (showControl) observePlayerBar();
};

export const onConfigChange = (config: PitchShiftPluginConfig) => {
  graph.setPhaseLocking(config.phaseLocking);

  if (config.showPlayerBarControl === showControl) return;
  showControl = config.showPlayerBarControl;

  if (showControl) observePlayerBar();
  else unobservePlayerBar();
};

export const onRendererStop = (
  context: RendererContext<PitchShiftPluginConfig>,
) => {
  document.removeEventListener('peard:audio-can-play', onAudioCanPlay);
  window.removeEventListener('keydown', onKeyDown);
  video?.removeEventListener('seeked', onFlushNeeded);
  video?.removeEventListener('peard:src-changed', onFlushNeeded);
  video = null;

  context.ipc.removeAllListeners(IPC_SET);
  context.ipc.removeAllListeners(IPC_NUDGE);

  unobservePlayerBar();

  // Hand the audio back to the direct source → destination line, or disabling the
  // plugin would leave the user in silence until the next track.
  graph.detach();
};
