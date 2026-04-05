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
        console.warn('[Crossfade] Safety timeout: WAITING stuck for 3s, resetting to IDLE');
        cleanupListeners(img);
        killCurrentDummy();
        crossfadeState = 'IDLE';
      }
      safetyTimer = null;
    }, 3000);
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

          // Tăng generation → vô hiệu hóa tất cả callback cũ
          generation++;
          const currentGen = generation;

          // Xử lý cleanup listeners cũ (luôn cần thiết dù ở state nào)
          cleanupListeners(img);

          if (crossfadeState === 'IDLE') {
            // IDLE: Tạo dummy mới cho ảnh cũ, chuyển sang WAITING
            activeDummy = createDummy(img, oldSrc);
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
      observer.observe(thumbnailContainer, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['src'],
        attributeOldValue: true
      });
      console.log("[Crossfade Glassy Music] V2.1 Observer Started!");
    } else {
      setTimeout(initObserver, 1000);
    }
  }

  initObserver();
})();