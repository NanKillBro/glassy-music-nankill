/**
 * YOUTUBE MUSIC CUSTOM ENHANCEMENTS
 * Tệp JavaScript tổng hợp các tinh chỉnh giao diện cho YouTube Music
 * Made by NanKill, Gemini 3.1 Pro, Claude Opus 4.6, Claude Haiku 4.5, GPT 5.3-Codex
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
          pointer-events: none !important;
        }
    `;
  document.head.appendChild(style);

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      const el = mutation.target;
      if (el.nodeType !== 1) return;

      const isMenu = el.matches('tp-yt-iron-dropdown.ytmusic-popup-container, tp-yt-iron-dropdown#dropdown, tp-yt-iron-dropdown.tp-yt-paper-menu-button');
      const isDialog = el.matches('ytmusic-add-to-playlist-renderer, ytmusic-unified-share-panel-renderer, ytmusic-dialog, ytmusic-engagement-panel-section-list-renderer, tp-yt-paper-dialog');

      if (!isMenu && !isDialog) return;

      // =====================================================================
      // GUARD: Chặn YouTube ghi đè style khi đang fade-out (cả menu & dialog)
      // =====================================================================
      if (el.classList.contains('ytm-is-fading-out')) {
        if (mutation.attributeName === 'style') {
          let needFix = false;
          if (el.style.display !== 'block') needFix = true;
          if (el._ytmSavedZIndex && el.style.zIndex !== el._ytmSavedZIndex) needFix = true;
          if (el._ytmFadeAnim && !el.style.animation.includes('Fade')) needFix = true;

          if (needFix) {
            el.style.setProperty('display', 'block', 'important');
            if (el._ytmFadeAnim) {
              el.style.setProperty('animation', el._ytmFadeAnim, 'important');
            }
            if (el._ytmSavedZIndex) {
              el.style.setProperty('z-index', el._ytmSavedZIndex, 'important');
            }
          }
        }
        return; // Đang fade-out → không xử lý gì thêm
      }

      // Xác định trạng thái hiện tại
      const isHidden = !el.hasAttribute('opened') && (el.style.display === 'none' || el.getAttribute('aria-hidden') === 'true');
      const isVisible = !isHidden;

      if (isVisible) {
        // --- NẾU ĐANG MỞ ---
        el.classList.remove('ytm-fade-out-menu', 'ytm-fade-out-dialog', 'ytm-is-fading-out');
        el._ytmSavedZIndex = null;
        el._ytmFadeAnim = null;
        el.style.removeProperty('animation');
        el.style.removeProperty('pointer-events');
        if (el._ytmCloseTimer) {
          clearTimeout(el._ytmCloseTimer);
          el._ytmCloseTimer = null;
        }

        // Chờ 50ms để xác nhận là nó "mở thật"
        if (el.dataset.stableOpen !== 'true' && !el._ytmOpenTimer) {
          el._ytmOpenTimer = setTimeout(() => {
            el.dataset.stableOpen = 'true';
            el._ytmOpenTimer = null;
          }, 50);
        }
      } else {
        // --- NẾU ĐANG ĐÓNG ---
        if (el._ytmOpenTimer) {
          clearTimeout(el._ytmOpenTimer);
          el._ytmOpenTimer = null;
        }

        if (el.dataset.stableOpen === 'true') {
          el.dataset.stableOpen = 'false';

          el.classList.add('ytm-is-fading-out');

          if (isMenu) {
            // ─── MENU: Cách mới — inline override để hoạt động ở player page ───
            el._ytmSavedZIndex = el.style.zIndex || null;
            if (!el._ytmSavedZIndex) {
              const computed = getComputedStyle(el).zIndex;
              if (computed && computed !== 'auto') el._ytmSavedZIndex = computed;
            }

            el._ytmFadeAnim = 'menuFadeOut 0.25s cubic-bezier(0.2, 0.8, 0.2, 1) forwards';

            el.style.setProperty('display', 'block', 'important');
            el.style.setProperty('animation', el._ytmFadeAnim, 'important');
            el.style.setProperty('pointer-events', 'none', 'important');
            if (el._ytmSavedZIndex) {
              el.style.setProperty('z-index', el._ytmSavedZIndex, 'important');
            }

            el.classList.add('ytm-fade-out-menu');
            console.debug('[GlassyUI: Dialogs] 💨 Fading out menu popup');

            el._ytmCloseTimer = setTimeout(() => {
              el.classList.remove('ytm-fade-out-menu', 'ytm-is-fading-out');
              el.style.setProperty('display', 'none');
              el.style.removeProperty('z-index');
              el.style.removeProperty('animation');
              el.style.removeProperty('pointer-events');
              el._ytmSavedZIndex = null;
              el._ytmFadeAnim = null;
            }, 300);
          } else {
            // ─── DIALOG: Cách mới — inline override để hoạt động ở player page ───
            el._ytmSavedZIndex = el.style.zIndex || null;
            if (!el._ytmSavedZIndex) {
              const computed = getComputedStyle(el).zIndex;
              if (computed && computed !== 'auto') el._ytmSavedZIndex = computed;
            }

            el._ytmFadeAnim = 'popupXuatHienNguoc 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) forwards';

            el.style.setProperty('display', 'block', 'important');
            el.style.setProperty('animation', el._ytmFadeAnim, 'important');
            if (el._ytmSavedZIndex) {
              el.style.setProperty('z-index', el._ytmSavedZIndex, 'important');
            }

            el.classList.add('ytm-fade-out-dialog');
            console.debug('[GlassyUI: Dialogs] 💨 Fading out dialog popup');

            el._ytmCloseTimer = setTimeout(() => {
              el.classList.remove('ytm-fade-out-dialog', 'ytm-is-fading-out');
              el.style.setProperty('display', 'none');
              el.style.removeProperty('z-index');
              el.style.removeProperty('animation');
              el._ytmSavedZIndex = null;
              el._ytmFadeAnim = null;
            }, 300);
          }
        }
      }
    });
  });

  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ['opened', 'style', 'aria-hidden'],
    subtree: true
  });
  console.info('[GlassyUI: Dialogs] Observer started. Smooth fade-outs enabled.');
})();


// =========================================================================
// PHẦN 2: YTM IMAGE CROSSFADE (FIXED v2)
// Mô tả: Xử lý mượt mà Crossfade kể cả khi ảnh load từ RAM Cache
// Fix: Chống deadlock khi chuyển bài nhanh liên tục
// =========================================================================

(function () {
  'use strict';

  let crossfadeState = 'IDLE'; // 3 trạng thái: IDLE, WAITING, FADING
  let activeDummy = null;      // Lưu trữ ảnh dummy duy nhất đang hoạt động
  let generation = 0;          // Bộ đếm thế hệ - ngăn callback cũ ảnh hưởng state mới
  let safetyTimer = null;      // Safety timeout để thoát WAITING nếu bị kẹt
  let fadeTimer = null;        // Timer dọn dẹp sau fade
  let videoCrossfadeState = 'IDLE'; // State riêng cho video: IDLE, WAITING, FADING
  let activeVideoDummy = null;      // Video cũ được giữ lại để fade-out
  let videoFadeTimer = null;        // Timer dọn dẹp video fade
  let videoSafetyTimer = null;      // Timeout an toàn cho video WAITING
  let videoReadyCleanup = null;     // Cleanup listener chờ video mới sẵn sàng
  let pendingImageForVideo = null;  // Ảnh đang gắn listener chờ ready cho video fade
  let pendingImageForVideoHandler = null;
  let lastPlayerVideoId = null;     // Cache videoId từ event player-time để pre-hold video cũ

  // Hàm dọn dẹp dummy cũ ngay lập tức (dùng khi cần cancel fade/waiting giữa chừng)
  const killCurrentDummy = () => {
    if (safetyTimer) {
      clearTimeout(safetyTimer);
      safetyTimer = null;
    }
    if (fadeTimer) {
      clearTimeout(fadeTimer);
      fadeTimer = null;
    }
    if (activeDummy) {
      activeDummy.remove();
      activeDummy = null;
    }
  };

  const clearPendingImageForVideo = () => {
    if (pendingImageForVideo && pendingImageForVideoHandler) {
      pendingImageForVideo.removeEventListener('load', pendingImageForVideoHandler);
      pendingImageForVideo.removeEventListener('error', pendingImageForVideoHandler);
    }
    pendingImageForVideo = null;
    pendingImageForVideoHandler = null;
  };

  const killCurrentVideoDummy = () => {
    if (videoSafetyTimer) {
      clearTimeout(videoSafetyTimer);
      videoSafetyTimer = null;
    }
    if (videoFadeTimer) {
      clearTimeout(videoFadeTimer);
      videoFadeTimer = null;
    }
    if (videoReadyCleanup) {
      videoReadyCleanup();
      videoReadyCleanup = null;
    }
    clearPendingImageForVideo();
    if (activeVideoDummy) {
      activeVideoDummy.remove();
      activeVideoDummy = null;
    }
    videoCrossfadeState = 'IDLE';
  };

  // Hàm bắt đầu hiệu ứng mờ dần
  const startFade = (dummy, gen) => {
    // Bảo vệ: Nếu generation đã thay đổi (chuyển bài mới) thì callback này là cũ → bỏ qua
    if (gen !== generation) return;
    // Bảo vệ: Dummy đã bị remove hoặc không còn là active
    if (!dummy || !dummy.parentElement || dummy !== activeDummy) return;

    crossfadeState = 'FADING';

    if (safetyTimer) {
      clearTimeout(safetyTimer);
      safetyTimer = null;
    }

    // Ép trình duyệt reflow (tính toán lại DOM) để nhận opacity: 1 trước khi chuyển về 0
    void dummy.offsetWidth;

    console.info('[GlassyUI: Cover] ✨ Crossfading to new cover image...');
    dummy.style.opacity = '0'; // Bắt đầu làm mờ

    // Dọn dẹp sau khi transition 0.6s kết thúc
    fadeTimer = setTimeout(() => {
      dummy.remove();
      if (activeDummy === dummy) {
        activeDummy = null;
        crossfadeState = 'IDLE';
      }
      fadeTimer = null;
    }, 650); // Hơi dư 50ms so với transition 0.6s để đảm bảo
  };

  const startVideoFade = (dummy) => {
    if (videoCrossfadeState !== 'WAITING') return;
    if (!dummy || dummy !== activeVideoDummy || !dummy.parentElement) return;

    if (videoSafetyTimer) {
      clearTimeout(videoSafetyTimer);
      videoSafetyTimer = null;
    }
    if (videoReadyCleanup) {
      videoReadyCleanup();
      videoReadyCleanup = null;
    }
    clearPendingImageForVideo();

    videoCrossfadeState = 'FADING';
    void dummy.offsetWidth;
    dummy.style.opacity = '0';

    videoFadeTimer = setTimeout(() => {
      if (activeVideoDummy === dummy) {
        dummy.remove();
        activeVideoDummy = null;
      }
      videoCrossfadeState = 'IDLE';
      videoFadeTimer = null;
    }, 650);
  };

  // Hàm dọn dẹp event listener cũ để tránh lỗi gọi lặp
  const cleanupListeners = (img) => {
    if (img._cfLoad) {
      img.removeEventListener('load', img._cfLoad);
      img.removeEventListener('error', img._cfLoad);
      img._cfLoad = null;
    }
  };

  // Hàm tạo dummy overlay mới
  const createDummy = (img, oldSrc) => {
    const dummy = document.createElement('img');
    dummy.src = oldSrc;
    dummy.className = 'blyrics-crossfade-dummy style-scope yt-img-shadow';

    Object.assign(dummy.style, {
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

    img.parentElement.appendChild(dummy);
    return dummy;
  };

  const createVideoDummy = (video) => {
    const thumbnail = document.querySelector('#thumbnail');
    if (!thumbnail || !video) return null;

    killCurrentVideoDummy();

    video.id = 'bls-video-crossfade-dummy';
    Object.assign(video.style, {
      position: 'absolute',
      inset: '0',
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      zIndex: '6',
      pointerEvents: 'none',
      transition: 'opacity 0.6s ease-in-out',
      opacity: '1'
    });

    thumbnail.appendChild(video);
    videoCrossfadeState = 'WAITING';
    activeVideoDummy = video;

    // Giữ video cũ tiếp tục chạy trong lúc chờ artwork mới hiển thị.
    video.play().catch(() => { });

    videoSafetyTimer = setTimeout(() => {
      if (videoCrossfadeState === 'WAITING' && activeVideoDummy === video) {
        console.warn('[GlassyUI: Cover] Video WAITING timeout, forcing fade-out.');
        startVideoFade(video);
      }
      videoSafetyTimer = null;
    }, 6000);

    return video;
  };

  const waitForNewVideoThenFade = (newVideo) => {
    if (videoCrossfadeState !== 'WAITING' || !activeVideoDummy) return;
    if (!newVideo || newVideo.id !== 'bls-video') return;

    if (videoReadyCleanup) {
      videoReadyCleanup();
      videoReadyCleanup = null;
    }

    const targetDummy = activeVideoDummy;
    const onReady = () => {
      if (videoReadyCleanup) {
        videoReadyCleanup();
        videoReadyCleanup = null;
      }
      startVideoFade(targetDummy);
    };

    if (newVideo.readyState >= 2) {
      requestAnimationFrame(onReady);
      return;
    }

    newVideo.addEventListener('canplay', onReady, { once: true });
    newVideo.addEventListener('loadeddata', onReady, { once: true });

    videoReadyCleanup = () => {
      newVideo.removeEventListener('canplay', onReady);
      newVideo.removeEventListener('loadeddata', onReady);
    };
  };

  const waitForImageThenFadeVideo = (img) => {
    if (videoCrossfadeState !== 'WAITING' || !activeVideoDummy) return;
    clearPendingImageForVideo();

    const targetDummy = activeVideoDummy;
    if (img.complete && img.naturalWidth > 0) {
      startVideoFade(targetDummy);
      return;
    }

    pendingImageForVideo = img;
    pendingImageForVideoHandler = () => {
      clearPendingImageForVideo();
      startVideoFade(targetDummy);
    };

    img.addEventListener('load', pendingImageForVideoHandler);
    img.addEventListener('error', pendingImageForVideoHandler);
  };

  const handlePlayerTimeForVideoCrossfade = (event) => {
    const nextVideoId = event?.detail?.videoId;
    if (!nextVideoId) return;

    // Bỏ qua event đầu tiên để tránh hold nhầm ở lần khởi tạo.
    if (!lastPlayerVideoId) {
      lastPlayerVideoId = nextVideoId;
      return;
    }

    if (nextVideoId === lastPlayerVideoId) return;
    lastPlayerVideoId = nextVideoId;

    // Pre-hold trước khi BLS remove #bls-video để tránh lộ ảnh nền giữa remove/add.
    const currentVideo = document.getElementById('bls-video');
    if (currentVideo) {
      createVideoDummy(currentVideo);
    }
  };

  // Hàm gắn listener chờ ảnh load xong rồi fade
  const waitForImageThenFade = (img, dummy, gen) => {
    cleanupListeners(img);

    // Check 1: Ảnh đã load xong rồi (cache) → fade luôn
    if (img.complete && img.naturalWidth > 0) {
      startFade(dummy, gen);
      return;
    }

    // Gắn listener chờ load
    img._cfLoad = () => {
      cleanupListeners(img);
      startFade(dummy, gen);
    };
    img.addEventListener('load', img._cfLoad);
    img.addEventListener('error', img._cfLoad);

    // Check 2 (deferred): Sau khi gắn listener, check lại lần nữa
    // Vì có race condition: ảnh có thể load xong GIỮA LÚC check và gắn listener
    requestAnimationFrame(() => {
      if (gen !== generation) return; // Đã chuyển bài khác rồi
      if (img.complete && img.naturalWidth > 0) {
        cleanupListeners(img);
        startFade(dummy, gen);
      }
    });

    // Safety timeout: Nếu sau 3 giây mà vẫn WAITING → reset về IDLE
    // Phòng trường hợp load event không bao giờ fire (network error, blob URL, v.v.)
    safetyTimer = setTimeout(() => {
      if (gen === generation && crossfadeState === 'WAITING') {
        console.warn('[GlassyUI: Cover] ⚠️ Safety timeout: WAITING stuck for 3s, resetting to IDLE');
        cleanupListeners(img);
        killCurrentDummy();
        crossfadeState = 'IDLE';
      }
      safetyTimer = null;
    }, 3000);
  };

  const observer = new MutationObserver((mutations) => {
    for (let mut of mutations) {
      if (mut.type === 'childList') {
        for (let node of mut.removedNodes) {
          if (node.nodeType === 1 && node.id === 'bls-video') {
            createVideoDummy(node);
          }
        }

        for (let node of mut.addedNodes) {
          if (node.nodeType === 1 && node.id === 'bls-video') {
            waitForNewVideoThenFade(node);
          }
        }
      }

      if (mut.type === 'attributes' && mut.attributeName === 'src') {
        const img = mut.target;

        if (img.id === 'blyrics-img' || img.id === 'img') {
          const oldSrc = mut.oldValue;
          const newSrc = img.src;

          // Bỏ qua nếu src không hợp lệ hoặc không thực sự thay đổi
          if (!oldSrc || oldSrc === newSrc || oldSrc.startsWith('data:')) continue;

          // Fallback animated -> static: khi ảnh mới đổi src, cho video cũ fade khi ảnh sẵn sàng.
          waitForImageThenFadeVideo(img);

          // Tăng generation → vô hiệu hóa tất cả callback cũ
          generation++;
          const currentGen = generation;

          // Xử lý cleanup listeners cũ (luôn cần thiết dù ở state nào)
          cleanupListeners(img);

          if (crossfadeState === 'IDLE') {
            // IDLE: Tạo dummy mới cho ảnh cũ, chuyển sang WAITING
            activeDummy = createDummy(img, oldSrc);
            console.debug('[GlassyUI: Cover] ⏳ Waiting for new cover to load...');
            crossfadeState = 'WAITING';
            waitForImageThenFade(img, activeDummy, currentGen);
          }
          else if (crossfadeState === 'WAITING') {
            // WAITING: Đang chờ ảnh load mà chuyển bài nữa
            // → Giữ nguyên dummy cũ (nó đang hiện ảnh trước đó, vẫn đúng về mặt visual)
            // → Chỉ cần đổi listener sang chờ ảnh mới
            waitForImageThenFade(img, activeDummy, currentGen);
          }
          else if (crossfadeState === 'FADING') {
            // FADING: Đang fade mà chuyển bài nữa
            // → Cancel fade cũ, bắt đầu cycle mới với oldSrc hiện tại
            killCurrentDummy();
            activeDummy = createDummy(img, oldSrc);
            crossfadeState = 'WAITING';
            waitForImageThenFade(img, activeDummy, currentGen);
          }
        }
      }
    }
  });

  function initObserver() {
    const thumbnailContainer = document.querySelector('#song-image');
    if (thumbnailContainer) {
      // Capture phase để pre-hold chạy trước listener bubbling mặc định của BLS.
      document.removeEventListener('bls-send-player-time', handlePlayerTimeForVideoCrossfade, true);
      document.removeEventListener('bls-send-player-time', handlePlayerTimeForVideoCrossfade);
      document.addEventListener('bls-send-player-time', handlePlayerTimeForVideoCrossfade, { capture: true });

      observer.observe(thumbnailContainer, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['src'],
        attributeOldValue: true
      });
      console.info('[GlassyUI: Cover] Observer started. Seamless crossfade enabled.');
    } else {
      setTimeout(initObserver, 1000);
    }
  }

  initObserver();
})();


// =========================================================================
// PHẦN 3: PLAYER BAR - HIỆU ỨNG FADE OUT KHI CHUYỂN BÀI
// Mô tả: Tạo overlay snapshot thông tin bài cũ rồi fade out mượt mà
// Fix: YouTube xóa nội dung (text, ảnh) ngay lập tức → CSS transition
//      không thấy được → cần JS overlay để giữ hình ảnh cũ fade ra
// =========================================================================

(function () {
  'use strict';

  let lastState = null;   // Cache thông tin bài hát hiện tại
  let fadeOverlay = null;  // Overlay đang fade
  let fadeTimer = null;    // Timer dọn dẹp
  let resizeTimer = null;  // Debounce resize

  // Cache trạng thái bài hát hiện tại (chỉ khi có dữ liệu)
  function captureState() {
    const mc = document.querySelector('.middle-controls.ytmusic-player-bar');
    if (!mc) return;

    const title = mc.querySelector('yt-formatted-string.title.ytmusic-player-bar');
    if (!title || title.hasAttribute('is-empty')) return;

    const img = mc.querySelector('.thumbnail-image-wrapper img.image');
    const byline = mc.querySelector('yt-formatted-string.byline');
    const wrapper = mc.querySelector('.thumbnail-image-wrapper');
    const cw = mc.querySelector('.content-info-wrapper');

    // Tính vị trí thực tế so với .middle-controls
    const mcRect = mc.getBoundingClientRect();
    const wrapperRect = wrapper?.getBoundingClientRect();
    const cwRect = cw?.getBoundingClientRect();

    const thumbLeft = wrapperRect ? (wrapperRect.left - mcRect.left) : 0;
    const gap = (wrapperRect && cwRect) ? (cwRect.left - wrapperRect.right) : 12;

    // Capture computed font styles để overlay khớp pixel-perfect
    const titleCS = getComputedStyle(title);
    const bylineCS = byline ? getComputedStyle(byline) : null;

    lastState = {
      imgSrc: img?.src || '',
      titleText: title?.textContent?.trim() || '',
      bylineText: byline?.title || byline?.textContent?.trim() || '',
      thumbW: wrapper?.offsetWidth || 48,
      thumbH: wrapper?.offsetHeight || 48,
      thumbLeft: thumbLeft,
      gap: gap,
      // Font styles cho title
      titleFontSize: titleCS.fontSize,
      titleFontWeight: titleCS.fontWeight,
      titleFontFamily: titleCS.fontFamily,
      titleLineHeight: titleCS.lineHeight,
      titleColor: titleCS.color,
      // Font styles cho subtitle
      bylineFontSize: bylineCS?.fontSize || '14px',
      bylineFontWeight: bylineCS?.fontWeight || '400',
      bylineFontFamily: bylineCS?.fontFamily || 'inherit',
      bylineLineHeight: bylineCS?.lineHeight || '20px',
      bylineColor: bylineCS?.color || 'rgba(255,255,255,0.7)'
    };
  }

  // Dọn dẹp overlay
  function killOverlay() {
    if (fadeTimer) { clearTimeout(fadeTimer); fadeTimer = null; }
    if (fadeOverlay) { fadeOverlay.remove(); fadeOverlay = null; }
  }

  // Tạo overlay snapshot với thông tin bài cũ
  function createOverlay(middleControls) {
    if (!lastState || !lastState.titleText) return null;
    killOverlay();

    const ov = document.createElement('div');
    ov.className = 'ytm-songinfo-fade-overlay';
    Object.assign(ov.style, {
      position: 'absolute', inset: '0',
      display: 'flex', alignItems: 'center',
      paddingLeft: lastState.thumbLeft + 'px',
      gap: lastState.gap + 'px',
      opacity: '1', pointerEvents: 'none', zIndex: '10',
      transition: 'opacity 0.35s cubic-bezier(0.2, 0.8, 0.2, 1), transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1)',
      transform: 'translateY(0)', overflow: 'hidden'
    });

    // Thumbnail
    if (lastState.imgSrc) {
      const wrap = document.createElement('div');
      Object.assign(wrap.style, {
        width: lastState.thumbW + 'px', height: lastState.thumbH + 'px',
        borderRadius: '12px', overflow: 'hidden', flexShrink: '0',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
      });
      const img = document.createElement('img');
      img.src = lastState.imgSrc;
      Object.assign(img.style, { width: '100%', height: '100%', objectFit: 'cover', display: 'block' });
      wrap.appendChild(img);
      ov.appendChild(wrap);
    }

    // Text container (dùng gap thật thay vì paddingLeft)
    const txt = document.createElement('div');
    Object.assign(txt.style, {
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
      overflow: 'hidden', minWidth: '0', flex: '1'
    });

    // Title (dùng computed styles thay vì hardcode)
    const t = document.createElement('span');
    t.textContent = lastState.titleText;
    Object.assign(t.style, {
      color: lastState.titleColor, fontSize: lastState.titleFontSize,
      fontWeight: lastState.titleFontWeight, fontFamily: lastState.titleFontFamily,
      lineHeight: lastState.titleLineHeight,
      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
    });
    txt.appendChild(t);

    // Subtitle (dùng computed styles thay vì hardcode)
    if (lastState.bylineText) {
      const s = document.createElement('span');
      s.textContent = lastState.bylineText;
      Object.assign(s.style, {
        color: lastState.bylineColor, fontSize: lastState.bylineFontSize,
        fontWeight: lastState.bylineFontWeight, fontFamily: lastState.bylineFontFamily,
        lineHeight: lastState.bylineLineHeight,
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
      });
      txt.appendChild(s);
    }

    ov.appendChild(txt);
    middleControls.appendChild(ov);
    return ov;
  }

  // Helper: tạo overlay rồi fade out
  function triggerFadeOut(mc) {
    fadeOverlay = createOverlay(mc);
    if (fadeOverlay) {
      void fadeOverlay.offsetWidth; // force reflow
      console.info('[GlassyUI: Player] 💨 Fading out old track info...');
      fadeOverlay.style.opacity = '0';
      fadeOverlay.style.transform = 'translateY(5px)';
      fadeTimer = setTimeout(killOverlay, 400);
    }
  }

  // Helper: ẩn children tức thì rồi fade in (dùng cho bài cached)
  // Tạo hiệu ứng crossfade: overlay (bài cũ) fade out ↔ children (bài mới) fade in
  function fadeInChildren(mc) {
    const children = mc.querySelectorAll(':scope > .thumbnail-image-wrapper, :scope > .content-info-wrapper, :scope > .middle-controls-buttons');

    // Bước 1: Ẩn tức thì (tắt transition)
    children.forEach(child => {
      child.style.setProperty('transition', 'none', 'important');
      child.style.setProperty('opacity', '0', 'important');
      child.style.setProperty('transform', 'translateY(5px)', 'important');
    });

    // Bước 2: Force reflow để browser ghi nhận state opacity:0
    void mc.offsetWidth;

    // Bước 3: Gỡ inline → CSS transition kicks in → fade from 0→1
    requestAnimationFrame(() => {
      children.forEach(child => {
        child.style.removeProperty('transition');
        child.style.removeProperty('opacity');
        child.style.removeProperty('transform');
      });
    });
  }

  // Observer: theo dõi cả is-empty (non-cached) VÀ title attribute (cached)
  const observer = new MutationObserver((mutations) => {
    for (const mut of mutations) {
      if (mut.type !== 'attributes') continue;

      const el = mut.target;
      if (!el.matches || !el.matches('yt-formatted-string.title.ytmusic-player-bar')) continue;

      const mc = el.closest('.middle-controls');
      if (!mc) continue;

      // === CASE 1: is-empty thay đổi (bài CHƯA cache — có loading) ===
      if (mut.attributeName === 'is-empty') {
        if (el.hasAttribute('is-empty')) {
          // Bắt đầu chuyển bài → fade out overlay
          triggerFadeOut(mc);
        } else {
          // Bài mới đã load xong → dọn overlay, cache state mới
          killOverlay();
          setTimeout(captureState, 200);
        }
      }

      // === CASE 2: title attribute thay đổi (bài ĐÃ cache — đổi liền) ===
      if (mut.attributeName === 'title') {
        // Bỏ qua nếu đang trong flow is-empty (Case 1 đã xử lý)
        if (el.hasAttribute('is-empty')) continue;

        const oldTitle = mut.oldValue;
        const newTitle = el.getAttribute('title');

        // Chỉ xử lý khi title thực sự thay đổi sang bài khác
        if (oldTitle && newTitle && oldTitle !== newTitle) {
          console.info('[GlassyUI: Player] 🔄 Crossfading cached track info...');
          // Bài cached → Overlay (bài cũ) fade out + Children (bài mới) fade in = crossfade
          triggerFadeOut(mc);
          fadeInChildren(mc);
          // Cache state mới ngay (nội dung đã sẵn sàng)
          setTimeout(captureState, 50);
        }
      }
    }
  });

  function init() {
    const playerBar = document.querySelector('ytmusic-player-bar');
    if (playerBar) {
      observer.observe(playerBar, {
        attributes: true,
        attributeFilter: ['is-empty', 'title'],
        attributeOldValue: true,
        subtree: true
      });
      captureState();
      if (!lastState) setTimeout(captureState, 2000);

      // Recapture khi resize cửa sổ (debounce 300ms)
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(captureState, 300);
      });

      console.info('[GlassyUI: Player] Observer started. Smooth track transitions enabled.');
    } else {
      setTimeout(init, 1000);
    }
  }

  init();
})();