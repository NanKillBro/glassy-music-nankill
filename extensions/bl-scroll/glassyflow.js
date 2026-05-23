/**
 * ════════════════════════════════════════════════════════════════════════
 *  GlassyFlow v5 — Animation-busy gating + deferred delta
 *                             + configurable scroll delay
 *                             + Dynamic Speedup (timeScale)
 *                             + Dynamic lookBehind and lookAhead
 *                             + Delta-Adaptive LookAhead
 * ════════════════════════════════════════════════════════════════════════
 *
 *  Dựa trên v6.0, thêm cơ chế "scroll delay":
 *
 *  Khi có sự kiện scroll, KHÔNG thực hiện ngay mà đợi một khoảng
 *  thời gian (CFG.scrollDelay, mặc định 200ms). Trong thời gian chờ,
 *  nếu có thêm scroll events thì gộp delta lại và reset timer.
 *  Khi timer hết → thực hiện animation 1 lần với combined delta.
 *
 *  Cơ chế "animation lock" vẫn giữ nguyên:
 *
 *  Vấn đề: Khi BetterLyrics scroll liên tiếp quá nhanh (lyric ngắn),
 *  animation cũ chưa kịp xong → animation mới đè lên → giật/không hoạt động.
 *
 *  Giải pháp:
 *    1. Khi spring animation đang chạy (isAnimationBusy = true):
 *       - Vẫn zero-out BL's FLIP transform (block native FLIP animation)
 *       - Tích lũy delta vào `deferredDelta`
 *       - Dùng container.style.translate để bù scrollTop, giữ nguyên vị trí
 *       - KHÔNG gọi applyStagger → không tạo animation mới
 *
 *    2. Khi đợt scroll TIẾP THEO đến và animation đã xong:
 *       - Gỡ container translate
 *       - Gộp deferredDelta + newDelta → applyStagger(combined)
 *       - Scroll bù 1 lần duy nhất với spring animation mượt
 *
 *  Kết quả: Animation luôn mượt, không conflict, không offset.
 *
 *  [Update v5]: Tự động tính toán lookBehind và lookAhead
 *  Thay vì hardcode số lượng dòng để animate (ví dụ: lookBehind: 5, lookAhead: 9),
 *  phiên bản v5 tính toán kích thước thực tế của viewport (khung nhìn) và kích thước
 *  từng dòng lyrics (offsetHeight). Nhờ đó:
 *   - Các dòng lyrics dài (wrap thành nhiều dòng) sẽ được tính chính xác kích thước.
 *   - Nếu người dùng thay đổi kích thước cửa sổ (resize), script sẽ tự động đo lại
 *     và tính toán lại (invalidate cache) để luôn animate đủ số dòng đang nhìn thấy
 *     cộng thêm 1 dòng đệm (buffer) để tránh bị cắt chữ.
 *
 *  [Delta-Adaptive LookAhead]:
 *  Tự động mở rộng phạm vi dòng được animate (lookAhead) tỷ lệ thuận với
 *  khoảng cách cuộn (scroll delta). Giải quyết triệt để hiện tượng "skip animation"
 *  khi BetterLyrics nhảy qua nhiều dòng cùng lúc (các đoạn hát đồng thanh/nhiều dòng).
 *
 *  [Fast Transition Dynamic Config]:
 *  Phát hiện khoảng cách thời gian giữa dòng lyrics hiện tại và các dòng tiếp theo.
 *  Nếu gap quá ngắn (ví dụ: rap, đồng ca), sẽ tự động áp dụng config riêng
 *  (staggerStep, stiffness, damping, mass) để animation chuyển cảnh nhanh và dứt khoát hơn.
 * ════════════════════════════════════════════════════════════════════════
 */

(function () {
    'use strict';

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     *  SPRING SOLVER — damped harmonic oscillator (ported from AMLL)
     * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

    class Spring {
        constructor(position = 0) {
            this.pos = position;
            this.target = position;
            this._time = 0;
            this._solver = () => position;
            this._getV = () => 0;
            this.stiffness = 120;
            this.damping = 18;
            this.mass = 1;
        }

        _resetSolver() {
            const curV = this._getV(this._time);
            this._time = 0;
            this._solver = _solveSpring(
                this.pos, curV, this.target,
                this.stiffness, this.damping, this.mass
            );
            this._getV = _derivative(this._solver);
        }

        arrived() {
            return (
                Math.abs(this.target - this.pos) < 0.1 &&
                Math.abs(this._getV(this._time)) < 0.1
            );
        }

        setPosition(p) {
            this.pos = p;
            this.target = p;
            this._time = 0;
            this._solver = () => p;
            this._getV = () => 0;
        }

        setTarget(newTarget) {
            if (Math.abs(newTarget - this.target) < 0.01) return;
            this.target = newTarget;
            this._resetSolver();
        }

        nudge(delta) {
            this.pos += delta;
            this._resetSolver();
        }

        update(dt) {
            this._time += dt;
            this.pos = this._solver(this._time);
            if (this.arrived()) {
                this.setPosition(this.target);
            }
            return this.pos;
        }
    }

    function _solveSpring(from, velocity, to, stiffness, damping, mass) {
        const delta = to - from;
        if (damping * damping >= 4.0 * stiffness * mass) {
            const angFreq = -Math.sqrt(stiffness / mass);
            const leftover = -angFreq * delta - velocity;
            return (t) => {
                if (t < 0) return from;
                return to - (delta + t * leftover) * Math.exp(t * angFreq);
            };
        }
        const dampFreq = Math.sqrt(4.0 * mass * stiffness - damping * damping);
        const leftover = (damping * delta - 2.0 * mass * velocity) / dampFreq;
        const dfm = (0.5 * dampFreq) / mass;
        const dm = -(0.5 * damping) / mass;
        return (t) => {
            if (t < 0) return from;
            return (
                to -
                (Math.cos(t * dfm) * delta + Math.sin(t * dfm) * leftover) *
                Math.exp(t * dm)
            );
        };
    }

    function _derivative(fn) {
        const h = 0.001;
        return (t) => (fn(t + h) - fn(t - h)) / (2 * h);
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     *  CONFIG
     * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
    const CFG = {
        staggerStep: 40,
        // lookBehind / lookAhead: computed dynamically — see getLookBehind(), getLookAhead()
        lookBehindRatio: 0.30,  // fraction of visible lines allocated above ref
        lookAheadRatio: 0.70,   // fraction of visible lines allocated below ref
        lookBehindMin: 2,       // minimum lookBehind regardless of viewport
        lookBehindMax: 15,      // maximum lookBehind
        lookAheadMin: 4,        // minimum lookAhead regardless of viewport
        lookAheadMax: 25,       // maximum lookAhead
        minDelta: 2,
        stiffness: 110,
        damping: 15,
        mass: 1,
        scrollDelay: 200,   // ms — delay trước khi thực hiện scroll (0 = không delay)

        // Dynamic Speedup — tăng tốc animation khi cuộn quá nhanh
        speedupThreshold: 100,  // px — ngưỡng deferredDelta để kích hoạt speedup
        speedupScale: 2.5,      // hệ số timeScale khi speedup kích hoạt

        // Delta-Adaptive LookAhead — mở rộng phạm vi animation khi scroll delta lớn
        // Khi chuyển từ 2 dòng lyrics cùng lúc sang 2 dòng tiếp theo, delta lớn hơn
        // bình thường → cần thêm lines vào lookAhead để tránh skip animation.
        deltaAdaptiveEnabled: true,
        avgLineHeightFallback: 48,  // px — fallback nếu không đo được chiều cao dòng

        // Fast Transition Dynamic Config (Gap ngắn)
        fastTransitionEnabled: true,
        fastTransitionThreshold: 1.5, // giây
        fastStaggerStep: 30,          // Stagger nhanh hơn
        fastStiffness: 120,           // Lò xo cứng hơn
        fastDamping: 18,              // Ít ma sát hơn
        fastMass: 1,                // Khối lượng nhẹ hơn
    };

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     *  DYNAMIC LOOK-BEHIND / LOOK-AHEAD
     *
     *  Tính số dòng visible trong viewport rồi phân bổ cho lookBehind
     *  và lookAhead theo tỷ lệ. Cache kết quả 500ms để tránh đo DOM
     *  quá thường xuyên.
     * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
    let _viewportCache = { visibleLines: 14, ts: 0 }; // fallback = 14 lines
    const _VIEWPORT_CACHE_TTL = 500; // ms

    /**
     * _getLineFullHeight — đo chiều cao thực tế đầy đủ của 1 dòng lyrics,
     * bao gồm padding, nội dung translated/romanized, và margin.
     *
     * Với .blyrics--line: đo parent wrapper div (.blyrics-container > div)
     *   → offsetHeight bao gồm: blyrics--line + translated + romanized + padding
     *   → cộng thêm marginTop + marginBottom (CSS margin không nằm trong offsetHeight)
     *
     * Với .blyrics-footer hoặc element khác: đo chính nó + margin.
     */
    function _getLineFullHeight(lineEl) {
        let target;
        if (lineEl.classList.contains('blyrics--line')) {
            // .blyrics--line nằm trong wrapper div → đo wrapper
            target = lineEl.parentElement;
            // Safety: nếu parent là container thay vì wrapper → fallback
            if (!target || target === container) {
                target = lineEl;
            }
        } else {
            // .blyrics-footer hoặc element trực tiếp → đo chính nó
            target = lineEl;
        }

        const oh = target.offsetHeight;
        if (oh <= 0) return 0;
        const style = getComputedStyle(target);
        return oh + parseFloat(style.marginTop) + parseFloat(style.marginBottom);
    }

    function _measureVisibleLines() {
        const now = Date.now();
        if (now - _viewportCache.ts < _VIEWPORT_CACHE_TTL) {
            return _viewportCache.visibleLines;
        }

        if (!container) return _viewportCache.visibleLines;

        // ── Viewport height ──
        // Priority: tab-renderer (BL's actual scroll viewport) → scroll parent → container
        let viewportH = 0;
        const tabRenderer = document.querySelector(
            'ytmusic-tab-renderer[page-type="MUSIC_PAGE_TYPE_TRACK_LYRICS"]'
        );
        if (tabRenderer) {
            viewportH = tabRenderer.clientHeight;
        } else if (scrollParent) {
            viewportH = scrollParent.clientHeight;
        } else {
            viewportH = container.clientHeight;
        }

        // ── Clamp to actually visible area ──
        // Khi #side-panel có padding-top (vd: fullscreen 65px), viewport element
        // có thể tràn ra ngoài cạnh dưới màn hình → diện tích thực tế nhỏ hơn
        // clientHeight. Dùng getBoundingClientRect để clamp chính xác.
        const vpEl = tabRenderer || scrollParent || container;
        if (vpEl) {
            const rect = vpEl.getBoundingClientRect();
            const visibleTop = Math.max(rect.top, 0);
            const visibleBottom = Math.min(rect.bottom, window.innerHeight);
            const actualVisibleH = visibleBottom - visibleTop;
            if (actualVisibleH > 0 && actualVisibleH < viewportH) {
                viewportH = actualVisibleH;
            }
        }

        if (viewportH <= 0) {
            return _viewportCache.visibleLines;
        }

        // ── Count lines that fit in viewport ──
        // Sample lines around current ref → accumulate their ACTUAL heights
        // until we exceed the viewport. This correctly handles long/wrapped lines.
        const lines = container.querySelectorAll('.blyrics--line, .blyrics-footer');
        if (!lines.length) return _viewportCache.visibleLines;

        const allLines = Array.from(lines);
        const ref = getRefIndex(allLines);

        let debugHeights = []; // Dùng để log thông tin debug

        // Count forward from ref (how many lines fit below)
        let accH = 0, countFwd = 0;
        for (let i = ref; i < allLines.length; i++) {
            const h = _getLineFullHeight(allLines[i]);
            if (h <= 0) continue;
            debugHeights.push(`[${i}]: ${h.toFixed(1)}px`);
            countFwd++;          // count BEFORE overflow check → partially visible lines included
            accH += h;
            if (accH >= viewportH) break;
        }

        // Count backward from ref (how many lines fit above)
        accH = 0;
        let countBwd = 0;
        for (let i = ref - 1; i >= 0; i--) {
            const h = _getLineFullHeight(allLines[i]);
            if (h <= 0) continue;
            debugHeights.unshift(`[${i}]: ${h.toFixed(1)}px`);
            countBwd++;          // count BEFORE overflow check
            accH += h;
            if (accH >= viewportH) break;
        }

        // +1 buffer on each direction to cover edge lines that just enter the viewport
        const visible = Math.max(countFwd, countBwd + 1, 4);

        if (_viewportCache.visibleLines !== visible || _viewportCache.ts === 0) {
            const lb = Math.max(CFG.lookBehindMin, Math.min(CFG.lookBehindMax, Math.round(visible * CFG.lookBehindRatio)));
            const la = Math.max(CFG.lookAheadMin, Math.min(CFG.lookAheadMax, Math.round(visible * CFG.lookAheadRatio)));
            console.info(`[GlassyFlow v5] 📏 Viewport Measurement:
  - Viewport Height: ${viewportH.toFixed(1)}px
  - Measured Lines (around ref ${ref}): ${debugHeights.join(', ')}
  - Result: ~${visible} visible lines (lookBehind: ${lb}, lookAhead: ${la})`);
        }

        _viewportCache = { visibleLines: visible, ts: now };
        return visible;
    }

    function getLookBehind() {
        const v = _measureVisibleLines();
        const raw = Math.round(v * CFG.lookBehindRatio);
        return Math.max(CFG.lookBehindMin, Math.min(CFG.lookBehindMax, raw));
    }

    function getLookAhead() {
        const v = _measureVisibleLines();
        const raw = Math.round(v * CFG.lookAheadRatio);
        return Math.max(CFG.lookAheadMin, Math.min(CFG.lookAheadMax, raw));
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     *  DELTA-ADAPTIVE LOOKAHEAD HELPER
     *
     *  Ước tính chiều cao trung bình của lyrics lines bằng cách sample
     *  ~5 dòng xung quanh ref. Dùng để tính số extra lines cần thêm
     *  vào lookAhead khi scroll delta lớn.
     * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
    let _avgLineHeightCache = { value: 48, ts: 0 };

    function _estimateAvgLineHeight(lines, ref) {
        const now = Date.now();
        // Reuse viewport cache TTL to avoid extra DOM reads
        if (now - _avgLineHeightCache.ts < _VIEWPORT_CACHE_TTL) {
            return _avgLineHeightCache.value;
        }

        let totalH = 0, count = 0;
        const sampleStart = Math.max(0, ref - 2);
        const sampleEnd = Math.min(lines.length, ref + 3);
        for (let i = sampleStart; i < sampleEnd; i++) {
            const h = _getLineFullHeight(lines[i]);
            if (h > 0) { totalH += h; count++; }
        }

        const avg = count > 0 ? totalH / count : CFG.avgLineHeightFallback;
        _avgLineHeightCache = { value: avg, ts: now };
        return avg;
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     *  FAST TRANSITION CHECKER
     * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
    function _checkFastTransition(lines, ref) {
        if (!CFG.fastTransitionEnabled) return false;

        if (ref + 1 < lines.length) {
            const time1 = parseFloat(lines[ref].getAttribute('data-time') || 0);
            const time2 = parseFloat(lines[ref + 1].getAttribute('data-time') || 0);

            if (time2 - time1 > 0 && time2 - time1 < CFG.fastTransitionThreshold) {
                return true;
            }

            // Check gap between ref+1 and ref+2 to prepare early
            if (ref + 2 < lines.length) {
                const time3 = parseFloat(lines[ref + 2].getAttribute('data-time') || 0);
                if (time3 - time2 > 0 && time3 - time2 < CFG.fastTransitionThreshold) {
                    return true;
                }
            }
        }
        return false;
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     *  STATE
     * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
    let container = null;
    let pendingDelta = 0;
    let domObserver = null;
    let styleObserver = null;
    let isScriptEnabled = true;
    let resizeTimer = null;
    let suppressTransform = false;
    let lastFlipTime = 0;

    // v3: Deferred delta — tích lũy scroll bị defer khi animation busy
    let deferredDelta = 0;
    let isAnimationBusy = false;

    // v3.1: Scroll delay — timer chờ trước khi thực hiện scroll
    let scrollDelayTimer = null;
    let delayedDelta = 0;

    // v3.2: Dynamic Speedup — tua nhanh spring physics khi cuộn quá nhanh
    // timeScale nhân vào dt trong springLoop, giúp spring đuổi kịp tiến độ
    // mà KHÔNG hủy animation đang chạy.
    let timeScale = 1.0;
    let lastRefIndex = -1;  // refIndex lần cuối, dùng để phát hiện nhảy >= 2 dòng

    const lineSprings = new WeakMap();
    let rafId = null;
    let lastFrameTs = 0;
    let activeLines = new Set();

    // v4: No-sync detection — tự disable khi lyrics tĩnh
    let isNoSyncMode = false;
    let noSyncClassObserver = null;

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     *  HELPERS
     * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
    function setScrollOverride(enabled) {
        if (!container) return;
        if (enabled) {
            container.style.setProperty('--blyrics-lyric-scroll-duration', '0ms', 'important');
        } else {
            container.style.removeProperty('--blyrics-lyric-scroll-duration');
        }
    }

    function parseTranslateY(val) {
        if (!val || val === 'none') return 0;
        const m = val.match(/translate\(\s*-?[\d.]+px\s*,\s*(-?[\d.]+)px\s*\)/);
        if (m) return parseFloat(m[1]);
        const m2 = val.match(/translateY\(\s*(-?[\d.]+)px\s*\)/);
        if (m2) return parseFloat(m2[1]);
        return 0;
    }

    function getLines() {
        if (!container) return [];
        return Array.from(container.querySelectorAll('.blyrics--line, .blyrics-footer'));
    }

    function getRefIndex(lines) {
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].classList.contains('blyrics--animating')) return i;
        }
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].classList.contains('blyrics--pre-animating')) return i;
        }
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].classList.contains('blyrics-current-lyric')) return i;
        }
        return Math.floor(lines.length / 5);
    }

    function getOrCreateSpring(line) {
        let data = lineSprings.get(line);
        if (!data) {
            data = {
                spring: new Spring(0),
                releaseDelay: 0,
                released: true,
            };
            data.spring.stiffness = CFG.stiffness;
            data.spring.damping = CFG.damping;
            data.spring.mass = CFG.mass;
            lineSprings.set(line, data);
        }
        return data;
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     *  v3: CONTAINER TRANSLATE — giữ nguyên vị trí khi defer
     *
     *  Khi BL set scrollTop nhưng ta defer animation, dùng
     *  container.style.translate (CSS translate property, TÁCH BIỆT với
     *  transform) để bù lại scrollTop change → lines không nhúc nhích.
     *
     *  Khi flush (đợt scroll tiếp theo), gỡ container translate và
     *  chuyển sang per-line spring animation.
     * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
    function setContainerCompensation(delta) {
        if (!container) return;
        if (Math.abs(delta) < 0.5) {
            container.style.translate = '';
        } else {
            container.style.translate = `0px ${delta}px`;
        }
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     *  rAF ANIMATION LOOP
     *
     *  v3: Khi tất cả spring arrived → đánh dấu not busy.
     *  KHÔNG auto-flush deferredDelta — đợi đợt scroll tiếp theo.
     * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
    function springLoop(timestamp) {
        if (!isScriptEnabled || activeLines.size === 0) {
            rafId = null;
            lastFrameTs = 0;
            isAnimationBusy = false;
            timeScale = 1.0; // Reset speedup khi không còn animation
            return;
        }

        if (lastFrameTs === 0) lastFrameTs = timestamp;
        const dtMs = Math.min(timestamp - lastFrameTs, 32);

        // ── Dynamic Speedup: nhân timeScale vào dt ──
        // Khi timeScale > 1, spring physics chạy nhanh hơn thực tế,
        // giúp animation "đuổi kịp" khi user cuộn quá nhanh.
        const dt = (dtMs / 1000) * timeScale;

        lastFrameTs = timestamp;

        const toRemove = [];

        for (const line of activeLines) {
            const data = lineSprings.get(line);
            if (!data) { toRemove.push(line); continue; }

            if (!data.released) {
                // releaseDelay cũng được tua nhanh theo timeScale
                data.releaseDelay -= dtMs * timeScale;
                if (data.releaseDelay <= 0) {
                    data.released = true;
                    data.spring.setTarget(0);
                } else {
                    continue;
                }
            }

            const y = data.spring.update(dt);
            line.style.translate = `0px ${(y * 2 + 0.5 | 0) / 2}px`;

            if (data.spring.arrived()) {
                line.style.translate = '';
                line.style.willChange = '';
                toRemove.push(line);
            }
        }

        for (const line of toRemove) {
            activeLines.delete(line);
        }

        if (activeLines.size > 0) {
            rafId = requestAnimationFrame(springLoop);
        } else {
            rafId = null;
            lastFrameTs = 0;
            isAnimationBusy = false;

            // ── Reset timeScale khi tất cả spring đã settled ──
            if (timeScale !== 1.0) {
                console.info(
                    `[GlassyFlow v5] ⚡ Speedup reset — timeScale ${timeScale} → 1.0`
                );
                timeScale = 1.0;
            }
            // v3: KHÔNG flush ở đây — đợi đợt scroll tiếp theo
        }
    }

    function ensureLoopRunning() {
        if (rafId === null && activeLines.size > 0) {
            lastFrameTs = 0;
            rafId = requestAnimationFrame(springLoop);
        }
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     *  APPLY STAGGER — khởi tạo spring target cho mỗi dòng
     * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
    function applyStagger(delta) {
        if (!isScriptEnabled || Math.abs(delta) < CFG.minDelta) return;

        const lines = getLines();
        if (!lines.length) return;

        const ref = getRefIndex(lines);
        const lookBehind = getLookBehind();
        let lookAhead = getLookAhead();

        // ── Delta-Adaptive LookAhead ──
        // Khi scroll delta lớn (ví dụ: chuyển từ 2 dòng lyrics cùng lúc sang
        // 2 dòng tiếp theo), mở rộng lookAhead để cover các line sẽ scroll
        // vào viewport. Extra lines = ceil(|delta| / avgLineHeight).
        // Bài hát bình thường (delta nhỏ) → extraLines ≈ 0-1 → không ảnh hưởng.
        if (CFG.deltaAdaptiveEnabled) {
            const avgH = _estimateAvgLineHeight(lines, ref);
            const extraLines = Math.round(Math.abs(delta) / avgH);
            if (extraLines > 1) {
                const baseLookAhead = lookAhead;
                lookAhead = Math.min(lookAhead + extraLines, lines.length - ref);
                console.info(
                    `[GlassyFlow v5] 🔮 Delta-Adaptive: |delta|=${Math.abs(delta).toFixed(0)}px, ` +
                    `avgH=${avgH.toFixed(0)}px, extra=+${extraLines} → ` +
                    `lookAhead ${baseLookAhead} → ${lookAhead}`
                );
            }
        }

        const start = Math.max(0, ref - lookBehind);
        const end = Math.min(lines.length, ref + lookAhead + 1);

        console.info(
            `[GlassyFlow v5] applyStagger: delta=${delta.toFixed(1)}px, ` +
            `ref=${ref}, range=[${start},${end}), ` +
            `behind=${lookBehind}, ahead=${lookAhead}, lines=${end - start}`
        );

        let aheadCount = 0;

        const isFast = _checkFastTransition(lines, ref);
        const currentStaggerStep = isFast ? CFG.fastStaggerStep : CFG.staggerStep;
        const currentStiffness = isFast ? CFG.fastStiffness : CFG.stiffness;
        const currentDamping = isFast ? CFG.fastDamping : CFG.damping;
        const currentMass = isFast ? CFG.fastMass : CFG.mass;

        if (isFast) {
            console.info(`[GlassyFlow v5] ⚡ Fast Transition triggered (Gap < ${CFG.fastTransitionThreshold}s)`);
        }

        for (let i = start; i < end; i++) {
            const line = lines[i];
            const delay = i >= ref ? (aheadCount++) * currentStaggerStep : 0;

            const data = getOrCreateSpring(line);

            // Cập nhật cấu hình lò xo trực tiếp
            data.spring.stiffness = currentStiffness;
            data.spring.damping = currentDamping;
            data.spring.mass = currentMass;

            if (activeLines.has(line)) {
                data.spring.nudge(delta);
                line.style.translate = `0px ${(data.spring.pos * 2 + 0.5 | 0) / 2}px`;
            } else {
                data.spring.setPosition(delta);
                line.style.willChange = 'translate';
                line.style.translate = `0px ${delta}px`;

                if (delay > 0) {
                    data.released = false;
                    data.releaseDelay = delay;
                } else {
                    data.released = true;
                    data.spring.setTarget(0);
                }
            }

            activeLines.add(line);
        }

        isAnimationBusy = activeLines.size > 0;
        ensureLoopRunning();

        // Mark past lines — deferred hiding until scroll occurs
        markPastLines(lines, ref);
    }

    /* ── Past Lines Marker ──
     * Gắn class blyrics--gf-past lên các dòng đã hát xong.
     * Chỉ được gọi từ applyStagger() → chỉ đánh dấu khi scroll thực sự xảy ra.
     * CSS sẽ target class này để ẩn dòng past với transition mượt.
     */
    function markPastLines(lines, ref) {
        // Tìm dòng active cuối cùng (dòng mới nhất đang hát)
        // Dùng blyrics--active vì nó chính xác hơn blyrics--animating
        // (blyrics--animating có thể tồn tại trên dòng cũ do overlap timing)
        let lastActive = -1;
        for (let i = lines.length - 1; i >= 0; i--) {
            if (lines[i].classList.contains('blyrics--active')) {
                lastActive = i;
                break;
            }
        }

        // Nếu không có dòng active nào → không mark (tránh ẩn sai khi chưa có lyrics active)
        if (lastActive < 0) return;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (!line.classList.contains('blyrics--line')) continue;
            if (i < lastActive) {
                line.classList.add('blyrics--gf-past');
            } else {
                line.classList.remove('blyrics--gf-past');
            }
        }
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     *  v3: HANDLE FLIP DELTA — logic chính cho busy gating
     *
     *  Được gọi khi style observer hoặc scroll fallback detect scroll.
     *  Nếu busy → defer + container compensate.
     *  Nếu rảnh → flush deferred + apply combined delta.
     * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

    /**
     * _executeScroll — thực hiện scroll thật sự (busy gating logic)
     * Được gọi SAU khi delay timer hết hoặc ngay lập tức nếu scrollDelay = 0.
     */
    function _executeScroll(delta) {
        if (!isScriptEnabled || isNoSyncMode || Math.abs(delta) < CFG.minDelta) return;

        if (isAnimationBusy) {
            // ╔══════════════════════════════════════════════════════════╗
            // ║  BUSY: Defer delta, giữ nguyên vị trí bằng container   ║
            // ║  translate để bù scrollTop change.                      ║
            // ║  + Dynamic Speedup: nếu tích lũy quá nhiều → tua nhanh ║
            // ╚══════════════════════════════════════════════════════════╝
            deferredDelta += delta;
            setContainerCompensation(deferredDelta);

            // ── Dynamic Speedup detection ──
            // Kiểm tra 2 điều kiện:
            //   1. Tổng deferredDelta tích lũy vượt ngưỡng (>= speedupThreshold px)
            //   2. Hoặc refIndex nhảy >= 2 dòng so với lần cuối
            // Nếu thỏa → kích hoạt timeScale để tua nhanh spring physics,
            // TUYỆT ĐỐI KHÔNG hủy animation đang chạy.
            const shouldSpeedup = _checkSpeedupCondition();
            if (shouldSpeedup && timeScale < CFG.speedupScale) {
                timeScale = CFG.speedupScale;
                console.info(
                    `[GlassyFlow v5] ⚡ Dynamic Speedup activated! ` +
                    `timeScale → ${timeScale} ` +
                    `(deferred: ${deferredDelta.toFixed(1)}px)`
                );
            }

            console.debug(
                `[GlassyFlow v5] Busy — deferred ${delta.toFixed(1)}px ` +
                `(total: ${deferredDelta.toFixed(1)}px, timeScale: ${timeScale})`
            );
        } else {
            // ╔══════════════════════════════════════════════════════════╗
            // ║  RẢNH: Gộp deferred + new delta → 1 spring animation   ║
            // ║  Gỡ container translate trước, rồi apply combined.     ║
            // ╚══════════════════════════════════════════════════════════╝
            const combined = delta + deferredDelta;
            if (Math.abs(deferredDelta) > 0.5) {
                console.info(
                    `[GlassyFlow v5] Flushing deferred: ${deferredDelta.toFixed(1)}px ` +
                    `+ new: ${delta.toFixed(1)}px = ${combined.toFixed(1)}px`
                );
            }

            // Gỡ container compensation TRƯỚC khi apply spring
            // (cùng frame, browser không render giữa 2 thao tác)
            deferredDelta = 0;
            setContainerCompensation(0);

            // Cập nhật lastRefIndex cho speedup detection
            const lines = getLines();
            if (lines.length) lastRefIndex = getRefIndex(lines);

            applyStagger(combined);
        }
    }

    /**
     * _checkSpeedupCondition — kiểm tra xem có nên kích hoạt Dynamic Speedup.
     *
     * Trả về true nếu:
     *   - Tổng |deferredDelta| >= CFG.speedupThreshold (cuộn tích lũy quá nhiều)
     *   - HOẶC refIndex hiện tại nhảy >= 2 dòng so với lần cuối
     *     (nghĩa là đã vượt qua >= 2 dòng lyric)
     */
    function _checkSpeedupCondition() {
        // Điều kiện 1: tổng deferredDelta tích lũy quá ngưỡng
        if (Math.abs(deferredDelta) >= CFG.speedupThreshold) {
            return true;
        }

        // Điều kiện 2: refIndex nhảy >= 2 dòng
        const lines = getLines();
        if (lines.length && lastRefIndex >= 0) {
            const currentRef = getRefIndex(lines);
            if (Math.abs(currentRef - lastRefIndex) >= 2) {
                return true;
            }
        }

        return false;
    }

    /**
     * handleNewDelta — entry point cho mỗi scroll event.
     *
     * Nếu CFG.scrollDelay > 0:
     *   - Tích lũy delta vào delayedDelta
     *   - Dùng container translate để bù scrollTop (giữ nguyên vị trí)
     *   - Reset timer mỗi lần có scroll mới
     *   - Khi timer hết → gỡ compensation + gọi _executeScroll(combined)
     *
     * Nếu CFG.scrollDelay = 0: gọi _executeScroll ngay.
     */
    function handleNewDelta(delta) {
        if (!isScriptEnabled || isNoSyncMode || Math.abs(delta) < CFG.minDelta) return;

        // Không delay → thực hiện ngay
        if (CFG.scrollDelay <= 0) {
            _executeScroll(delta);
            return;
        }

        // ── Có delay: tích lũy + debounce ──
        delayedDelta += delta;
        setContainerCompensation(delayedDelta + deferredDelta);

        console.debug(
            `[GlassyFlow v5] Delay queued ${delta.toFixed(1)}px ` +
            `(pending: ${delayedDelta.toFixed(1)}px, wait: ${CFG.scrollDelay}ms)`
        );

        // Reset timer
        if (scrollDelayTimer !== null) {
            clearTimeout(scrollDelayTimer);
        }

        scrollDelayTimer = setTimeout(() => {
            scrollDelayTimer = null;
            const totalDelayed = delayedDelta;
            delayedDelta = 0;

            // Gỡ compensation cho phần delayed (deferred vẫn giữ nếu busy)
            setContainerCompensation(deferredDelta);

            console.debug(
                `[GlassyFlow v5] Delay fired — executing ${totalDelayed.toFixed(1)}px`
            );

            _executeScroll(totalDelayed);
        }, CFG.scrollDelay);
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     *  STYLE OBSERVER — theo dõi BL's FLIP transform
     * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
    function installStyleObserver(el) {
        styleObserver?.disconnect();

        let lastTransform = el.style.transform || '';

        styleObserver = new MutationObserver(() => {
            if (!isScriptEnabled || suppressTransform) return;

            const transformVal = el.style.transform;
            if (transformVal === lastTransform) return;
            lastTransform = transformVal;

            const y = parseTranslateY(transformVal);

            if (Math.abs(y) > CFG.minDelta) {
                // FLIP Step 2 — BL set offset transform
                pendingDelta = y;
                suppressTransform = true;
                el.style.transform = 'translate(0px, 0px)';
                lastTransform = 'translate(0px, 0px)';
                suppressTransform = false;
            } else if (pendingDelta !== 0) {
                // FLIP Step 5 — BL animate to 0
                const delta = pendingDelta;
                pendingDelta = 0;

                suppressTransform = true;
                el.style.transition = 'none';
                el.style.transform = 'none';
                lastTransform = 'none';
                suppressTransform = false;

                // v3: Dùng handleNewDelta thay vì gọi applyStagger trực tiếp
                handleNewDelta(delta);
                lastFlipTime = Date.now();
            }
        });

        styleObserver.observe(el, {
            attributes: true,
            attributeFilter: ['style'],
        });

        console.info('[GlassyFlow v5] Style observer installed on', el);
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     *  SCROLL FALLBACK
     * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
    let scrollParent = null;
    let scrollHandler = null;
    let lastScrollTop = 0;

    function installScrollFallback(el) {
        removeScrollFallback();
        scrollParent = findScrollParent(el);
        if (!scrollParent) return;
        lastScrollTop = scrollParent.scrollTop;

        scrollHandler = () => {
            const cur = scrollParent.scrollTop;
            const delta = cur - lastScrollTop;
            lastScrollTop = cur;

            if (pendingDelta !== 0) return;
            if (Date.now() - lastFlipTime < 150) return;
            if (container && container.classList.contains('blyrics-user-scrolling')) return;

            // v3: Dùng handleNewDelta thay vì gọi applyStagger trực tiếp
            if (Math.abs(delta) > CFG.minDelta) {
                handleNewDelta(delta);
            }
        };

        scrollParent.addEventListener('scroll', scrollHandler, { passive: true });
    }

    function removeScrollFallback() {
        if (scrollParent && scrollHandler) {
            scrollParent.removeEventListener('scroll', scrollHandler);
        }
        scrollParent = null;
        scrollHandler = null;
    }

    function findScrollParent(el) {
        let p = el.parentElement;
        while (p && p !== document.documentElement) {
            const { overflow, overflowY } = getComputedStyle(p);
            if (/(auto|scroll)/.test(overflow + overflowY)) return p;
            p = p.parentElement;
        }
        return null;
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     *  CONTAINER LIFECYCLE
     * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
    function attach(el) {
        if (el === container) return;
        console.info('[GlassyFlow v5] Attaching to new container', el);
        cleanupAllSprings();

        container = el;
        el.classList.add('blyrics--gf-managed');
        pendingDelta = 0;
        deferredDelta = 0;
        isAnimationBusy = false;
        timeScale = 1.0;
        lastRefIndex = -1;

        installStyleObserver(el);
        installScrollFallback(el);
        setScrollOverride(true);

        // No-sync detection: đợi rồi check
        startNoSyncDetection(el);
    }

    function boot() {
        console.info('[GlassyFlow v5] Booting spring scroll extension...');
        const existing = document.querySelector('.blyrics-container');
        if (existing) attach(existing);

        domObserver?.disconnect();
        let domCheckQueued = false;
        domObserver = new MutationObserver(() => {
            if (domCheckQueued) return;
            domCheckQueued = true;
            queueMicrotask(() => {
                domCheckQueued = false;
                const el = document.querySelector('.blyrics-container');
                if (el && el !== container) {
                    console.info('[GlassyFlow v5] New container detected (song change)');
                    attach(el);
                }
            });
        });
        domObserver.observe(document.body, { childList: true, subtree: true });
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     *  CLEANUP HELPER
     * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
    function cleanupAllSprings() {
        for (const line of activeLines) {
            line.style.translate = '';
        }
        activeLines.clear();
        if (rafId !== null) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
        if (scrollDelayTimer !== null) {
            clearTimeout(scrollDelayTimer);
            scrollDelayTimer = null;
        }
        lastFrameTs = 0;
        isAnimationBusy = false;
        deferredDelta = 0;
        delayedDelta = 0;
        timeScale = 1.0;
        lastRefIndex = -1;
        setContainerCompensation(0);

        // Clean up GlassyFlow past markers
        if (container) {
            container.querySelectorAll('.blyrics--gf-past').forEach(el => {
                el.classList.remove('blyrics--gf-past');
            });
        }
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     *  NO-SYNC DETECTION — disable khi lyrics tĩnh
     *
     *  BetterLyrics luôn đặt `data-time` và `data-duration` trên mỗi dòng:
     *    - Synced: data-duration có giá trị thực (≠ "0")
     *    - Static: data-duration = "0" cho TẤT CẢ dòng
     * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

    function setNoSyncState(enabled) {
        if (isNoSyncMode === enabled) return;
        isNoSyncMode = enabled;
        if (enabled) {
            // Disable scroll: cho BL tự scroll bình thường
            setScrollOverride(false);
            cleanupAllSprings();
            if (container) container.classList.remove('blyrics--gf-managed');
            console.info('[GlassyFlow v5] 🔇 No-sync detected (all lines data-duration=0) — spring scroll disabled.');
        } else {
            // Re-enable scroll
            setScrollOverride(true);
            if (container) container.classList.add('blyrics--gf-managed');
            console.info('[GlassyFlow v5] 🎵 Synced lyrics detected (data-duration > 0 found) — spring scroll re-enabled.');
        }
    }

    function startNoSyncDetection(el) {
        // Cleanup previous
        if (noSyncClassObserver) {
            noSyncClassObserver.disconnect();
            noSyncClassObserver = null;
        }
        isNoSyncMode = false;

        // Check ngay lập tức
        const hasSyncedLine = el.querySelector('.blyrics--line[data-duration]:not([data-duration="0"])');
        setNoSyncState(!hasSyncedLine);

        // Observer: theo dõi khi nội dung thay đổi (lines được thêm/xóa khi đổi bài)
        noSyncClassObserver = new MutationObserver(() => {
            if (!el.isConnected) return;
            const synced = el.querySelector('.blyrics--line[data-duration]:not([data-duration="0"])');
            setNoSyncState(!synced);
        });

        noSyncClassObserver.observe(el, {
            childList: true,
            subtree: true,
        });
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     *  SPA NAVIGATION
     * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
    window.addEventListener('yt-navigate-finish', () => {
        container = null;
        pendingDelta = 0;
        deferredDelta = 0;
        delayedDelta = 0;
        isAnimationBusy = false;
        timeScale = 1.0;
        lastRefIndex = -1;
        if (scrollDelayTimer !== null) {
            clearTimeout(scrollDelayTimer);
            scrollDelayTimer = null;
        }
        styleObserver?.disconnect();
        removeScrollFallback();
        cleanupAllSprings();
        boot();
    });

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     *  INIT
     * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     *  RESIZE RECOVERY
     * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
    window.addEventListener('resize', () => {
        isScriptEnabled = false;
        pendingDelta = 0;
        deferredDelta = 0;
        delayedDelta = 0;
        isAnimationBusy = false;
        timeScale = 1.0;
        lastRefIndex = -1;
        _viewportCache.ts = 0; // Invalidate → recalculate lookBehind/lookAhead after resize
        _avgLineHeightCache.ts = 0; // Invalidate → recalculate avg line height after resize
        if (scrollDelayTimer !== null) {
            clearTimeout(scrollDelayTimer);
            scrollDelayTimer = null;
        }
        setScrollOverride(false);
        cleanupAllSprings();
        if (container) container.classList.remove('blyrics--gf-managed');

        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            isScriptEnabled = true;
            setScrollOverride(true);
            if (container && !isNoSyncMode) {
                container.classList.add('blyrics--gf-managed');
                // Re-mark past lines ngay lập tức để tránh flash sáng
                const lines = getLines();
                if (lines.length) {
                    markPastLines(lines, getRefIndex(lines));
                }
            }
            console.info('[GlassyFlow v5] Re-enabled after resize.');
        }, 1500);
    });
})();
