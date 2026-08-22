import workletSource from './pitch-worklet.js?raw';

const PROCESSOR_NAME = 'pitch-shift-processor';

const lazySafeTry = (...fns: (() => void)[]) => {
  for (const fn of fns) {
    try {
      fn();
    } catch {}
  }
};

/**
 * The worklet ships as an inlined string rather than an emitted chunk: the renderer
 * builds as a single IIFE, so there is no stable URL to hand `addModule`. The Blob
 * URL survives because the app strips CSP from every https: response (index.ts).
 */
const addWorkletModule = async (audioContext: AudioContext) => {
  const url = URL.createObjectURL(
    new Blob([workletSource], { type: 'application/javascript' }),
  );
  try {
    await audioContext.audioWorklet.addModule(url);
  } finally {
    URL.revokeObjectURL(url);
  }
};

/**
 * Owns the pitch node's place in the shared audio graph.
 *
 * The app taps YouTube Music's own <video> element, and only one
 * `createMediaElementSource` per element is ever possible, so we reuse the shared
 * source from `peard:audio-can-play` and splice ourselves into it — following
 * audio-compressor.ts, whose WeakMap-and-lazySafeTry discipline this mirrors.
 *
 * The dry path matters more here than for any additive effect. renderer.ts wires
 * `source.connect(destination)` at startup, so simply adding a branch would play the
 * shifted and unshifted audio simultaneously — both keys at once. Every insert must
 * cut the direct line first, and `detach` must put it back.
 */
export class PitchAudioGraph {
  lastSource: MediaElementAudioSourceNode | null = null;
  lastContext: AudioContext | null = null;

  private node: AudioWorkletNode | null = null;
  private semitones = 0;
  private phaseLocking = true;

  private connected = new WeakMap<
    MediaElementAudioSourceNode,
    AudioWorkletNode
  >();
  private moduleLoads = new WeakMap<AudioContext, Promise<void>>();
  /** Serialises attach calls, so back-to-back track changes cannot interleave. */
  private pending: Promise<boolean> = Promise.resolve(false);

  get isAttached() {
    return this.node !== null;
  }

  attach(
    source: MediaElementAudioSourceNode | null,
    audioContext: AudioContext | null,
  ): Promise<boolean> {
    // A rejection here would poison the chain and block every later attach, so the
    // failure is absorbed: the direct source → destination line keeps playing.
    this.pending = this.pending.then(() =>
      this.attachNow(source, audioContext).catch((error: unknown) => {
        console.error('[pitch-shift] attach failed', error);
        return false;
      }),
    );
    return this.pending;
  }

  private async attachNow(
    source: MediaElementAudioSourceNode | null,
    audioContext: AudioContext | null,
  ): Promise<boolean> {
    if (!(source && audioContext)) return false;

    this.lastSource = source;
    this.lastContext = audioContext;

    // Same track re-announced, or a new track on the same graph — nothing to rewire,
    // but the buffers hold pre-seek audio that would burst out on resume.
    const current = this.connected.get(source);
    if (current && current === this.node) {
      this.flush();
      return true;
    }

    let node: AudioWorkletNode;
    try {
      let load = this.moduleLoads.get(audioContext);
      if (!load) {
        load = addWorkletModule(audioContext);
        this.moduleLoads.set(audioContext, load);
      }
      await load;

      node = new AudioWorkletNode(audioContext, PROCESSOR_NAME, {
        numberOfInputs: 1,
        numberOfOutputs: 1,
        // Pinned to stereo so a mono track cannot change the channel count
        // mid-stream, which would reset the vocoder's buffers with a click.
        channelCount: 2,
        channelCountMode: 'explicit',
        channelInterpretation: 'speakers',
        outputChannelCount: [2],
      });
    } catch (error) {
      // A failed load must leave the untouched direct line playing.
      console.error('[pitch-shift] could not create the worklet node', error);
      this.moduleLoads.delete(audioContext);
      return false;
    }

    this.node = node;
    this.applySemitones();
    this.setPhaseLocking(this.phaseLocking);

    if (current) {
      lazySafeTry(
        () => source.disconnect(current),
        () => current.disconnect(audioContext.destination),
      );
    } else {
      lazySafeTry(() => source.disconnect(audioContext.destination));
    }

    try {
      source.connect(node);
      node.connect(audioContext.destination);
      this.connected.set(source, node);
      return true;
    } catch (error) {
      console.error('[pitch-shift] could not insert the worklet node', error);
      // Put the audio back rather than leaving the user in silence.
      lazySafeTry(() => source.connect(audioContext.destination));
      this.node = null;
      return false;
    }
  }

  /** Restore the direct source → destination line renderer.ts set up. */
  detach(): boolean {
    const source = this.lastSource;
    const audioContext = this.lastContext;
    if (!(source && audioContext)) return false;

    const current = this.connected.get(source);
    if (!current) return false;

    lazySafeTry(
      () => source.connect(audioContext.destination),
      () => source.disconnect(current),
      () => current.disconnect(audioContext.destination),
    );
    this.connected.delete(source);
    this.node = null;
    return true;
  }

  setSemitones(value: number) {
    this.semitones = value;
    this.applySemitones();
  }

  private applySemitones() {
    const param = this.node?.parameters.get('pitchSemitones');
    // The worklet glides internally, so a bare assignment is enough — no ramp needed.
    if (param) param.value = this.semitones;
  }

  setPhaseLocking(enabled: boolean) {
    this.phaseLocking = enabled;
    this.node?.port.postMessage({ type: 'phaseLocking', value: enabled });
  }

  /** Drop buffered audio. Required on seek and track change. */
  flush() {
    this.node?.port.postMessage({ type: 'flush' });
  }
}
