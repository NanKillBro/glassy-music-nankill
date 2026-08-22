import { t } from '@/i18n';

import {
  MAX_SEMITONES,
  MIN_SEMITONES,
  type PitchShiftPluginConfig,
} from './constants';

import type { MenuTemplate } from '@/menu';
import type { MenuContext } from '@/types/contexts';

/**
 * Every entry is a `normal` item, deliberately — no `radio` marks for the current key.
 *
 * The semitone value is session-only, so it lives in the renderer's module scope
 * rather than in config. Checkmarks would need a main-process mirror kept in step
 * over IPC, and a `refresh()` on every change — including every wheel tick over the
 * player-bar control. The player bar is the authoritative readout; the menu is here
 * to drive it, and stays stateless so the two can never disagree.
 */
export const onMenu = async ({
  window,
  getConfig,
  setConfig,
}: MenuContext<PitchShiftPluginConfig>): Promise<MenuTemplate> => {
  const config = await getConfig();

  const nudge = (delta: number) =>
    window.webContents.send('pitch-shift:nudge', delta);
  const set = (value: number) =>
    window.webContents.send('pitch-shift:set', value);

  const steps: MenuTemplate = [];
  for (let value = MAX_SEMITONES; value >= MIN_SEMITONES; value--) {
    steps.push({
      label:
        value === 0
          ? t('plugins.pitch-shift.menu.original-key')
          : t('plugins.pitch-shift.menu.semitones', {
              value: value > 0 ? `+${value}` : String(value),
            }),
      click: () => set(value),
    });
  }

  return [
    {
      label: t('plugins.pitch-shift.menu.up'),
      click: () => nudge(1),
    },
    {
      label: t('plugins.pitch-shift.menu.down'),
      click: () => nudge(-1),
    },
    {
      label: t('plugins.pitch-shift.menu.reset'),
      click: () => set(0),
    },
    { type: 'separator' },
    {
      label: t('plugins.pitch-shift.menu.set.label'),
      type: 'submenu',
      submenu: steps,
    },
    { type: 'separator' },
    {
      label: t('plugins.pitch-shift.menu.show-player-bar-control'),
      type: 'checkbox',
      checked: config.showPlayerBarControl,
      click: () =>
        setConfig({ showPlayerBarControl: !config.showPlayerBarControl }),
    },
    {
      label: t('plugins.pitch-shift.menu.phase-locking'),
      type: 'checkbox',
      checked: config.phaseLocking,
      click: () => setConfig({ phaseLocking: !config.phaseLocking }),
    },
  ];
};
