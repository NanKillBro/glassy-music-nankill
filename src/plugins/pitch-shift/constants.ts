import type { PluginConfig } from '@/types/plugins';

export type PitchShiftPluginConfig = {
  enabled: boolean;
  showPlayerBarControl: boolean;
  phaseLocking: boolean;
} & PluginConfig;

export const DEFAULT_CONFIG: PitchShiftPluginConfig = {
  enabled: false,
  showPlayerBarControl: true,
  phaseLocking: true,
};

/** Inclusive bounds for the semitone parameter. */
export const MIN_SEMITONES = -12;
export const MAX_SEMITONES = 12;
