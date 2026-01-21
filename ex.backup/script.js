/**
 * @fileoverview YouTube Music player integration script for BetterLyrics.
 * Handles real-time player state monitoring and event dispatching.
 * Optimized V2: Patches both methods AND DOM properties to prevent Lag Spikes.
 */

/* ==========================================================================
   PHẦN 1: SUPER MONKEY PATCH (VÁ LỖI YOUTUBE & DOM PROPERTIES)
   Mục đích: Chặn đứng lag spike 1.3s do sự kiện durationchange/resize
   ========================================================================== */

const patchYouTubePlayerSize = () => {
  const player = document.getElementById("movie_player");

  // Kiểm tra nếu player chưa load hoặc đã patch rồi thì thôi
  if (!player || player.isPatchedV2) return;

  console.log("[BetterLyrics Fix] Đang kích hoạt Super Patch V2...");

  // --- 1. Chuẩn bị Cache ---
  // Lưu trữ kích thước hiện tại
  let cachedWidth = player.clientWidth;
  let cachedHeight = player.clientHeight;
  
  // Lưu lại hàm getPlayerSize gốc (để dùng nếu cần)
  const originalGetPlayerSize = player.getPlayerSize ? player.getPlayerSize.bind(player) : null;
  const originalGetVideoContentRect = player.getVideoContentRect ? player.getVideoContentRect.bind(player) : null;

  // --- 2. ResizeObserver: Người gác cổng ---
  // Chỉ cập nhật kích thước khi trình duyệt thực sự thay đổi kích thước player
  const observer = new ResizeObserver(() => {
    // Khi resize thật, ta mới cho phép đọc lại DOM để lấy số mới
    // Tạm thời gỡ patch property để đọc giá trị thật
    const tempWidth = Element.prototype.lookupGetter ? 
                      Element.prototype.lookupGetter('clientWidth').call(player) : 
                      player.getBoundingClientRect().width;
                      
    const tempHeight = Element.prototype.lookupGetter ? 
                       Element.prototype.lookupGetter('clientHeight').call(player) : 
                       player.getBoundingClientRect().height;

    if (tempWidth !== cachedWidth || tempHeight !== cachedHeight) {
        cachedWidth = tempWidth;
        cachedHeight = tempHeight;
        // console.log("Size updated:", cachedWidth, cachedHeight);
    }
  });
  observer.observe(player);

  // --- 3. Override DOM Properties (Vá thuộc tính clientWidth/Height) ---
  // Đây là đòn quyết định để chặn cái spike 1.3s trong ảnh của bạn
  try {
      Object.defineProperty(player, 'clientWidth', {
          get: () => cachedWidth, // Trả về số có sẵn, không tính toán
          configurable: true
      });
      Object.defineProperty(player, 'clientHeight', {
          get: () => cachedHeight, // Trả về số có sẵn, không tính toán
          configurable: true
      });
      console.log("[BetterLyrics Fix] Đã vá xong DOM Properties (clientWidth/clientHeight) 🛡️");
  } catch (e) {
      console.warn("[BetterLyrics Fix] Không thể vá DOM properties:", e);
  }

  // --- 4. Override Methods (Vá các hàm của YouTube) ---
  if (originalGetPlayerSize) {
    player.getPlayerSize = function () {
      return { width: cachedWidth, height: cachedHeight };
    };
  }
  
  if (originalGetVideoContentRect) {
      player.getVideoContentRect = function() {
          return {
              left: 0, top: 0, 
              width: cachedWidth, 
              height: cachedHeight
          };
      }
  }

  // Đánh dấu đã patch V2
  player.isPatchedV2 = true;
};

// Chạy interval để tìm và vá player
const patchInterval = setInterval(() => {
  if (document.getElementById("movie_player")) {
    patchYouTubePlayerSize();
  }
}, 1000);


/* ==========================================================================
   PHẦN 2: OPTIMIZED LYRICS SCRIPT (LOOP 50ms)
   ========================================================================== */

let tickLyricsInterval;
let lastPlayerTime = 0;
let lastPlayerTimestamp = 0;

// Cache riêng cho vòng lặp extension
let loopCachedRect = { left: 0, top: 0, width: 0, height: 0 };

const updateLoopCache = () => {
    const player = document.getElementById("movie_player");
    if (player) {
        // Vì đã vá ở trên, gọi cái này giờ siêu nhẹ
        loopCachedRect = { 
            left: 0, top: 0, 
            width: player.clientWidth, 
            height: player.clientHeight 
        };
    }
};

updateLoopCache();
window.addEventListener("resize", updateLoopCache);
setInterval(updateLoopCache, 1000);

const startLyricsTick = () => {
  stopLyricsTick();

  // Tăng delay lên 50ms để giảm tải Layerize/Paint
  tickLyricsInterval = setInterval(function () {
    const player = document.getElementById("movie_player");
    if (player) {
      try {
        const now = Date.now();
        const { video_id, title, author } = player.getVideoData();
        const audioTrackData = player.getAudioTrack();
        const duration = player.getDuration();
        const { isPlaying, isBuffering } = player.getPlayerStateObject();
        
        const contentRect = loopCachedRect; 
        const currentTime = player.getCurrentTime();

        if (currentTime !== lastPlayerTime || !isPlaying) {
          lastPlayerTime = currentTime;
          lastPlayerTimestamp = now;
        }

        const timeDiff = (now - lastPlayerTimestamp) / 1000;
        const time = currentTime + timeDiff;

        document.dispatchEvent(
          new CustomEvent("blyrics-send-player-time", {
            detail: {
              currentTime: time,
              videoId: video_id,
              song: title,
              artist: author,
              duration: duration,
              audioTrackData: audioTrackData,
              browserTime: now,
              playing: isPlaying && !isBuffering,
              contentRect: contentRect,
            },
          })
        );
      } catch (e) {
        console.log(e);
        stopLyricsTick();
      }
    }
  }, 50); // <--- Đã chỉnh thành 50ms cho mát máy
};

const stopLyricsTick = () => {
  if (tickLyricsInterval) {
    clearInterval(tickLyricsInterval);
    tickLyricsInterval = null;
  }
};

window.addEventListener("unload", stopLyricsTick);

document.addEventListener("blyrics-seek-to", () => {
  const player = document.getElementById("movie_player");
  const seekTime = parseFloat(document.body.dataset.blyricsSeekTime || "0");
  if (player && seekTime >= 0) {
    player.seekTo(seekTime, true);
    player.playVideo();
  }
});

startLyricsTick();