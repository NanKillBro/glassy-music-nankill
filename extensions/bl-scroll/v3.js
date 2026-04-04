/**
 * ════════════════════════════════════════════════════════════════════════
 *  SPRING SCROLL v6.1 (v3) — Animation-busy gating + deferred delta
 *                             + configurable scroll delay
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
        staggerStep: 30,
        lookBehind: 5,
        lookAhead: 9,
        minDelta: 2,
        stiffness: 120,
        damping: 18,
        mass: 1,
        scrollDelay: 200,   // ms — delay trước khi thực hiện scroll (0 = không delay)
    };

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

    const lineSprings = new WeakMap();
    let rafId = null;
    let lastFrameTs = 0;
    let activeLines = new Set();

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
            return;
        }

        if (lastFrameTs === 0) lastFrameTs = timestamp;
        const dtMs = Math.min(timestamp - lastFrameTs, 32);
        const dt = dtMs / 1000;
        lastFrameTs = timestamp;

        const toRemove = [];

        for (const line of activeLines) {
            const data = lineSprings.get(line);
            if (!data) { toRemove.push(line); continue; }

            if (!data.released) {
                data.releaseDelay -= dtMs;
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
        const start = Math.max(0, ref - CFG.lookBehind);
        const end = Math.min(lines.length, ref + CFG.lookAhead);

        let aheadCount = 0;

        for (let i = start; i < end; i++) {
            const line = lines[i];
            const delay = i >= ref ? (aheadCount++) * CFG.staggerStep : 0;

            const data = getOrCreateSpring(line);

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
        if (!isScriptEnabled || Math.abs(delta) < CFG.minDelta) return;

        if (isAnimationBusy) {
            // ╔══════════════════════════════════════════════════════════╗
            // ║  BUSY: Defer delta, giữ nguyên vị trí bằng container   ║
            // ║  translate để bù scrollTop change.                      ║
            // ╚══════════════════════════════════════════════════════════╝
            deferredDelta += delta;
            setContainerCompensation(deferredDelta);
            console.debug(
                `[BL-Spring v3] Busy — deferred ${delta.toFixed(1)}px ` +
                `(total: ${deferredDelta.toFixed(1)}px)`
            );
        } else {
            // ╔══════════════════════════════════════════════════════════╗
            // ║  RẢNH: Gộp deferred + new delta → 1 spring animation   ║
            // ║  Gỡ container translate trước, rồi apply combined.     ║
            // ╚══════════════════════════════════════════════════════════╝
            const combined = delta + deferredDelta;
            if (Math.abs(deferredDelta) > 0.5) {
                console.debug(
                    `[BL-Spring v3] Flushing deferred: ${deferredDelta.toFixed(1)}px ` +
                    `+ new: ${delta.toFixed(1)}px = ${combined.toFixed(1)}px`
                );
            }

            // Gỡ container compensation TRƯỚC khi apply spring
            // (cùng frame, browser không render giữa 2 thao tác)
            deferredDelta = 0;
            setContainerCompensation(0);

            applyStagger(combined);
        }
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
        if (!isScriptEnabled || Math.abs(delta) < CFG.minDelta) return;

        // Không delay → thực hiện ngay
        if (CFG.scrollDelay <= 0) {
            _executeScroll(delta);
            return;
        }

        // ── Có delay: tích lũy + debounce ──
        delayedDelta += delta;
        setContainerCompensation(delayedDelta + deferredDelta);

        console.debug(
            `[BL-Spring v3] Delay queued ${delta.toFixed(1)}px ` +
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
                `[BL-Spring v3] Delay fired — executing ${totalDelayed.toFixed(1)}px`
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

        console.debug('[BL-Spring v3] Style observer installed on', el);
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
        console.debug('[BL-Spring v3] Attaching to new container', el);
        cleanupAllSprings();

        container = el;
        pendingDelta = 0;
        deferredDelta = 0;
        isAnimationBusy = false;

        installStyleObserver(el);
        installScrollFallback(el);
        setScrollOverride(true);
    }

    function boot() {
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
                    console.debug('[BL-Spring v3] New container detected (song change)');
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
        setContainerCompensation(0);
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
        if (scrollDelayTimer !== null) {
            clearTimeout(scrollDelayTimer);
            scrollDelayTimer = null;
        }
        setScrollOverride(false);
        cleanupAllSprings();

        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            isScriptEnabled = true;
            setScrollOverride(true);
            console.debug('[BL-Spring v3] Re-enabled after resize.');
        }, 1500);
    });
})();
