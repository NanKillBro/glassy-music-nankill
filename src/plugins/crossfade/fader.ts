/**
 * VolumeFader
 * Sophisticated Media Volume Fading
 *
 * Requires browser support for:
 * - HTMLMediaElement
 * - requestAnimationFrame()
 * - ES6
 *
 * Does not depend on any third-party library.
 *
 * License: MIT
 *
 * Nick Schwarzenberg
 * v0.2.0, 07/2016
 */

// Internal utility: check if value is a valid volume level and throw if not
const validateVolumeLevel = (value: number) => {
  // Number between 0 and 1?
  if (!Number.isNaN(value) && value >= 0 && value <= 1) {
    // Yup, that's fine
  } else {
    // Abort and throw an exception
    throw new TypeError('Number between 0 and 1 expected as volume!');
  }
};

export type VolumeLogger = <Params extends unknown[]>(
  message: string,
  ...args: Params
) => void;
interface VolumeFaderOptions {
  /**
   * logging `function(stuff, …)` for execution information (default: no logging)
   */
  logger?: VolumeLogger;
  /**
   * either 'linear', 'logarithmic' or a positive number in dB (default: logarithmic)
   */
  fadeScaling?: string | number;
  /**
   * media volume 0…1 to apply during setup (volume not touched by default)
   */
  initialVolume?: number;
  /**
   * time in milliseconds to complete a fade (default: 1000 ms)
   */
  fadeDuration?: number;
}

interface VolumeFade {
  volume: {
    start: number;
    end: number;
  };
  time: {
    start: number;
    end: number;
  };
  callback?: () => void;
}

export interface VolumeControllable {
  volume: number;
}

export type VolumeScale = {
  internalToVolume: (level: number) => number;
  volumeToInternal: (level: number) => number;
};

// Internal: Exponential scaler with dynamic range limit.
//
// @param {Number} input - logarithmic input level to be expanded (float, 0…1)
// @param {Number} dynamicRange - expanded output range, in multiples of 10 dB (float, 0…∞)
// @return {Number} - expanded level (float, 0…1)
const exponentialScaler = (input: number, dynamicRange: number) => {
  // Special case: make zero (or any falsy input) return zero
  if (input === 0) {
    // Since the dynamic range is limited,
    // allow a zero to produce a plain zero instead of a small faction
    // (audio would not be recognized as silent otherwise)
    return 0;
  }

  // Scale 0…1 to minus something × 10 dB
  input = (input - 1) * dynamicRange;

  // Compute power of 10
  return 10 ** input;
};

// Internal: Logarithmic scaler with dynamic range limit.
//
// @param {Number} input - exponential input level to be compressed (float, 0…1)
// @param {Number} dynamicRange - coerced input range, in multiples of 10 dB (float, 0…∞)
// @return {Number} - compressed level (float, 0…1)
const logarithmicScaler = (input: number, dynamicRange: number) => {
  // Special case: make zero (or any falsy input) return zero
  if (input === 0) {
    // Logarithm of zero would be -∞, which would map to zero anyway
    return 0;
  }

  // Compute base-10 logarithm
  input = Math.log10(input);

  // Scale minus something × 10 dB to 0…1 (clipping at 0)
  const scaled = input / dynamicRange;
  return Math.max(1 + scaled, 0);
};

/**
 * Builds the internal ↔ volume mapping that gives a fade its curve shape.
 * Extracted from the VolumeFader constructor so non-element fades (e.g. a
 * Web Audio GainNode ramp) can reproduce the exact same curve from the
 * same fadeScaling setting.
 *
 * @param {String|Number} fadeScaling - 'linear', 'logarithmic',
 * 'equalPower', or a positive number in dB
 * @param {Function} logger - optional logging `function(stuff, …)`
 * @returns {Object} scale with internalToVolume / volumeToInternal
 * @throws {TypeError} if fadeScaling is none of the supported values
 */
export const createFadeScale = (
  fadeScaling?: string | number,
  logger?: VolumeLogger | null,
): VolumeScale => {
  // Linear volume fading?
  if (fadeScaling === 'linear') {
    const scale: VolumeScale = {
      internalToVolume: (level) => level,
      volumeToInternal: (level) => level,
    };

    // Log setting
    logger?.('Using linear fading.');
    return scale;
  }
  // Equal power fading?
  if (fadeScaling === 'equalPower') {
    const scale: VolumeScale = {
      // level 0..1 to volume 0..1 (cos/sin curve)
      internalToVolume: (level) => Math.sin((level * Math.PI) / 2),
      volumeToInternal: (level) => Math.asin(level) / (Math.PI / 2),
    };

    // Log setting
    logger?.('Using equal power fading.');
    return scale;
  }
  // No linear, but logarithmic fading…
  let dynamicRange: number;

  // Default dynamic range?
  if (fadeScaling === undefined || fadeScaling === 'logarithmic') {
    // Set default of 60 dB
    dynamicRange = 3;
  }
  // Custom dynamic range?
  else if (
    typeof fadeScaling === 'number' &&
    !Number.isNaN(fadeScaling) &&
    fadeScaling > 0
  ) {
    // Turn amplitude dB into a multiple of 10 power dB
    dynamicRange = fadeScaling / 2 / 10;
  }
  // Unsupported value
  else {
    // Abort and throw exception
    throw new TypeError(
      "Expected 'linear', 'logarithmic', 'equalPower' or a positive number as fade scaling preference!",
    );
  }

  // Use exponential/logarithmic scaler for expansion/compression
  const scale: VolumeScale = {
    internalToVolume: (level) => exponentialScaler(level, dynamicRange),
    volumeToInternal: (level) => logarithmicScaler(level, dynamicRange),
  };

  // Log setting if not default
  if (fadeScaling) {
    logger?.(
      'Using logarithmic fading with ' +
        String(10 * dynamicRange) +
        ' dB dynamic range.',
    );
  }
  return scale;
};

// Main class
export class VolumeFader {
  private readonly media: VolumeControllable;
  private readonly logger: VolumeLogger | null;
  private scale: VolumeScale;
  private fadeDuration: number = 1000;
  private active: boolean = false;
  private fade: VolumeFade | undefined;
  private rafId: number | null = null;
  private timerId: number | ReturnType<typeof setTimeout> | null = null;

  /**
   * VolumeFader Constructor
   *
   * @param media {VolumeControllable} - object with a volume property to be controlled
   * @param options {Object} - an object with optional settings
   * @throws {TypeError} if options.initialVolume or options.fadeDuration are invalid
   *
   */
  constructor(media: VolumeControllable, options: VolumeFaderOptions) {
    // Passed object has volume property?
    if (media && typeof media.volume !== 'undefined') {
      // Save reference to media element
      this.media = media;
    } else {
      // Abort and throw an exception
      throw new TypeError('Media element with volume property expected!');
    }

    // Make sure options is an object
    options = options || {};

    // Log function passed?
    if (typeof options.logger === 'function') {
      // Set log function to the one specified
      this.logger = options.logger;
    } else {
      // Set log function explicitly to false
      this.logger = null;
    }

    // Build the fade curve shape (throws on unsupported fadeScaling)
    this.scale = createFadeScale(options.fadeScaling, this.logger);

    // Set initial volume?
    if (options.initialVolume !== undefined) {
      // Validate volume level and throw if invalid
      validateVolumeLevel(options.initialVolume);

      // Set initial volume
      this.media.volume = options.initialVolume;

      // Log setting
      this.logger?.('Set initial volume to ' + String(this.media.volume) + '.');
    }

    // Fade duration given?
    if (options.fadeDuration === undefined) {
      // Set default fade duration (1000 ms)
      this.fadeDuration = 1000;
    } else {
      // Try to set given fade duration (will log if successful and throw if not)
      this.setFadeDuration(options.fadeDuration);
    }

    // Indicate that fader is not active yet
    this.active = false;

    // Initialization done
    this.logger?.('Initialized for', this.media);
  }

  private cancelScheduled() {
    if (this.rafId !== null) {
      window.cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.timerId !== null) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  private scheduleNextUpdate() {
    this.cancelScheduled();
    if (!this.active || !this.fade) {
      return;
    }

    const isHidden = typeof document !== 'undefined' && document.hidden;
    const now = Date.now();
    const remainingMs = Math.max(0, this.fade.time.end - now);
    const stepMs = Math.min(20, Math.max(1, remainingMs));

    if (isHidden) {
      // In a background or hidden window, requestAnimationFrame is paused
      // by Chromium. Drive updates via setTimeout instead.
      this.timerId = window.setTimeout(() => {
        this.timerId = null;
        this.updateVolume();
      }, stepMs);
    } else {
      // In a visible window, use requestAnimationFrame for display-synced updates.
      this.rafId = window.requestAnimationFrame(() => {
        this.rafId = null;
        if (this.timerId !== null) {
          window.clearTimeout(this.timerId);
          this.timerId = null;
        }
        this.updateVolume();
      });

      // Fallback timer: if the window is hidden or minimized mid-fade,
      // requestAnimationFrame halts immediately. The fallback timer catches
      // this and resumes the fade via setTimeout without stalling.
      this.timerId = window.setTimeout(() => {
        this.timerId = null;
        if (this.rafId !== null) {
          window.cancelAnimationFrame(this.rafId);
          this.rafId = null;
        }
        this.updateVolume();
      }, stepMs + 20);
    }
  }

  /**
   * Re(start) the update cycle.
   * (this.active must be truthy for volume updates to take effect)
   *
   * @return {Object} VolumeFader instance for chaining
   */
  start() {
    // Set fader to be active
    this.active = true;

    // Start by running the update method
    this.updateVolume();

    // Return instance for chaining
    return this;
  }

  /**
   * Stop the update cycle.
   * (interrupting any fade)
   *
   * @return {Object} VolumeFader instance for chaining
   */
  stop() {
    // Set fader to be inactive
    this.active = false;
    this.cancelScheduled();

    // Return instance for chaining
    return this;
  }

  /**
   * Set fade duration.
   * (used for future calls to fadeTo)
   *
   * @param {Number} fadeDuration - fading length in milliseconds
   * @throws {TypeError} if fadeDuration is not a number greater than zero
   * @return {Object} VolumeFader instance for chaining
   */
  setFadeDuration(fadeDuration: number) {
    // If duration is a valid number > 0…
    if (!Number.isNaN(fadeDuration) && fadeDuration > 0) {
      // Set fade duration
      this.fadeDuration = fadeDuration;

      // Log setting
      this.logger?.('Set fade duration to ' + String(fadeDuration) + ' ms.');
    } else {
      // Abort and throw an exception
      throw new TypeError('Positive number expected as fade duration!');
    }

    // Return instance for chaining
    return this;
  }

  /**
   * Define a new fade and start fading.
   *
   * @param {Number} targetVolume - level to fade to in the range 0…1
   * @param {Function} callback - (optional) function to be called when fade is complete
   * @throws {TypeError} if targetVolume is not in the range 0…1
   * @return {Object} VolumeFader instance for chaining
   */
  fadeTo(targetVolume: number, callback?: () => void) {
    // Validate volume and throw if invalid
    validateVolumeLevel(targetVolume);

    this.cancelScheduled();

    // Define new fade
    this.fade = {
      // Volume start and end point on internal fading scale
      volume: {
        start: this.scale.volumeToInternal(this.media.volume),
        end: this.scale.volumeToInternal(targetVolume),
      },
      // Time start and end point
      time: {
        start: Date.now(),
        end: Date.now() + this.fadeDuration,
      },
      // Optional callback function
      callback,
    };

    // Start fading
    this.start();

    // Log new fade
    this.logger?.('New fade started:', this.fade);

    // Return instance for chaining
    return this;
  }

  /**
   * Cancel the current fade immediately without jumping to the target volume.
   *
   * @return {Object} VolumeFader instance for chaining
   */
  cancelFade() {
    this.active = false;
    this.cancelScheduled();
    this.fade = undefined;
    this.logger?.('Fade canceled.');
    return this;
  }

  // Convenience shorthand methods for common fades
  fadeIn(callback: () => void) {
    this.fadeTo(1, callback);
  }

  fadeOut(callback: () => void) {
    this.fadeTo(0, callback);
  }

  /**
   * Internal: Update media volume.
   * (drives fading across requestAnimationFrame and background timers)
   */
  updateVolume() {
    // Fader active and fade available to process?
    if (this.active && this.fade) {
      // Get current time
      const now = Date.now();

      // Time left for fading?
      if (now < this.fade.time.end) {
        // Compute current fade progress
        const progress =
          (now - this.fade.time.start) /
          (this.fade.time.end - this.fade.time.start);

        // Compute current level on internal scale
        const levelDelta =
          progress * (this.fade.volume.end - this.fade.volume.start);
        const level = this.fade.volume.start + levelDelta;

        // Map fade level to volume level and apply it to media element
        this.media.volume = this.scale.internalToVolume(level);

        // Schedule next update (rAF when visible, setTimeout when hidden/minimized)
        this.scheduleNextUpdate();
      } else {
        // Log end of fade
        this.logger?.('Fade to ' + String(this.fade.volume.end) + ' complete.');

        // Time is up, jump to target volume
        this.media.volume = this.scale.internalToVolume(this.fade.volume.end);

        // Set fader to be inactive
        this.active = false;
        this.cancelScheduled();

        const cb = this.fade.callback;
        this.fade = undefined;

        // Done, call back (if callable)
        if (typeof cb === 'function') cb();
      }
    }
  }
}

export default {
  VolumeFader,
};
