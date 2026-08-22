export interface PitchControlProps {
  semitones: number;
  min: number;
  max: number;
  /** Tooltip / accessible name, e.g. "Pitch (semitones)". */
  label: string;
  /** Accessible name for the reset affordance on the readout. */
  resetLabel: string;
  onChange: (semitones: number) => void;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

/**
 * Every handler here uses Solid's `on:` namespace, which attaches a real listener to
 * the element, rather than `onClick`, which Solid delegates to a single listener on
 * `document`. Inside YouTube Music's player bar the delegated form never fires: the
 * click is stopped before it reaches `document`, so the button looks alive — hover
 * still works, it just does nothing. Every other player-bar button in this app
 * (captions-selector, quality-changer, video-toggle) uses `on:click` for this reason.
 */
export const PitchControl = (props: PitchControlProps) => {
  const step = (delta: number) =>
    props.onChange(clamp(props.semitones + delta, props.min, props.max));

  const readout = () =>
    props.semitones > 0 ? `+${props.semitones}` : String(props.semitones);

  return (
    <div
      class="pitch-shift-control"
      on:wheel={(event: WheelEvent) => {
        event.preventDefault();
        step(event.deltaY < 0 ? 1 : -1);
      }}
      role="group"
      title={props.label}
    >
      <button
        aria-label={`${props.label} −1`}
        class="pitch-shift-step"
        disabled={props.semitones <= props.min}
        on:click={() => step(-1)}
        type="button"
      >
        −
      </button>
      <button
        aria-label={props.resetLabel}
        aria-live="polite"
        class="pitch-shift-value"
        classList={{ 'pitch-shift-active': props.semitones !== 0 }}
        on:click={() => props.onChange(0)}
        type="button"
      >
        {readout()}
      </button>
      <button
        aria-label={`${props.label} +1`}
        class="pitch-shift-step"
        disabled={props.semitones >= props.max}
        on:click={() => step(1)}
        type="button"
      >
        +
      </button>
    </div>
  );
};
