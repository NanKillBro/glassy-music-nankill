import { createSignal } from 'solid-js';
import { render } from 'solid-js/web';

import { t } from '@/i18n';
import {
  isMusicOrVideoTrack,
  isPlayerMenu,
} from '@/plugins/utils/renderer/check';
import { getSongMenu } from '@/providers/dom-elements';

import { PlaybackSpeedSlider } from './components/slider';

import type { PlaybackSpeedPluginConfig } from './index';
import type { RendererContext } from '@/types/contexts';
import type { MusicPlayer } from '@/types/music-player';

const MIN_PLAYBACK_SPEED = 0.07;
const MAX_PLAYBACK_SPEED = 16;

/**
 * Chromium already defaults `preservesPitch` to true, so speed changes keep the
 * original key. Setting it explicitly makes that intentional rather than inherited,
 * and re-asserts it on every rate change in case something else flips it.
 *
 * With it true, this plugin and pitch-shift are independent: Chromium's WSOLA hands
 * the pitch worklet samples that are already pitch-correct, so speed and key can be
 * set separately. (At extreme rates the two stretchers' artifacts compound.)
 */
const applyRateSettings = (videoElement: HTMLVideoElement) => {
  const wantsPreservedPitch = !vinylMode();
  if (videoElement.preservesPitch !== wantsPreservedPitch) {
    videoElement.preservesPitch = wantsPreservedPitch;
  }
  if (videoElement.playbackRate !== speed()) {
    videoElement.playbackRate = speed();
  }
};

const forcePlaybackRate = (e: Event) => {
  if (e.target instanceof HTMLVideoElement) {
    applyRateSettings(e.target);
  }
};

const roundToTwo = (n: number) => Math.round(n * 1e2) / 1e2;

const [speed, setSpeed] = createSignal(1);
const [vinylMode, setVinylMode] = createSignal(false);
const sliderContainer = document.createElement('div');

export const onConfigChange = (newConfig: PlaybackSpeedPluginConfig) => {
  setVinylMode(newConfig.vinylMode);

  const videoElement = document.querySelector<HTMLVideoElement>('video');
  if (videoElement) applyRateSettings(videoElement);
};

export const onPlayerApiReady = async (
  _playerApi: MusicPlayer,
  { getConfig }: RendererContext<PlaybackSpeedPluginConfig>,
) => {
  setVinylMode((await getConfig()).vinylMode);

  const observePopupContainer = () => {
    const updatePlayBackSpeed = () => {
      const videoElement = document.querySelector<HTMLVideoElement>('video');
      if (videoElement) {
        applyRateSettings(videoElement);
      }

      setSpeed(speed());
    };

    render(
      () => (
        <PlaybackSpeedSlider
          onImmediateValueChanged={(e) => {
            let targetSpeed = Number(e.detail.value ?? MIN_PLAYBACK_SPEED);

            if (isNaN(targetSpeed)) {
              targetSpeed = 1;
            }

            targetSpeed = Math.min(
              Math.max(MIN_PLAYBACK_SPEED, targetSpeed),
              MAX_PLAYBACK_SPEED,
            );

            setSpeed(targetSpeed);
            updatePlayBackSpeed();
          }}
          onWheel={(e) => {
            e.preventDefault();

            if (isNaN(speed())) {
              setSpeed(1);
            }

            // E.deltaY < 0 means wheel-up
            setSpeed((prev) =>
              roundToTwo(
                e.deltaY < 0
                  ? Math.min(prev + 0.01, MAX_PLAYBACK_SPEED)
                  : Math.max(prev - 0.01, MIN_PLAYBACK_SPEED),
              ),
            );

            updatePlayBackSpeed();
          }}
          speed={speed()}
          title={t('plugins.playback-speed.templates.button')}
        />
      ),
      sliderContainer,
    );

    const observer = new MutationObserver(() => {
      const menu = getSongMenu();

      if (
        menu &&
        !menu.contains(sliderContainer) &&
        isMusicOrVideoTrack() &&
        isPlayerMenu(menu)
      ) {
        menu.prepend(sliderContainer);
      }
    });

    const popupContainer = document.querySelector('ytmusic-popup-container');
    if (popupContainer) {
      observer.observe(popupContainer, {
        childList: true,
        subtree: true,
      });
    }
  };

  const observeVideo = () => {
    const video = document.querySelector<HTMLVideoElement>('video');
    if (video) {
      video.addEventListener('ratechange', forcePlaybackRate);
      video.addEventListener('peard:src-changed', forcePlaybackRate);
    }
  };

  observePopupContainer();
  observeVideo();
};

export const onUnload = () => {
  const video = document.querySelector<HTMLVideoElement>('video');
  if (video) {
    video.removeEventListener('ratechange', forcePlaybackRate);
    video.removeEventListener('peard:src-changed', forcePlaybackRate);
  }
  getSongMenu()?.removeChild(sliderContainer);
};
