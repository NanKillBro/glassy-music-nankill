import { t } from '@/i18n';
import { createPlugin } from '@/utils';

import { DEFAULT_CONFIG } from './constants';
import { onMenu } from './menu';
import {
  onConfigChange,
  onPlayerApiReady,
  onRendererStart,
  onRendererStop,
} from './renderer';
import style from './style.css?inline';

// Keep this file to the literal, type-only imports, and ?inline/?raw assets. Plugin
// index modules are statically imported into the renderer bundle, so any executable
// module scope here runs for every user — and a stray `@/config` reference would drag
// electron-store's node imports in and break the whole renderer script.
export default createPlugin({
  name: () => t('plugins.pitch-shift.name'),
  description: () => t('plugins.pitch-shift.description'),
  restartNeeded: false,
  addedVersion: '3.12.X',
  config: DEFAULT_CONFIG,
  stylesheets: [style],
  menu: onMenu,

  renderer: {
    start: onRendererStart,
    stop: onRendererStop,
    onPlayerApiReady,
    onConfigChange,
  },
});
