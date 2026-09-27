/**
 * Shared owner of the Web Audio line that carries the player <video>'s
 * audio from its MediaElementAudioSourceNode to the AudioContext
 * destination.
 *
 * Chromium permits exactly one MediaElementAudioSourceNode per media
 * element: a second createMediaElementSource on the same element throws
 * InvalidStateError, and an existing capture can never be undone or
 * transferred. renderer.ts has already spent the player video's single
 * capture (exposed as window.__blyricsAudio), so any plugin that wants to
 * splice nodes into the player's audio path must reuse that source and
 * coordinate its wiring with everyone else's. This module is that
 * coordination point: an ordered, per-source chain of nodes between the
 * source and the destination, inserted and removed by stable plugin id.
 *
 * Sources enter the registry in two ways:
 * - renderer.ts's own source, seeded via registerMediaSource (smooth-
 *   transitions does this on peard:audio-can-play; crossfade's audio graph
 *   does it from window.__blyricsAudio), and
 * - sources created here by getOrCreateMediaSource for replacement
 *   elements (e.g. after sleep/wake), which register atomically so a
 *   later claim by another plugin reuses them instead of throwing.
 *
 * Migration scope: crossfade and smooth-transitions only. The other
 * graph-rerouting plugins (audio-compressor, equalizer, pitch-shift) keep
 * their own wiring and step-aside policies; while they are enabled the
 * line cannot be claimed by these two, and callers fall back to their
 * element-mode defenses.
 */

type LineState = {
  /** Insertion order of the registered ids. */
  order: string[];
  /** The node each id contributes to the chain. */
  nodes: Map<string, AudioNode>;
};

const lineStates = new WeakMap<MediaElementAudioSourceNode, LineState>();
const elementSources = new WeakMap<
  HTMLVideoElement,
  MediaElementAudioSourceNode
>();

const getState = (source: MediaElementAudioSourceNode): LineState => {
  let state = lineStates.get(source);
  if (!state) {
    state = { order: [], nodes: new Map() };
    lineStates.set(source, state);
  }
  return state;
};

/**
 * Seeds the registry with a source that was already created for `video`
 * (renderer.ts's own capture). Idempotent: the first registration for an
 * element always wins, which is consistent with the one-source-per-element
 * rule — the only source that can ever exist for the element is the one
 * already registered.
 */
export const registerMediaSource = (
  video: HTMLVideoElement,
  source: MediaElementAudioSourceNode,
): void => {
  if (!elementSources.has(video)) {
    elementSources.set(video, source);
  }
};

/**
 * Returns the registered source for `video`, creating (and registering)
 * it first when none exists. Throws the DOM InvalidStateError when the
 * element's single capture was already spent by someone outside this
 * module — callers must try/catch and fall back.
 */
export const getOrCreateMediaSource = (
  video: HTMLVideoElement,
  context: AudioContext,
): MediaElementAudioSourceNode => {
  const existing = elementSources.get(video);
  if (existing) return existing;
  const source = context.createMediaElementSource(video);
  elementSources.set(video, source);
  return source;
};

/**
 * Appends `node` to the ordered chain for `source` under `id`.
 *
 * Inserting an id that is already present replaces the old node in place
 * (same-id re-insert), which is how a plugin re-wires after a re-claim
 * without piling stale nodes into the graph. The tail of the chain always
 * connects to the context destination; the source→destination edge
 * renderer.ts installed is removed by the first successful insert.
 *
 * Every step is wrapped so that a throw leaves the existing line exactly
 * as it was: new edges are created first and the edges they bypass are
 * only disconnected once both connects succeeded. Returns false on any
 * failure.
 */
export const insertLineNode = (
  context: AudioContext,
  source: MediaElementAudioSourceNode,
  id: string,
  node: AudioNode,
): boolean => {
  let state: LineState;
  try {
    state = getState(source);
  } catch {
    return false;
  }

  const existingIndex = state.order.indexOf(id);
  if (existingIndex !== -1 && state.nodes.get(id) === node) {
    return true;
  }

  const destination = context.destination;

  try {
    if (existingIndex === -1) {
      // Append after the current tail — the source itself while the
      // chain is still empty.
      const tailNode =
        state.order.length > 0
          ? state.nodes.get(state.order[state.order.length - 1])
          : undefined;
      const tail: AudioNode = tailNode ?? source;
      node.connect(destination);
      try {
        tail.connect(node);
      } catch {
        try {
          node.disconnect(destination);
        } catch {
          // already detached
        }
        return false;
      }
      try {
        // The bypassed edge may not exist — a source created here for a
        // replacement element starts unconnected.
        tail.disconnect(destination);
      } catch {
        // nothing to remove
      }
      state.order.push(id);
      state.nodes.set(id, node);
      return true;
    }

    // Same-id replace: splice the new node into the old one's position.
    const oldNode = state.nodes.get(id);
    if (!oldNode) return false;
    const previousNode =
      existingIndex > 0
        ? state.nodes.get(state.order[existingIndex - 1])
        : undefined;
    const previous: AudioNode = previousNode ?? source;
    const nextNode =
      existingIndex < state.order.length - 1
        ? state.nodes.get(state.order[existingIndex + 1])
        : undefined;
    const next: AudioNode = nextNode ?? destination;
    node.connect(next);
    try {
      previous.connect(node);
    } catch {
      try {
        node.disconnect(next);
      } catch {
        // already detached
      }
      return false;
    }
    try {
      previous.disconnect(oldNode);
    } catch {
      // nothing to remove
    }
    try {
      oldNode.disconnect();
    } catch {
      // nothing to remove
    }
    state.nodes.set(id, node);
    return true;
  } catch {
    return false;
  }
};

/**
 * Removes the node registered for `id` from the chain for `source`,
 * reconnecting its predecessor directly to its successor — or the
 * destination; or, when the chain empties, restoring the direct
 * source→destination line. Idempotent: removing an id that is not
 * inserted succeeds without touching anything. Returns false only when
 * the bypass edge could not be created, in which case the previous line
 * (through the node) is left fully intact.
 */
export const removeLineNode = (
  context: AudioContext,
  source: MediaElementAudioSourceNode,
  id: string,
): boolean => {
  const state = lineStates.get(source);
  if (!state) return true;
  const index = state.order.indexOf(id);
  if (index === -1) return true;

  const node = state.nodes.get(id);
  if (!node) return true;

  const previousNode =
    index > 0 ? state.nodes.get(state.order[index - 1]) : undefined;
  const previous: AudioNode = previousNode ?? source;
  const nextNode =
    index < state.order.length - 1
      ? state.nodes.get(state.order[index + 1])
      : undefined;
  const next: AudioNode = nextNode ?? context.destination;

  try {
    previous.connect(next);
  } catch {
    return false;
  }
  try {
    previous.disconnect(node);
  } catch {
    // nothing to remove
  }
  try {
    node.disconnect();
  } catch {
    // nothing to remove
  }
  state.order.splice(index, 1);
  state.nodes.delete(id);
  return true;
};
