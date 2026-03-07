/**
 * YOUTUBE MUSIC CUSTOM ENHANCEMENTS
 * Tệp JavaScript tổng hợp các tinh chỉnh giao diện cho YouTube Music
 * Made by NanKill, Gemini 3 Pro, Claude
 */

// =========================================================================
// PHẦN 1: YOUTUBE MUSIC - SMOOTH FADE OUT ANIMATIONS
// Mô tả: Thêm hiệu ứng fade out mượt mà khi đóng menu và dialog 
// =========================================================================

(function () {
  'use strict';

  const style = document.createElement('style');
  style.textContent = `
        @keyframes menuFadeOut {
          0% { opacity: 1; margin-top: 0; }
          100% { opacity: 0; margin-top: -10px; }
        }

        @keyframes popupXuatHienNguoc {
          0% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -45%) scale(0.95); }
        }

        .ytm-fade-out-menu {
          animation: menuFadeOut 0.25s cubic-bezier(0.2, 0.8, 0.2, 1) forwards !important;
          display: block !important;
          pointer-events: none !important;
        }

        .ytm-fade-out-dialog {
          animation: popupXuatHienNguoc 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) forwards !important;
          display: block !important;
          pointer-events: none !important;
        }
    `;
  document.head.appendChild(style);

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      const el = mutation.target;
      if (el.nodeType !== 1) return;

      const isMenu = el.matches('tp-yt-iron-dropdown.ytmusic-popup-container');
      const isDialog = el.matches('ytmusic-add-to-playlist-renderer, ytmusic-unified-share-panel-renderer, ytmusic-dialog, ytmusic-engagement-panel-section-list-renderer, tp-yt-paper-dialog');

      if (!isMenu && !isDialog) return;

      // Xác định trạng thái hiện tại: Đang bị ẩn đi?
      // YouTube ẩn element bằng cách gỡ 'opened' VÀ (thêm display: none HOẶC aria-hidden='true')
      const isHidden = !el.hasAttribute('opened') && (el.style.display === 'none' || el.getAttribute('aria-hidden') === 'true');
      const isVisible = !isHidden;

      if (isVisible) {
        // --- NẾU ĐANG MỞ ---
        // 1. Dập ngay hiệu ứng fade-out nếu đang chạy dở
        el.classList.remove('ytm-fade-out-menu', 'ytm-fade-out-dialog', 'ytm-is-fading-out');
        if (el._ytmCloseTimer) clearTimeout(el._ytmCloseTimer);

        // 2. Chờ 50ms để xác nhận là nó "mở thật" (tránh các nhịp nảy chớp nhoáng của framework)
        if (el.dataset.stableOpen !== 'true' && !el._ytmOpenTimer) {
          el._ytmOpenTimer = setTimeout(() => {
            el.dataset.stableOpen = 'true'; // Đánh dấu: Đã mở ổn định
            el._ytmOpenTimer = null;
          }, 50);
        }
      } else {
        // --- NẾU ĐANG ĐÓNG ---
        // Hủy hẹn giờ mở nếu nó chưa kịp mở xong đã bị đóng lại
        if (el._ytmOpenTimer) {
          clearTimeout(el._ytmOpenTimer);
          el._ytmOpenTimer = null;
        }

        // CHỈ chạy animation fade out NẾU trước đó nó đã từng "mở ổn định"
        if (el.dataset.stableOpen === 'true') {
          el.dataset.stableOpen = 'false'; // Xóa dấu vết để không bị lặp

          // Kích hoạt animation NGAY LẬP TỨC (0ms delay) -> Hết chớp!
          el.classList.add('ytm-is-fading-out');
          if (isMenu) el.classList.add('ytm-fade-out-menu');
          else el.classList.add('ytm-fade-out-dialog');

          // Dọn dẹp class sau khi animation chạy xong (300ms)
          el._ytmCloseTimer = setTimeout(() => {
            el.classList.remove('ytm-fade-out-menu', 'ytm-fade-out-dialog', 'ytm-is-fading-out');
          }, 300);
        }
      }
    });
  });

  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ['opened', 'style', 'aria-hidden'],
    subtree: true
  });
})();

// =========================================================================
// PHẦN 2: YTM IMAGE CROSSFADE (FIXED)
// Mô tả: Xử lý mượt mà Crossfade kể cả khi ảnh load từ RAM Cache
// =========================================================================

(function () {
  'use strict';

  let crossfadeState = 'IDLE'; // 3 trạng thái: IDLE, WAITING, FADING
  let activeDummy = null;      // Lưu trữ ảnh dummy duy nhất đang hoạt động

  // Hàm bắt đầu hiệu ứng mờ dần
  const startFade = (dummy) => {
    crossfadeState = 'FADING';

    // Ép trình duyệt reflow (tính toán lại DOM) để nhận opacity: 1 trước khi chuyển về 0
    void dummy.offsetWidth;

    dummy.style.opacity = '0'; // Bắt đầu làm mờ

    // Dọn dẹp sau khi transition 0.6s kết thúc
    setTimeout(() => {
      dummy.remove();
      if (activeDummy === dummy) {
        activeDummy = null;
        crossfadeState = 'IDLE';
      }
    }, 600);
  };

  // Hàm dọn dẹp event listener cũ để tránh lỗi gọi lặp
  const cleanupListeners = (img) => {
    if (img._cfLoad) {
      img.removeEventListener('load', img._cfLoad);
      img.removeEventListener('error', img._cfLoad);
      img._cfLoad = null;
    }
  };

  const observer = new MutationObserver((mutations) => {
    for (let mut of mutations) {
      if (mut.type === 'attributes' && mut.attributeName === 'src') {
        const img = mut.target;

        if (img.id === 'blyrics-img' || img.id === 'img') {
          const oldSrc = mut.oldValue;
          const newSrc = img.src;

          // Bỏ qua nếu src không hợp lệ hoặc không thực sự thay đổi
          if (!oldSrc || oldSrc === newSrc || oldSrc.startsWith('data:')) continue;

          // 1. ĐANG FADE: Nếu đang chiếu hiệu ứng mà ảnh mới(nét) chen vào -> Mặc kệ, không tạo thêm dummy.
          if (crossfadeState === 'FADING') {
            continue;
          }

          // 2. ĐANG WAITING: Đợi load ảnh mờ mà ảnh nét lại nhào tới -> Giữ nguyên ảnh dummy cũ, chỉ đổi listener sang chờ ảnh nét.
          if (crossfadeState === 'WAITING') {
            cleanupListeners(img);
          }
          // 3. IDLE: Lúc này mới an toàn để tạo dummy overlay của bài hát cũ
          else if (crossfadeState === 'IDLE') {
            activeDummy = document.createElement('img');
            activeDummy.src = oldSrc;
            activeDummy.className = 'blyrics-crossfade-dummy style-scope yt-img-shadow';

            // Set trực tiếp CSS nội tuyến để đảm bảo ăn ngay
            Object.assign(activeDummy.style, {
              position: 'absolute',
              inset: '0',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              zIndex: '5',
              pointerEvents: 'none',
              transition: 'opacity 0.6s ease-in-out',
              opacity: '1'
            });

            img.parentElement.appendChild(activeDummy);
            crossfadeState = 'WAITING';
          }

          // 4. Xử lý trigger: Nếu ảnh đã nằm trong RAM/Cache thì fade luôn, ngược lại thì đợi tải xong.
          if (img.complete && img.naturalWidth > 0) {
            startFade(activeDummy);
          } else {
            img._cfLoad = () => {
              startFade(activeDummy);
              cleanupListeners(img);
            };
            img.addEventListener('load', img._cfLoad);
            img.addEventListener('error', img._cfLoad);
          }
        }
      }
    }
  });

  function initObserver() {
    const thumbnailContainer = document.querySelector('#song-image');
    if (thumbnailContainer) {
      observer.observe(thumbnailContainer, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['src'],
        attributeOldValue: true
      });
      console.log("Crossfade V2 Observer Started!");
    } else {
      setTimeout(initObserver, 1000);
    }
  }

  initObserver();
})();

// =========================================================================
// PHẦN 3: Smooth Scroll cho Lyrics
// Mô tả: Mượt như Apple Music, rất béo
// =========================================================================

/**
 * ════════════════════════════════════════════════════════════════════════
 *  SPRING SCROLL v5.1 — MutationObserver-based transform intercept + perf
 * ════════════════════════════════════════════════════════════════════════
 *
 *  v5 thay Object.defineProperty (không hoạt động trong userscript sandbox)
 *  bằng MutationObserver theo dõi style attribute trên .blyrics-container.
 *
 *  Khi BetterLyrics set style.transform (FLIP scroll):
 *    1. Observer bắt mutation, đọc translateY delta
 *    2. Zero-out transform ngay lập tức
 *    3. Gọi applyStagger(delta) → spring animation
 *
 *  Fix chính cho bug giật khi đổi bài:
 *   • BL tạo container MỚI mỗi bài (replaceChildren trên wrapper)
 *   • Script detect container mới qua body MutationObserver
 *   • Khi container mới xuất hiện → cleanup springs cũ, attach observer mới
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
      this.pos = position;           // current position
      this.target = position;        // target position
      this._time = 0;                // elapsed time for current solver
      this._solver = () => position; // position(t) function
      this._getV = () => 0;         // velocity(t) function

      // Spring parameters (tuned to feel like AMLL)
      this.stiffness = 120;  // độ cứng lò xo    (k)
      this.damping = 18;   // độ giảm chấn      (c)
      this.mass = 1;    // khối lượng         (m)
    }

    /** Tạo lại solver khi target hoặc trạng thái thay đổi */
    _resetSolver() {
      const curV = this._getV(this._time);
      this._time = 0;
      this._solver = _solveSpring(
        this.pos, curV, this.target,
        this.stiffness, this.damping, this.mass
      );
      this._getV = _derivative(this._solver);
    }

    /** Đã đến target chưa? */
    arrived() {
      return (
        Math.abs(this.target - this.pos) < 0.1 &&
        Math.abs(this._getV(this._time)) < 0.1
      );
    }

    /** Snap ngay (không animate) */
    setPosition(p) {
      this.pos = p;
      this.target = p;
      this._time = 0;
      this._solver = () => p;
      this._getV = () => 0;
    }

    /** Đặt target mới — velocity được bảo toàn tự động */
    setTarget(newTarget) {
      if (Math.abs(newTarget - this.target) < 0.01) return;
      this.target = newTarget;
      this._resetSolver();
    }

    /**
     * Dịch chuyển position thêm delta KHÔNG xóa velocity.
     * Dùng khi scroll mới đến giữa chừng animation.
     */
    nudge(delta) {
      this.pos += delta;
      this._resetSolver(); // rebuilds solver from new pos, preserving velocity
    }

    /** Gọi mỗi frame — delta tính bằng giây */
    update(dt) {
      this._time += dt;
      this.pos = this._solver(this._time);

      if (this.arrived()) {
        this.setPosition(this.target);
      }
      return this.pos;
    }
  }

  /**
   * Giải phương trình spring (damped harmonic oscillator).
   * Trả về hàm position(t) với input t tính bằng giây.
   *
   * Xử lý 2 trường hợp:
   *  - Overdamped / critically damped: c² ≥ 4mk
   *  - Underdamped: c² < 4mk (có overshoot — đây là trường hợp mong muốn)
   */
  function _solveSpring(from, velocity, to, stiffness, damping, mass) {
    const delta = to - from;

    // Check damping ratio
    if (damping * damping >= 4.0 * stiffness * mass) {
      // Overdamped / critically damped — no oscillation
      const angFreq = -Math.sqrt(stiffness / mass);
      const leftover = -angFreq * delta - velocity;
      return (t) => {
        if (t < 0) return from;
        return to - (delta + t * leftover) * Math.exp(t * angFreq);
      };
    }

    // Underdamped — oscillates around target (overshoot!)
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

  /**
   * Numerical derivative — dùng để tính velocity từ position function.
   * (Giống AMLL: packages/core/src/utils/derivative.ts)
   */
  function _derivative(fn) {
    const h = 0.001;
    return (t) => (fn(t + h) - fn(t - h)) / (2 * h);
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   *  CONFIG
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  const CFG = {
    staggerStep: 30,   // ms of extra delay per line ahead of active
    lookBehind: 5,   // lines behind active to include in wave
    lookAhead: 9,   // lines after active to include in wave
    minDelta: 2,   // px: ignore micro-scrolls

    // Spring tuning (underdamped for nice overshoot)
    stiffness: 120,   // lò xo cứng hơn → nhanh hơn
    damping: 18,   // giảm chấn thấp → nhiều overshoot hơn
    mass: 1,   // khối lượng
  };

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   *  STATE
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  let container = null;
  let pendingDelta = 0;
  let domObserver = null;
  let styleObserver = null;   // MutationObserver trên container style
  let isScriptEnabled = true;
  let resizeTimer = null;
  let suppressTransform = false; // flag để tránh loop khi ta zero-out transform
  let lastFlipTime = 0;           // timestamp lần cuối style observer xử lý FLIP

  // Per-line spring data: WeakMap<Element, { spring: Spring, staggerRemaining: number }>
  const lineSprings = new WeakMap();

  // rAF loop state
  let rafId = null;
  let lastFrameTs = 0;
  let activeLines = new Set(); // lines currently being animated

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

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   *  getOrCreateSpring — lấy hoặc tạo Spring cho một dòng
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  function getOrCreateSpring(line) {
    let data = lineSprings.get(line);
    if (!data) {
      data = {
        spring: new Spring(0),
        releaseDelay: 0, // ms trước khi spring bắt đầu chạy về 0
        released: true,  // đã gửi target = 0 cho spring chưa?
      };
      data.spring.stiffness = CFG.stiffness;
      data.spring.damping = CFG.damping;
      data.spring.mass = CFG.mass;
      lineSprings.set(line, data);
    }
    return data;
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   *  rAF ANIMATION LOOP — trái tim của spring engine
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  function springLoop(timestamp) {
    if (!isScriptEnabled || activeLines.size === 0) {
      rafId = null;
      lastFrameTs = 0;
      return;
    }

    if (lastFrameTs === 0) lastFrameTs = timestamp;
    const dtMs = Math.min(timestamp - lastFrameTs, 32); // cap at ~30fps min
    const dt = dtMs / 1000; // seconds
    lastFrameTs = timestamp;

    const toRemove = [];

    for (const line of activeLines) {
      const data = lineSprings.get(line);
      if (!data) { toRemove.push(line); continue; }

      // Handle stagger release delay:
      // Dòng đã được offset ngay lập tức, nhưng chưa cho spring chạy về 0
      if (!data.released) {
        data.releaseDelay -= dtMs;
        if (data.releaseDelay <= 0) {
          data.released = true;
          data.spring.setTarget(0);
        } else {
          // Vẫn giữ offset tĩnh, chưa animate
          continue;
        }
      }

      // Update spring
      const y = data.spring.update(dt);
      // Round to 0.5px (sub-pixel, visually identical) — avoids toFixed() string alloc
      line.style.translate = `0px ${(y * 2 + 0.5 | 0) / 2}px`;

      // Remove when arrived
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
        // Đang animate → dịch thêm delta, GIỮ velocity hiện tại
        data.spring.nudge(delta);
        // Cập nhật visual ngay cho dòng đang chạy
        line.style.translate = `0px ${(data.spring.pos * 2 + 0.5 | 0) / 2}px`;
      } else {
        // Bắt đầu mới:
        // 1. Snap position = delta VÀ set translate ngay lập tức
        //    → dòng trông như không nhúc nhích dù scrollTop đã thay đổi
        data.spring.setPosition(delta);
        line.style.willChange = 'translate';  // GPU compositing hint
        line.style.translate = `0px ${delta}px`;  // OFFSET NGAY!

        // 2. Stagger: delay rồi mới cho spring chạy về 0
        if (delay > 0) {
          data.released = false;
          data.releaseDelay = delay;
          // target chưa set → spring đứng yên tại delta
        } else {
          data.released = true;
          data.spring.setTarget(0);
        }
      }

      activeLines.add(line);
    }

    ensureLoopRunning();
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   *  STYLE OBSERVER — theo dõi BL's FLIP transform qua MutationObserver
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   *
   *  BetterLyrics animationEngine.ts thực hiện FLIP scroll như sau:
   *    1. style.transition = "none"
   *    2. style.transform = "translate(0px, -120px)"   ← FLIP offset
   *    3. reflow (void el.offsetHeight)
   *    4. style.transition = ""                         ← restore transition
   *    5. style.transform = "translate(0px, 0px)"       ← animate to 0
   *    6. tabRenderer.scrollTop = scrollPos             ← actual scroll
   *
   *  Ta cần:
   *    - Bắt step 2: lưu delta = parseTranslateY(transform)
   *    - Bắt step 5: zero-out transform, gọi applyStagger(delta)
   *
   *  MutationObserver trên attributeFilter: ['style'] sẽ fire cho MỌI
   *  thay đổi style attribute, kể cả từ inline JS (style.transform = ...).
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  function installStyleObserver(el) {
    // Disconnect observer cũ nếu có
    styleObserver?.disconnect();

    // Cache last transform to skip no-change mutations
    // (BL thay đổi nhiều style properties khác ngoài transform)
    let lastTransform = el.style.transform || '';

    styleObserver = new MutationObserver(() => {
      if (!isScriptEnabled || suppressTransform) return;

      // Early-exit nếu transform không thay đổi
      const transformVal = el.style.transform;
      if (transformVal === lastTransform) return;
      lastTransform = transformVal;

      const y = parseTranslateY(transformVal);

      if (Math.abs(y) > CFG.minDelta) {
        // FLIP Step 2 — BL vừa set offset transform (vd: translate(0px, -120px))
        // Lưu delta, zero-out transform ngay
        pendingDelta = y;
        suppressTransform = true;
        el.style.transform = 'translate(0px, 0px)';
        lastTransform = 'translate(0px, 0px)';
        suppressTransform = false;
      } else if (pendingDelta !== 0) {
        // FLIP Step 5 — BL set transform về 0, kích hoạt transition
        // Chặn transition, zero-out, gọi spring
        const delta = pendingDelta;
        pendingDelta = 0;

        suppressTransform = true;
        el.style.transition = 'none';
        el.style.transform = 'none';
        lastTransform = 'none';
        suppressTransform = false;

        applyStagger(delta);
        lastFlipTime = Date.now();
      }
    });

    styleObserver.observe(el, {
      attributes: true,
      attributeFilter: ['style'],
    });

    console.debug('[BL-Spring] Style observer installed on', el);
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   *  SCROLL FALLBACK — dự phòng nếu style observer không bắt được
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  let scrollParent = null;
  let scrollHandler = null;
  let lastScrollTop = 0;

  function installScrollFallback(el) {
    // Remove handler cũ
    removeScrollFallback();

    scrollParent = findScrollParent(el);
    if (!scrollParent) return;

    lastScrollTop = scrollParent.scrollTop;

    scrollHandler = () => {
      const cur = scrollParent.scrollTop;
      const delta = cur - lastScrollTop;
      lastScrollTop = cur;

      // Bỏ qua nếu:
      // 1. Đang giữa FLIP sequence (style observer đang xử lý)
      if (pendingDelta !== 0) return;

      // 2. Scroll xảy ra ngay sau FLIP → là BL set scrollTop (programmatic)
      //    Cho thời gian cooldown 150ms sau FLIP
      if (Date.now() - lastFlipTime < 150) return;

      // 3. User đang tự scroll (BL thêm class này khi user kéo tay)
      if (container && container.classList.contains('blyrics-user-scrolling')) return;

      // Chỉ fallback khi style observer không bắt được (edge case)
      if (Math.abs(delta) > CFG.minDelta) {
        applyStagger(delta);
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

    console.debug('[BL-Spring] Attaching to new container', el);

    // Dọn dẹp spring + observer cũ
    cleanupAllSprings();

    container = el;
    pendingDelta = 0;

    // Cài style observer (thay thế Object.defineProperty)
    installStyleObserver(el);

    // Cài scroll fallback dự phòng
    installScrollFallback(el);

    // Override BL's smooth scroll duration
    setScrollOverride(true);
  }

  function boot() {
    const existing = document.querySelector('.blyrics-container');
    if (existing) attach(existing);

    domObserver?.disconnect();

    // Debounce body observer: YTM fires hàng trăm mutations/s.
    // Batch vào microtask thay vì querySelector mỗi mutation.
    let domCheckQueued = false;
    domObserver = new MutationObserver(() => {
      if (domCheckQueued) return;
      domCheckQueued = true;
      queueMicrotask(() => {
        domCheckQueued = false;
        const el = document.querySelector('.blyrics-container');
        if (el && el !== container) {
          console.debug('[BL-Spring] New container detected (song change)');
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
    lastFrameTs = 0;
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   *  SPA NAVIGATION
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  window.addEventListener('yt-navigate-finish', () => {
    container = null;
    pendingDelta = 0;
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
    setScrollOverride(false);
    cleanupAllSprings();

    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      isScriptEnabled = true;
      setScrollOverride(true);
      console.debug('[BL-Spring] Re-enabled after resize.');
    }, 1500);
  });
})();