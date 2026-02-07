// Dán CSS theme "cucu" của bạn vào giữa 2 dấu huyền (`) ở dưới
const MY_CUSTOM_CSS = `

/* =================================================================================================================*/
/* MERGED THEME V15: Upstream                                                                                       */
/* Adds: Fade effect from Dynamic Background, transparent background for music/video switch                         */
/* Fixes: Blue line when press ALT, some fix because new BL version break artwork when fullscreen                   */
/* Based on: Dynamic Background (by chengg), Big Blurry Slow Lyrics for TV (by zobiron), Luxurious Glass (by SKMJi) */
/* Made by: Gemini 3 Pro and NanKill                                                                                */
/* ================================================================================================================ */

:root {
  /* -- [ Cấu hình chung ] -- */
  --blyrics-lyric-active-color: white;
  --blyrics-lyric-inactive-color: rgba(255, 255, 255, 0.4);
  --blyrics-font-family: "Verdana", var(--noto-sans-universal), sans-serif;
  
  /* Font size & Line height */
  --blyrics-font-size: 4.5rem; 
  --blyrics-font-weight: 700;
  --blyrics-line-height: 1.4;

  /* -- [ Layout Variables ] -- */
  --yt-cover-size: 650px;
  --side-panel-width: 55%;
  --blyrics-bottom-spacing: 50px;

  /* -- [ Glassmorphism Variables ] -- */
  --blyrics-bg-color: rgba(0, 0, 0, 0.25);
  --blyrics-border-radius: 18px;
  
  /* Shadow: Toạ độ 0 0 để đều 4 cạnh */
  --blyrics-box-shadow: 0 0 60px rgba(0, 0, 0, 0.4), 0 0 25px rgba(255, 255, 255, 0.12) inset;
  
  --blyrics-background-filter: blur(70px) saturate(2.5) brightness(70%);
}

/* --- BƯỚC 1: Bật Blur mặc định cho TẤT CẢ trường hợp --- */
ytmusic-player-bar,
#player-bar-background {
  backdrop-filter: blur(var(--blyrics-blur-amount)) !important;
  background: transparent !important; /* Đảm bảo nền trong suốt để thấy blur */
}

/* --- BƯỚC 2: Tắt Blur KHI VÀ CHỈ KHI Player đang mở --- */
/* Logic: Kiểm tra nếu body có chứa #layout đang mở player -> thì tắt blur ở bar */
body:has(#layout[player-ui-state="PLAYER_PAGE_OPEN"]) ytmusic-player-bar,
body:has(#layout[player-ui-state="PLAYER_PAGE_OPEN"]) #player-bar-background {
  backdrop-filter: none !important;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

#layout[player-ui-state="PLAYER_PAGE_OPEN"] #mini-guide-background,
#layout[player-ui-state="PLAYER_PAGE_OPEN"] #nav-bar-background,
#layout[player-ui-state="PLAYER_PAGE_OPEN"] #guide-wrapper {
  backdrop-filter: none !important; 
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

/* Side Panel - Khung Lyric Kính */
#side-panel {
  background-color: var(--blyrics-bg-color) !important;
  border-radius: var(--blyrics-border-radius) !important;
  box-shadow: var(--blyrics-box-shadow) !important;
  min-width: var(--side-panel-width) !important;
  z-index: 1; 
  
  margin-bottom: var(--blyrics-bottom-spacing) !important;
  height: auto !important;
  max-height: calc(100vh - 120px) !important; 
}

/* Xóa hiệu ứng fade đen */
#song-media-window,
.song-media-controls,
.ytp-gradient-top, 
.ytp-gradient-bottom {
    background: none !important;       
    background-image: none !important; 
    box-shadow: none !important;       
}

/* Album Cover Size */
ytmusic-player-page:not([video-mode]):not([player-fullscreened]):not([blyrics-dfs]):not([player-ui-state="MINIPLAYER"]) #player.ytmusic-player-page, 
ytmusic-player[player-ui-state=FULLSCREEN], 
ytmusic-player, 
ytmusic-player[player-ui-state=FULLSCREEN] {
  max-width: var(--yt-cover-size) !important;
  border-radius: var(--blyrics-border-radius) !important;
  box-shadow: var(--blyrics-box-shadow) !important;
  overflow: hidden; 
  margin: 0 auto !important; 
  background: transparent !important;
}

/* Fix oversize cover when in fullscreen because new BL break it */
ytmusic-player-page:not([is-mweb-modernization-enabled]):not([is-mweb-modernization-enabled]):not([blyrics-video-mode])
#player.ytmusic-player-page {
  max-width: 400px !important;
}

/* Fix nút chuyển Song/Video */
ytmusic-av-toggle,
.song-video-switching-controller {
  z-index: 9999 !important; 
  position: absolute !important;
  overflow: visible !important;
}

#player.ytmusic-player-page .song-video-switching-controller {
    display: flex !important;
    visibility: visible !important;
}

ytmusic-player-expanding-menu,
#expanding-menu {
    /* Màu nền bán trong suốt (đen mờ 60%) */
    background: rgba(0, 0, 0, 0.6) !important;
    
    /* Bo góc và thêm viền mỏng cho nổi bật */
    border-radius: 8px !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    
    /* Đổ bóng để tách biệt khỏi nền */
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5) !important;
}

/* ============================================== */
/* PHẦN 2: STYLE LYRIC (NO LAG EDITION)           */
/* ============================================== */

.blyrics-container {
  padding: 20px;
  position: relative;
  z-index: 2;
  text-align: left;
  overflow-y: auto; 
  overflow-x: hidden;
}

.blyrics-container > div {
  opacity: 0.2;
  filter: blur(6px);
  margin-bottom: 20px;
  transition: opacity 0.7s ease-out, 
              filter 0.7s ease-out,
              transform 1.66s ease-out;
  white-space: pre-wrap; 
  word-break: break-word; 
  overflow-wrap: break-word;
  max-width: 100%;
}

.blyrics-container > div > span {
  display: inline;
  filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.5));
}

/* Active Lyric Animation */
.blyrics-container > div.blyrics--animating:not(:empty):not(.blyrics--translated):not(.blyrics--romanized) {
  opacity: 1;
  filter: blur(0px);
  transform: scale(1.02);
  
  transition: opacity 0.7s ease calc(var(--blyrics-anim-delay) - 0.3s), 
              filter 0.7s ease calc(var(--blyrics-anim-delay) - 0.3s),
              transform 1.666s ease calc(var(--blyrics-anim-delay) - 0.3s);
}

/* Hover to see Static Lyrics */
.blyrics-container:hover > div {
  opacity: 1 !important;
  filter: blur(0px) !important;
  transition: opacity 0.3s ease, filter 0.3s ease;
}

/* Translated & Romanized */
.blyrics-container > div > span.blyrics--translated,
.blyrics-container > div > span.blyrics--romanized {
  display: block;
  margin-top: 10px;
  color: #ddd;
}

.blyrics-container > div > span.blyrics--translated {
  font-size: 1.8rem;
  font-weight: 400;
}

.blyrics-container > div > span.blyrics--romanized {
  font-size: 1.5rem;
  font-style: italic;
  opacity: 0.8;
}

/* ============================================== */
/* PHẦN 3: FULLSCREEN MODE FIXES (NEW)            */
/* ============================================== */

/* Khi vào Fullscreen (F11) */
ytmusic-player-page[player-fullscreened] #side-panel {
  /* 1. Xóa bỏ hiệu ứng kính, viền, bóng đổ */
  background: transparent !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
  border: none !important;
  
  /* 2. Căn giữa tuyệt đối cho mọi tỉ lệ video (16:9 hay 1:1) */
  margin: auto !important; 
  align-self: center !important;
  
  /* Reset chiều cao để không bị giới hạn */
  max-height: 100vh !important;
  padding-bottom: 0 !important;
}

/* ============================================== */
/* PHẦN 4: RESPONSIVE                             */
/* ============================================== */

.blyrics-user-scrolling > div:not(.blyrics--animating) {
  opacity: 1 !important;
  filter: blur(0px) !important; 
  transition: opacity 0.4s ease, filter 0.4s ease;
}

@media (max-width: 1000px) {
  :root {
    --blyrics-font-size: 3.5rem;
    --side-panel-width: 45%;
  }
}

@media (max-width: 615px) {
  .blyrics-container {
    font-size: 2rem;
  }
  .blyrics-container > div > span.blyrics--translated {
    font-size: 1.5rem;
  }
}
/* ============================================== */
/* PHẦN 5: ADD-ON TỪ CHENGG THEME (SAFE MODE)     */
/* Chỉ lấy background và hiệu ứng kính cho Home   */
/* Upstreamed: Added Transition Fade Logic        */
/* ============================================== */

:root {
  /* Cấu hình độ mờ và sáng cho hình nền trang chủ */
  --home-bg-blur: 70px;       /* Độ nhòe nền */
  --home-bg-brightness: 0.7;  /* Độ tối nền (0.5 là tối, 1 là sáng gốc) */
  --home-bg-scale: 1.2;       /* Độ phóng to ảnh nền */
  
  /* Cấu hình độ trong suốt của thanh công cụ */
  --glass-ui-bg: rgba(0, 0, 0, 0.3); /* Màu nền các thanh (đen mờ) */
  --glass-ui-blur: 15px;             /* Độ mờ đục của kính */
  --glass-ui-border: 1px solid rgba(255, 255, 255, 0.1);
}

/* ============================================== */
/* PHẦN 5: ADD-ON TỪ CHENGG THEME (SAFE MODE)     */
/* UPDATED: Cross-fade Logic                      */
/* ============================================== */

:root {
  --home-bg-blur: 70px;
  --home-bg-brightness: 0.6; /* Giảm sáng chút để text dễ đọc hơn */
  --home-bg-scale: 1.2;      /* QUAN TRỌNG: Phóng to để giấu viền đen */
  
  --glass-ui-bg: rgba(0, 0, 0, 0.3);
  --glass-ui-blur: 15px;
  --glass-ui-border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Cấu hình chung cho cả 2 lớp ảnh */
#browse-page::before, #browse-page::after,
#search-page::before, #search-page::after {
  content: "";
  position: fixed;
  inset: 0;
  height: 100vh;
  width: 100vw;
  
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  
  /* Scale 1.2 để trị bệnh viền đen do Blur */
  transform: scale(var(--home-bg-scale)); 
  
  filter: blur(var(--home-bg-blur)) brightness(var(--home-bg-brightness)) saturate(1.2);

  will-change: opacity, background-image;
  
  /* Tắt pointer-events để không chặn click chuột vào nội dung */
  pointer-events: none; 
}

/* 1. LAYER ẢNH CŨ (Nằm dưới - ::after) */
#browse-page::after,
#search-page::after {
  /* Dùng ảnh cũ, nếu không có thì ẩn luôn */
  background-image: var(--blyrics-previous-bg, none); 
  z-index: -52; /* Thấp nhất */
  opacity: 1;
}

/* 2. LAYER ẢNH MỚI (Nằm trên - ::before) */
#browse-page::before,
#search-page::before {
  background-image: var(--blyrics-background-img, none); 
  z-index: -51; /* Cao hơn ảnh cũ */
  opacity: 1;   /* Mặc định hiện */
}

/* 3. ANIMATION FADE */
/* Logic: Ảnh mới bắt đầu từ Opacity 0 -> 1. Ảnh cũ vẫn nằm dưới đít giữ chỗ. */
.art-fade-anim::before {
  animation: bgFadeIn 1.5s ease-in-out forwards; 
}

@keyframes bgFadeIn {
  0% {
    opacity: 0; 
  }
  100% {
    opacity: 1;
  }
}

/* Các phần UI Glass giữ nguyên như cũ */
#nav-bar-background, ytmusic-app-layout #nav-bar-background,
#guide-wrapper, #mini-guide-background {
  background: var(--glass-ui-bg) !important;
  backdrop-filter: blur(var(--glass-ui-blur)) !important;
  border-color: rgba(255,255,255,0.1) !important;
  transition: background 0.3s ease-in;
}

ytmusic-browse-response[has-background] .background-gradient.ytmusic-browse-response {
  background: transparent !important;
  background-image: none !important;
}

html { scrollbar-width: none; }
body::-webkit-scrollbar { display: none; }

/* 2. Làm trong suốt các thành phần UI để thấy nền */

/* Thanh điều hướng trên cùng (Top Bar) */
#nav-bar-background,
ytmusic-app-layout #nav-bar-background {
  background: var(--glass-ui-bg) !important;
  backdrop-filter: blur(var(--glass-ui-blur)) !important;
  border-bottom: var(--glass-ui-border) !important;
  transition: background 0.3s ease-in; /* Thêm transition cho mượt */
}

/* Thanh bên trái (Sidebar / Mini Guide) */
#guide-wrapper,
#mini-guide-background {
  background: var(--glass-ui-bg) !important;
  backdrop-filter: blur(var(--glass-ui-blur)) !important;
  border-right: var(--glass-ui-border) !important;
  transition: background 0.3s ease-in; /* Thêm transition cho mượt */
}

/* Xóa nền xám mặc định của Youtube Music ở trang chủ */
ytmusic-browse-response[has-background] .background-gradient.ytmusic-browse-response {
  background: transparent !important;
  background-image: none !important;
}

/* Fix: Ẩn thanh cuộn trang chủ cho đẹp (giống Chengg) */
html {
  scrollbar-width: none;
}
body::-webkit-scrollbar {
  display: none;
}

/* ============================================== */
/* FIX: XÓA NỀN GỐC (IMMERSIVE BACKGROUND)        */
/* ============================================== */

div#background.immersive-background {
  display: none !important;      /* Xóa hoàn toàn khỏi layout */
  visibility: hidden !important; /* Đảm bảo không nhìn thấy */
  opacity: 0 !important;         /* Độ trong suốt về 0 */
  background: transparent !important;
}

/* Ẩn luôn cả thẻ con bên trong cho chắc chắn */
ytmusic-fullbleed-thumbnail-renderer[is-background] {
  display: none !important;
}

ytmusic-tabs {
    background: transparent !important; /* Xóa màu nền */
    box-shadow: none !important;        /* Xóa cái bóng đen bên dưới */
}

/* ============================================== */
/* KẾT THÚC PHẦN ADD-ON                           */
/* ============================================== */

/* ============================================== */
/* FINAL FIX: DIỆT TẬN GỐC SCROLLBAR (V3)         */
/* ============================================== */

/* 1. Ẩn thanh cuộn của TẤT CẢ phần tử con khi đang Fullscreen */
ytmusic-player-page[player-fullscreened] *::-webkit-scrollbar {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
  background: transparent !important;
}

ytmusic-player-page[player-fullscreened] * {
  scrollbar-width: none !important;
  -ms-overflow-style: none !important;
}

/* 2. Chặn trang web (body) bị cuộn nếu nội dung bị tràn ra ngoài màn hình */
/* Dùng :has để check nếu đang fullscreen thì khóa body lại */
body:has(ytmusic-player-page[player-fullscreened]) {
  overflow: hidden !important;
}

/* 3. Đảm bảo khung lyric vẫn cuộn được (nhưng không hiện thanh) */
ytmusic-player-page[player-fullscreened] .blyrics-container {
  overflow-y: auto !important;
}
/* ============================================== */
/* CLEAN UI: TẮT VIỀN XANH & BÔI ĐEN              */
/* ============================================== */

/* 1. Tắt viền xanh (Outline) khi bấm Alt, Tab hoặc Click vào các nút */
*:focus, *:focus-visible {
    outline: none !important;
    border: none !important;
    box-shadow: none !important;
}

/* 2. Tắt tính năng bôi đen text/ảnh (Selection) khi lỡ tay kéo chuột */
/* Giúp app nhìn xịn hơn, giống Spotify app */
body, html, #player, ytmusic-player-page {
    user-select: none !important;
    -webkit-user-select: none !important; /* Dành cho Chrome/Chromium */
}

/* 3. (Tuỳ chọn) Cho phép bôi đen lại ở khung tìm kiếm để còn gõ chữ */
input, textarea, #input, .ytmusic-search-box {
    user-select: text !important;
    -webkit-user-select: text !important;
    /* Giữ lại outline nhẹ để biết đang gõ ở đâu (tuỳ thích) */
    /* outline: 1px solid rgba(255,255,255,0.2) !important; */
}

/* ============================================== */
/* STYLE: NÚT SONG/VIDEO (FIX RỚT DÒNG + FULLSCREEN) */
/* ============================================== */

/* 1. Khung chứa (Cái rãnh nền) */
.av-toggle.ytmusic-av-toggle {
    background-color: rgba(0, 0, 0, 0.4) !important; 
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    backdrop-filter: none !important; 
    border-radius: 999px !important;
    
    /* FIX LAYOUT: Cho phép rãnh co giãn thoải mái */
    width: auto !important; 
    max-width: none !important; /* Gỡ bỏ giới hạn chiều rộng nếu có */
    display: inline-flex !important; /* Đảm bảo nội dung nằm ngang */
}

/* 2. Thiết lập chung cho nút bấm */
.av-toggle.ytmusic-av-toggle button {
    transition: all 0.2s ease-in-out !important;
    border-radius: 999px !important; 
    box-shadow: none !important;
    
    /* --- [QUAN TRỌNG] CHỐNG RỚT DÒNG --- */
    white-space: nowrap !important;  /* Ép chữ luôn nằm trên 1 dòng bất kể màn hình */
    word-break: keep-all !important; /* Không cho ngắt từ (Bài-hát) */
    flex-shrink: 0 !important;       /* Cấm nút bị co lại khi thiếu chỗ */
    
    /* Tinh chỉnh kích thước */
    padding: 0 16px !important; /* Thêm khoảng cách 2 bên chữ cho thoáng */
    min-width: auto !important; /* Bỏ giới hạn chiều rộng tối thiểu */
    width: auto !important;     /* Cho phép nút tự to ra theo độ dài chữ */
}

/* 3. Trạng thái ĐANG CHỌN (Sáng đèn) */
.av-toggle.ytmusic-av-toggle button[aria-pressed="true"] {
    background-color: rgba(255, 255, 255, 0.2) !important; 
    color: #ffffff !important; 
    font-weight: 700 !important;
}

/* 4. Trạng thái KHÔNG CHỌN (Chìm đi) */
.av-toggle.ytmusic-av-toggle button[aria-pressed="false"] {
    background-color: transparent !important; 
    color: rgba(255, 255, 255, 0.5) !important; 
}
`;

function injectStyles() {
    console.log("[NanKill's Skibidi Theme] Injecting MERGED THEME V15...");
    console.log("[NanKill's Skibidi Theme] Blowing ur YT Music Client...");
    
    // Tạo thẻ <style>
    const style = document.createElement('style');
    style.id = 'force-nankill-skibidi-theme';
    style.type = 'text/css';
    
    // Thêm CSS vào
    if (style.styleSheet){
      style.styleSheet.cssText = MY_CUSTOM_CSS;
    } else {
      style.appendChild(document.createTextNode(MY_CUSTOM_CSS));
    }

    // Chèn vào đầu trang (hoặc cuối body để ghi đè mạnh hơn)
    (document.head || document.documentElement).appendChild(style);
}

// Chèn ngay lập tức
injectStyles();

// Chèn lại lần nữa khi trang load xong (đề phòng bị extension ghi đè)
window.addEventListener('DOMContentLoaded', injectStyles);
window.addEventListener('load', injectStyles);
