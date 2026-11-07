# Follow-up to the November 6 review

Addresses [the maintainer's feedback](https://github.com/NanKillBro/glassy-music-nankill/pull/27#issuecomment-6685432131).

- Keep the outgoing active line instead of choosing the last active match, which can be the next line selected early for scrolling. Retain a connected outgoing line across a gap, and wait for a future candidate's start timestamp before replacing it. Reset retained state on track changes and seeks; drop detached lyric nodes.
- Enable the existing platform mask for both Windows and Linux. Linux execution was reported by the maintainer on CachyOS/Hyprland, not independently verified in this Windows environment.
- Add a short line-switch transition using only opacity and translation. At most one transition is retained alongside the word highlights. Cancel it on replacement/unload and release it on completion. Respect reduced-motion preferences.

Validation: the desktop tests cover early activation, the gap after the last word, the next timestamp, seeks and detached nodes. Renderer tests cover 1,000 replacements, bounded animation counts, completion, reduced motion and unload. The previous lifecycle/bridge tests remain passing. Main, preload and renderer build and unpacked Windows packaging pass locally.

The optimized personal Windows build also includes separate Better Lyrics/Shaders metadata and album-color cleanup changes. Those are not part of this PR. Controlled workload tests show fewer metadata reads while retaining the original clock events; this is not a measured reduction in whole-app RAM and is not a Codex leak fix.
