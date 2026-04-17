// Dán CSS theme "cucu" của bạn vào giữa 2 dấu huyền (`) ở dưới
const MY_CUSTOM_CSS = `
/* =================================================================================================================*/
/* MERGED THEME V21: Some UI Update                                                                                 */
/* Adds: Crossfade animated artwork (beta), new toast UI                                                            */
/* Fixes: Differrent text height in diffrent languages, crossfade artwork sometime not work                         */
/* Based on: Dynamic Background (by chengg), Big Blurry Slow Lyrics for TV (by zobiron), Luxurious Glass (by SKMJi) */
/* Made by: Gemini 3.1 Pro and NanKill                                                                              */
/* ================================================================================================================ */

:root,
html,
body,
ytmusic-app {
    --ytmusic-title-line-height-dynamic: 1.2 !important;
    --ytmusic-body-line-height-dynamic: 1.4 !important;
    --ytmusic-title-line-height: 1.2 !important;
    --ytmusic-body-line-height: 1.4 !important;
}

/* ============================================== */
/* 1. BIẾN CẤU HÌNH (ROOT VARIABLES)              */
/* ============================================== */
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

/* ============================================== */
/* 2. TINH CHỈNH GIAO DIỆN CHUNG (GLOBAL FIXES)   */
/* ============================================== */
/* Xóa thanh cuộn cho gọn mắt */
html, .scrollable-content, .scroller {
  scrollbar-width: none !important;
}
body::-webkit-scrollbar {
  display: none;
}

/* FINAL FIX: DIỆT TẬN GỐC SCROLLBAR (V3) */
/* Ẩn thanh cuộn của TẤT CẢ phần tử con khi đang Fullscreen */
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

/* Chặn trang web (body) bị cuộn nếu nội dung bị tràn ra ngoài màn hình */
/* Dùng :has để check nếu đang fullscreen thì khóa body lại */
body:has(ytmusic-player-page[player-fullscreened]) {
  overflow: hidden !important;
}

/* Đảm bảo khung lyric vẫn cuộn được (nhưng không hiện thanh) */
ytmusic-player-page[player-fullscreened] .blyrics-container {
  overflow-y: auto !important;
}

/* ============================================== */
/* CLEAN UI: TẮT VIỀN XANH & BÔI ĐEN              */
/* ============================================== */

/* Tắt viền xanh (Outline) khi bấm Alt, Tab hoặc Click vào các nút */
*:focus, *:focus-visible {
    outline: none !important;
    border: none !important;
    box-shadow: none !important;
}

/* Tắt tính năng bôi đen text/ảnh (Selection) khi lỡ tay kéo chuột */
/* Giúp app nhìn xịn hơn, giống Spotify app */
body, html, #player, ytmusic-player-page {
    user-select: none !important;
    -webkit-user-select: none !important; /* Dành cho Chrome/Chromium */
}

/* Cho phép bôi đen lại ở khung tìm kiếm để còn gõ chữ */
input, textarea, #input, .ytmusic-search-box {
    user-select: text !important;
    -webkit-user-select: text !important;
    /* Giữ lại outline nhẹ để biết đang gõ ở đâu (tuỳ thích) */
    /* outline: 1px solid rgba(255,255,255,0.2) !important; */
}

/* FIX: XÓA NỀN GỐC (IMMERSIVE BACKGROUND) */
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

/* [GỘP TỰ ĐỘNG MỌI CLASS CHUNG] Xóa nền, làm trong suốt */
.menu.ytmusic-multi-row-list-item-renderer,
/* Podcast Header */
ytmusic-visual-header-renderer[has-banner-image] .gradient-container.ytmusic-visual-header-renderer,
.ytmusic-browse-response .content-container-wrapper,
.content-container-wrapper .gradient-container,
/* Làm trong suốt các dòng item đơn lẻ */
ytmusic-multi-select-menu-item-renderer,
ytmusic-multi-select-menu-item-renderer button,
/* BẢNG XÁC NHẬN (Ví dụ: Hủy đăng ký), BẢNG THÔNG TIN BÀI HÁT (Credits)*/
/* Áp dụng cho bảng Sắp xếp và Chọn quốc gia */
ytmusic-multi-select-menu-renderer,
/* Xử lý nền của Avatar và các phần tử nhỏ hơn */
yt-avatar-shape,
.yt-spec-avatar-shape,
.yt-spec-avatar-shape--avatar-size-extra-large,
/* Triệt tiêu nền xám của bảng Engagement Panel và các thành phần con */
ytmusic-engagement-panel-section-list-renderer,
ytmusic-engagement-panel-title-header-renderer,
playlist-collaboration-view-model,
content-list-item-view-model,
.ytContentListItemViewModelContentListItemWrapper,
#header.ytmusic-engagement-panel-section-list-renderer,
#content.ytmusic-engagement-panel-section-list-renderer,
.scrollable-content.ytmusic-engagement-panel-section-list-renderer,
/* Xóa nền thừa */
ytmusic-settings-page,
ytmusic-dialog .content,
ytmusic-dialog #content,
ytmusic-unified-share-panel-renderer #contents,
ytmusic-playlist-form,
ytmusic-playlist-form .content,
ytmusic-playlist-form #general-pane,
ytmusic-playlist-form #collaborate-pane,
ytmusic-playlist-form tp-yt-iron-pages,
tp-yt-paper-listbox ytmusic-dropdown-item-renderer,
tp-yt-paper-listbox tp-yt-paper-item,
tp-yt-paper-listbox tp-yt-paper-item.menu-item,
yt-confirm-dialog-renderer,
ytmusic-dismissable-dialog-renderer,
ytmusic-dismissable-dialog-renderer #metadata,
ytmusic-dismissable-dialog-renderer .top-bar,
ytmusic-multi-select-menu-renderer #container,
ytmusic-multi-select-menu-renderer #items,
ytmusic-multi-select-menu-renderer ytmusic-menu-title-renderer,
ytmusic-background-promo-renderer,
ytmusic-offline-item-section-renderer,
ytmusic-item-section-renderer #items.ytmusic-item-section-renderer,
/* Nếu bạn muốn áp dụng riêng cho phần hộp thoại bên trong */
.ytmusicMultiPageMenuRendererHost,
ytmusic-search-box #suggestion-list ytmusic-search-suggestions-section,
/* Fix xóa nền xám mặc định của YouTube Music */
.background-gradient {
  background: transparent !important;
  background-color: transparent !important;
}

/* ============================================== */
/* 3. NỀN GIAO DIỆN & HIỆU ỨNG KÍNH (BLUR & BG)   */
/* ============================================== */
/* BACKGROUND ĐỘNG TRANG CHỦ & TÌM KIẾM */
#browse-page::before,
#search-page::before {
  content: "";
  position: fixed;
  inset: 0;
  height: 120vh;
  background: var(--blyrics-background-img);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  transform: scale(1.2);
  z-index: -50;
  /* Thông số mặc định: blur 60px, bão hòa 1.5, độ sáng 0.7 */
  filter: blur(60px) saturate(1.5) brightness(0.7);
  transition: background 0.4s ease-in-out 0.3s;
  will-change: background;
}
ytmusic-fullbleed-thumbnail-renderer[is-background] .image {
  mask-image: linear-gradient(transparent);
}

/* Bật Blur mặc định cho TẤT CẢ trường hợp --- */
ytmusic-player-bar,
#player-bar-background {
  backdrop-filter: blur(var(--blyrics-blur-amount)) !important;
  background: transparent !important; /* Đảm bảo nền trong suốt để thấy blur */
}

/* Tắt Blur KHI VÀ CHỈ KHI Player đang mở --- */
/* Logic: Kiểm tra nếu body có chứa #layout đang mở player -> thì tắt blur ở bar */
body:has(#layout[player-ui-state="PLAYER_PAGE_OPEN"]) ytmusic-player-bar,
body:has(#layout[player-ui-state="PLAYER_PAGE_OPEN"]) #player-bar-background {
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
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

/* ============================================== */
/* 4. THANH ĐIỀU HƯỚNG & TÌM KIẾM (NAV & SEARCH)  */
/* ============================================== */
/* THANH ĐIỀU HƯỚNG & TITLE BAR - HIỆU ỨNG KÍNH NỐI LIỀN */
body #nav-bar-background.ytmusic-app-layout {
  top: 0 !important;
  height: calc(var(--ytmusic-nav-bar-height) + var(--menu-bar-height, 0px)) !important;
  opacity: 1;
  backdrop-filter: blur(20px) !important;
  -webkit-backdrop-filter: blur(20px) !important;
  mask-image: linear-gradient(to bottom, black 70%, transparent 100%) !important;
  -webkit-mask-image: linear-gradient(to bottom, black 70%, transparent 100%) !important;
  background: transparent !important;
  border-bottom: transparent !important;
  border-top: 0 !important;
}

ytmusic-app-layout.content-scrolled #nav-bar-divider {
  opacity: 1;
  backdrop-filter: blur(20px) !important;
  -webkit-backdrop-filter: blur(20px) !important;
  background: transparent !important;
  border-bottom: transparent !important;
  border-top: 0 !important;
}

ytmusic-app[is-bauhaus-sidenav-enabled] #guide-wrapper.ytmusic-app {
  background: transparent;
  padding: 2px;
  border-right: transparent;
}

ytmusic-app-layout[is-bauhaus-sidenav-enabled].content-scrolled #mini-guide-background.ytmusic-app-layout,
ytmusic-app-layout[is-bauhaus-sidenav-enabled][player-page-open] #mini-guide-background.ytmusic-app-layout {
  opacity: 0;
}

tp-yt-paper-item.ytmusic-guide-entry-renderer:hover {
  background: rgba(255, 255, 255, 0.1); 
}

#divider {
  border: 0 !important;
}

/* THANH TÌM KIẾM (SEARCH BOX) MỚI */
ytmusic-search-box .search-box {
  border-radius: 12px !important;
  background: rgba(255, 255, 255, 0.1) !important;
  border: transparent !important;
}
ytmusic-search-box .search-box .yt-icon-shape {
  color: white;
}
input.ytmusic-search-box {
  color: rgba(255, 255, 255, 0.7);
}
ytmusic-search-box[has-query] input.ytmusic-search-box,
ytmusic-search-box[opened] input.ytmusic-search-box {
  color: white;
}
ytmusic-search-box[has-query] input.ytmusic-search-box::placeholder,
ytmusic-search-box[opened] input.ytmusic-search-box::placeholder {
  color: white;
}
.search-container.ytmusic-search-box {
  border-radius: 12px;
}
ytmusic-search-box[has-query] .search-container.ytmusic-search-box,
ytmusic-search-box[opened] .search-container.ytmusic-search-box {
  border-radius: 12px;
  background: transparent !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

/* Hiệu ứng kính cho Danh sách gợi ý tìm kiếm */
ytmusic-search-box #suggestion-list {
  top: 0;
  opacity: 0;
  visibility: hidden;
  display: initial !important;
  border-radius: 12px !important;
  background: rgba(0, 0, 0, 0.8) !important; /* Đổi từ transparent sang dòng này */
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
  border: transparent !important;
  transition: opacity 0.3s ease, top 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), visibility 0.3s;
}
ytmusic-search-box[opened] #suggestion-list {
  top: calc(var(--ytmusic-search-box-height) + 16px) !important;
  opacity: 1;
  visibility: visible;
}
ytmusic-search-box #suggestion-list ytmusic-search-suggestion {
  background: transparent !important;
  color: white;
  border-radius: 12px;
  transition: background 0.2s ease, color 0.2s ease;
}
ytmusic-search-box #suggestion-list ytmusic-search-suggestion:hover {
  background: rgba(255, 255, 255, 0.1) !important;
  color: white;
}
#suggestions .ytmusic-search-suggestions-section {
  border-radius: 8px;
}

/* ============================================== */
/* 5. KHUNG PLAYER & HIỆU ỨNG (PLAYER & EFFECTS)  */
/* ============================================== */
/* Xóa hiệu ứng fade đen */
#song-media-window,
.song-media-controls,
.ytp-gradient-top, 
.ytp-gradient-bottom {
    background: none !important;       
    background-image: none !important; 
    box-shadow: none !important;       
}

ytmusic-queue-header-renderer,
ytmusic-player-queue-item,
ytmusic-responsive-list-item-renderer,
ytmusic-carousel-shelf-renderer {
    padding-inline: 20px; /* Áp dụng 20px cho cả left và right */
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

/* STYLE: NÚT SONG/VIDEO (FIX RỚT DÒNG + FULLSCREEN) */
/* Khung chứa (Cái rãnh nền) */
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

/* Thiết lập chung cho nút bấm */
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

/* Trạng thái ĐANG CHỌN (Sáng đèn) */
.av-toggle.ytmusic-av-toggle button[aria-pressed="true"] {
    background-color: rgba(255, 255, 255, 0.2) !important; 
    color: #ffffff !important; 
    font-weight: 700 !important;
}

/* Trạng thái KHÔNG CHỌN (Chìm đi) */
.av-toggle.ytmusic-av-toggle button[aria-pressed="false"] {
    background-color: transparent !important; 
    color: rgba(255, 255, 255, 0.5) !important; 
}

/* Hiệu ứng Blur (Kính mờ) CHỈ ÁP DỤNG KHI FULLSCREEN */
ytmusic-player-page[player-fullscreened] .av-toggle.ytmusic-av-toggle {
    backdrop-filter: blur(12px) !important;
    -webkit-backdrop-filter: blur(12px) !important; /* Hỗ trợ thêm cho các trình duyệt lõi Chromium */
    background-color: rgba(0, 0, 0, 0.2) !important; /* Tùy chọn: Làm nền trong suốt hơn một chút để thấy rõ hiệu ứng blur */
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

/* HIỆU ỨNG MỞ/ĐÓNG PLAYER PAGE & MINIPLAYER */
/* Ép các lớp nền Blur (đang bị position: fixed) mờ đi cùng lúc */
ytmusic-app-layout:not([player-page-open]) ytmusic-player-page::before,
ytmusic-app-layout:not([player-page-open]) ytmusic-player-page[is-mweb-modernization-enabled] #main-panel::before {
  opacity: 0 !important;
}

ytmusic-app-layout:not([player-page-open]) [id*="-backdrop-"] {
  transform: translateY(6vh) !important;
}

/* 3. TRƯỢT CANVAS: Đây là linh hồn của hiệu ứng. Chỉ phần hình ảnh bị kéo xuống! */
ytmusic-app-layout:not([player-page-open]) [id^="better-lyrics-kawarp-"]:not([id*="-backdrop-"]) canvas {
  transform: translateY(4vh) !important;
  transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) !important;
}

ytmusic-player-page {
  transition: transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) !important;
}

.toggle-player-page-button {
  transition: transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) !important;
}

/* ============================================== */
/* PHẦN 6: SMOOTH TRANSITIONS & ANIMATIONS        */
/* ============================================== */

/* KEYFRAMES */
@keyframes mp-grow {
  0% {
    transform: translateY(40px) scale(0.3);
    opacity: 0;
  }
  100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

@keyframes mp-shrink {
  0% {
    transform: scale(1.5); 
    opacity: 0.5;
  }
  100% {
    transform: translate3d(0, 0, 0) scale(1); 
    opacity: 1; 
  }
}

/* TRẠNG THÁI FULLSCREEN */
ytmusic-player[player-ui-state="FULLSCREEN"],
ytmusic-player-page[player-fullscreened] #player.ytmusic-player-page {
    /* Ép tắt mọi animation đang chạy lỡ dở từ miniplayer/mở player để tránh xung đột */
    animation: none !important; 
    transition: max-width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s,
                opacity 0.4s ease 0.2s !important; 
    will-change: max-width, opacity; 
}

/* TRẠNG THÁI MỞ PLAYER BÌNH THƯỜNG */
ytmusic-player-page[player-page-open]:not([player-fullscreened]) #player.ytmusic-player-page {
    animation: mp-grow 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) !important;
    transition: none !important; 
    will-change: transform, opacity;
}

/* TRẠNG THÁI THU NHỎ XUỐNG MINIPLAYER */
/* Đã thêm :not([player-fullscreened]) để chặn đứng hiệu ứng này khi bấm Fullscreen */
ytmusic-player-page[mini-player-enabled]:not([player-page-open]):not([player-fullscreened]) #player.ytmusic-player-page {
    animation: mp-shrink 0.5s cubic-bezier(0.4, 0, 0.2, 1) !important;
    transition: none !important; 
    will-change: transform, opacity;
}

/* ============================================== */
/* 6. STYLE PHẦN LYRIC (LYRICS & SIDE PANEL)      */
/* ============================================== */
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

/* STYLE LYRIC */
.blyrics-container {
  padding-left: 20px;
  padding-right: 20px;
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
              transform 1.3s ease-out;
  white-space: pre-wrap; 
  word-break: break-word; 
  overflow-wrap: break-word;
  max-width: 100%;
}

/* ===== NO-SYNC MODE: Tắt blur khi lyrics tĩnh/không có sync ===== */
.blyrics-container.blyrics--no-sync > div {
  opacity: 1 !important;
  filter: blur(0px) !important;
  transform: none !important;
  transition: opacity 0.5s ease-out, filter 0.5s ease-out !important;
}

/* Animation chuyển từ no-sync (rõ) sang sync (blur) mượt mà */
@keyframes blyricsBlurIn {
  from {
    opacity: 1;
    filter: blur(0px);
  }
  to {
    opacity: 0.2;
    filter: blur(6px);
  }
}

.blyrics-container.blyrics--entering-sync > div:not(.blyrics--animating) {
  animation: blyricsBlurIn 0.7s ease-out forwards !important;
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
              transform 1.3s ease calc(var(--blyrics-anim-delay) - 0.3s);
}

/* Hover to see Static Lyrics */
.blyrics-container:hover > div {
  opacity: 1 !important;
  filter: blur(0px) !important;
  transition: opacity 0.3s ease 1s, filter 0.3s ease 1s;
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

/* FULLSCREEN MODE FIXES */
/* Xóa bỏ hiệu ứng kính và mở rộng tối đa không gian của side-panel */
ytmusic-player-page[player-fullscreened] #side-panel {
  background: transparent !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
  border: none !important;
  
  /* Bổ sung: Xóa khoảng trống bên ngoài và giới hạn chiều cao */
  max-height: none !important; 
  height: 100% !important;
  padding-top: 65px !important;
}

/* RESPONSIVE */
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
/* 7. NÚT BẤM, TABS & DANH SÁCH (UI COMPONENTS)   */
/* ============================================== */
/* NÚT BẤM VÀ CÁC THÀNH PHẦN NỔI BẬT KHÁC */
/* Nút Tạo Playlist mới */
.yt-spec-button-shape-next--mono.yt-spec-button-shape-next--tonal {
  background: rgba(255, 255, 255, 0.1);
  border: transparent;
  color: white;
  border-radius: 16px;
}
.yt-spec-button-shape-next--mono.yt-spec-button-shape-next--tonal:hover {
  background: rgba(255, 255, 255, 0.2);
}
.yt-spec-button-shape-next--mono.yt-spec-button-shape-next--tonal .yt-icon-shape {
  color: white;
}

/* Nút trượt danh sách (Carousel Buttons) */
yt-icon-button.ytmusic-carousel-shelf-renderer,
.yt-spec-button-shape-next--mono.yt-spec-button-shape-next--outline {
  background: rgba(255, 255, 255, 0.1);
  border: transparent;
  color: white;
  border-radius: 16px;
}
yt-icon-button.ytmusic-carousel-shelf-renderer:hover,
.yt-spec-button-shape-next--mono.yt-spec-button-shape-next--outline:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Nút Play to trên bìa Album ở Trang chủ */
ytmusic-play-button-renderer[size="MUSIC_PLAY_BUTTON_SIZE_HUGE"] {
  --ytmusic-play-button-size: 40px;
  --ytmusic-play-button-icon-size: 24px;
}
ytmusic-play-button-renderer[size="MUSIC_PLAY_BUTTON_SIZE_HUGE"] .content-wrapper {
  background: rgba(0,0,0,0.6);
  opacity: 0;
}
ytmusic-item-thumbnail-overlay-renderer:hover ytmusic-play-button-renderer[size="MUSIC_PLAY_BUTTON_SIZE_HUGE"] .content-wrapper {
  opacity: 1;
}
ytmusic-play-button-renderer[size="MUSIC_PLAY_BUTTON_SIZE_HUGE"] .content-wrapper:hover {
  background: black;
}
ytmusic-play-button-renderer[size="MUSIC_PLAY_BUTTON_SIZE_HUGE"]:is([state="paused"], [state="playing"]) .content-wrapper {
  opacity: 1;
}

.thumbnail-overlay.ytmusic-two-row-item-renderer[content-position="MUSIC_ITEM_THUMBNAIL_OVERLAY_CONTENT_POSITION_CENTERED"] #content {
  align-items: end;
  justify-content: right;
  bottom: 12px;
  right: 12px;
}

yt-img-shadow[object-fit="CONTAIN"] img,
.thumbnail-overlay {
  border-radius: 8px;
  object-fit: cover !important;
  overflow: hidden;
}

/* Bo góc cho toàn bộ khung ảnh Album/Playlist ở Trang chủ */
ytmusic-two-row-item-renderer .image-wrapper,
ytmusic-responsive-list-item-renderer[play-button-state] {
  border-radius: 16px; /* Bạn có thể đổi thành 8px hoặc 12px tùy sở thích */
  overflow: hidden;
}

/* Trả lại hiệu ứng fade mượt cho toàn bộ overlay mặc định của YouTube */
ytmusic-item-thumbnail-overlay-renderer {
  transition: opacity 0.3s ease !important;
}

/* Logic gốc: Ép tàng hình nền đen của bài ĐANG PHÁT (khi không di chuột) */
ytmusic-item-thumbnail-overlay-renderer:not([play-button-state="default"]) #background.ytmusic-item-thumbnail-overlay-renderer {
  opacity: 0 !important;
}

/* Logic gốc: Hiện lại nền đen của bài ĐANG PHÁT khi di chuột vào */
ytmusic-item-thumbnail-overlay-renderer:not([play-button-state="default"]):hover #background.ytmusic-item-thumbnail-overlay-renderer {
  opacity: 1 !important;
}

/* Logic gốc: Lớp nền đen bo tròn bao quanh cái nút Play bự ở Trang chủ */
ytmusic-play-button-renderer[size="MUSIC_PLAY_BUTTON_SIZE_HUGE"] .content-wrapper {
  background: rgba(0, 0, 0, 0.6);
  opacity: 0;
  transition: opacity 0.3s ease, background 0.3s ease;
}

ytmusic-item-thumbnail-overlay-renderer #background.ytmusic-item-thumbnail-overlay-renderer {
  transition: opacity 0.3s ease !important;
}

ytmusic-item-thumbnail-overlay-renderer:hover ytmusic-play-button-renderer[size="MUSIC_PLAY_BUTTON_SIZE_HUGE"] .content-wrapper {
  opacity: 1;
}
ytmusic-play-button-renderer[size="MUSIC_PLAY_BUTTON_SIZE_HUGE"] .content-wrapper:hover {
  background: black;
}
ytmusic-play-button-renderer[size="MUSIC_PLAY_BUTTON_SIZE_HUGE"]:is([state="paused"], [state="playing"]) .content-wrapper {
  opacity: 1;
}

/* Thêm hiệu ứng mượt và phóng to nhẹ cho chính nút Play */
ytmusic-play-button-renderer[size="MUSIC_PLAY_BUTTON_SIZE_HUGE"] .content-wrapper,
#play-button .content-wrapper.ytmusic-play-button-renderer {
  transition: opacity 0.3s ease, background 0.3s ease, transform 0.3s ease;
}

/* Hiệu ứng phóng to nút Play lên 1 chút khi hover giống hệt bản gốc */
#play-button .content-wrapper.ytmusic-play-button-renderer:hover {
  transform: scale(1.2);
}

ytmusic-tabs#tabs {
    /* Thu gọn và căn giữa */
    width: 50% !important;  /* Tự co lại vừa khít với các tab bên trong */
    margin: 10px auto 0 auto !important;      /* Đẩy thanh tab ra giữa màn hình */
    top: calc(var(--menu-bar-height, 0px) + 100px) !important;

    /* Bo tròn và hiệu ứng kính mờ (cũ) */
    border-radius: 16px !important; 
    background-color: rgba(0, 0, 0, 0.6) !important; 
    backdrop-filter: blur(12px) !important; 
    -webkit-backdrop-filter: blur(12px) !important; 
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.8) !important; 
    padding-left: 30px;
    padding-top: 10px;
    padding-bottom: 10px;
}

/* Xóa nốt viền xám ở container bên trong (nếu có) */
ytmusic-tabs#tabs .tab-container {
    border-bottom: none !important; 
}

ytmusic-tabs#tabs .tab-container {
    display: flex !important;           /* Đảm bảo hộp con sử dụng bố cục linh hoạt Flexbox */
    justify-content: center !important; /* Đẩy tất cả các phần tử bên trong ra chính giữa */
    width: 100% !important;             /* Bắt buộc hộp con giãn nạp đầy 70% chiều rộng của thanh tab tổng */
}

/* Tắt thanh gạch chân chạy qua chạy lại mặc định của YouTube Music */
ytmusic-tabs#tabs tp-yt-paper-tabs-selection-bar,
ytmusic-tabs#tabs .selection-bar {
    display: none !important; 
}

/* Style cho Tab ĐANG ĐƯỢC CHỌN (Nổi bật) */
ytmusic-tabs#tabs .tab.selected,
ytmusic-tabs#tabs .tab[aria-selected="true"] {
    border-bottom: none !important; /* Đảm bảo xóa sạch gạch chân */
    background-color: rgba(255, 255, 255, 0.15) !important; /* Nền trắng hơi mờ nhẹ */
    border-radius: 10px !important; /* Bo tròn các góc của tab */
    color: #ffffff !important; /* Chữ trắng sáng */
    font-weight: 700 !important; /* In đậm chữ */
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.4) !important; /* Chữ phát sáng nhẹ */
    padding: 8px 20px !important; /* Tăng khoảng trống trong nút cho cân đối */
    margin: 0 4px !important; /* Cách nhẹ hai tab ra với nhau */
    transition: all 0.3s ease !important; /* Hiệu ứng chuyển đổi mượt mà */
}

/* Style cho Tab BÌNH THƯỜNG (Chưa được chọn) */
ytmusic-tabs#tabs .tab:not(.selected) {
    color: rgba(255, 255, 255, 0.5) !important; /* Chữ mờ đi để nhường sân khấu cho tab đang chọn */
    font-weight: 500 !important;
    padding: 8px 20px !important;
    margin: 0 4px !important;
    transition: all 0.3s ease !important;
}

/* Hiệu ứng khi lướt chuột qua Tab bình thường */
ytmusic-tabs#tabs .tab:not(.selected):hover {
    background-color: rgba(255, 255, 255, 0.08) !important; /* Sáng nhẹ lên khi di chuột */
    border-radius: 10px !important;
    color: #ffffff !important;
}

/* CĂN CHỈNH CHO THANH TAB BÊN TRONG SIDE-PANEL (UP NEXT, LYRICS, RELATED) */
ytmusic-player-page tp-yt-paper-tabs.tab-header-container {
    background-color: rgba(0, 0, 0, 0.2) !important;
    border-radius: 12px !important;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3) !important; /* Đã trả lại box-shadow mềm mại để có cảm giác nổi */
    margin: 12px 20px !important;
  padding: 0 6px !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    min-height: 48px !important;
    display: flex !important;
    align-items: center !important;
    position: relative !important;
}

/* Tắt thanh gạch ngang dưới chữ */
ytmusic-player-page tp-yt-paper-tabs.tab-header-container #selectionBar {
    display: none !important;
}

/* Canh giữa khối tab theo trục dọc để không bị lệch lên */
ytmusic-player-page tp-yt-paper-tabs.tab-header-container #tabsContainer,
ytmusic-player-page tp-yt-paper-tabs.tab-header-container #tabsContent {
  height: 100% !important;
  display: flex !important;
  align-items: center !important;
}

/* Giữ cụm tab dồn về trái, chừa chỗ cho footer nằm bên phải */
ytmusic-player-page tp-yt-paper-tabs.tab-header-container #tabsContent {
  justify-content: flex-start !important;
}

/* Giới hạn lại kích cỡ và khoảng cách của từng tab nhỏ */
ytmusic-player-page tp-yt-paper-tabs.tab-header-container tp-yt-paper-tab.tab-header {
    margin: 0 4px !important;
    padding: 0 16px !important;
    height: 36px !important;
    display: flex !important; /* Thêm Flex để kéo text... */
    align-items: center !important; /* ...và canh giữa theo chiều dọc */
    justify-content: center !important; /* Canh đều theo chiều ngang */
  position: relative !important;
  top: 1px !important;
}

/* Canh giữa chính phần chữ trong từng tab */
ytmusic-player-page tp-yt-paper-tabs.tab-header-container tp-yt-paper-tab.tab-header .tab-content {
  height: 100% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  line-height: 1 !important;
  padding: 0 !important;
}

/* Style cho Tab đang chọn (Up Next, Lyrics, Related) */
ytmusic-player-page tp-yt-paper-tabs.tab-header-container tp-yt-paper-tab.tab-header.iron-selected {
    background-color: rgba(255, 255, 255, 0.15) !important;
    border-radius: 8px !important;
    color: #ffffff !important;
    font-weight: 700 !important;
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.4) !important;
    transform: scale(1.02) !important;
    transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) !important;
}

/* Style cho Tab bình thường */
ytmusic-player-page tp-yt-paper-tabs.tab-header-container tp-yt-paper-tab.tab-header:not(.iron-selected) {
    color: rgba(255, 255, 255, 0.6) !important;
    font-weight: 500 !important;
    border-radius: 8px !important;
    transition: all 0.3s ease !important;
}

/* Hover cho Tab bình thường */
ytmusic-player-page tp-yt-paper-tabs.tab-header-container tp-yt-paper-tab.tab-header:not(.iron-selected):hover {
    background-color: rgba(255, 255, 255, 0.05) !important;
    color: #ffffff !important;
}

/* Dock footer Better Lyrics lên thanh tab và neo sang phải */
ytmusic-player-page tp-yt-paper-tabs.tab-header-container .nankill-blyrics-footer-in-tabs,
ytmusic-player-page tp-yt-paper-tabs.tab-header-container .blyrics-footer__container {
  position: absolute !important;
  right: 8px !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  margin-left: 0 !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 8px !important;
  height: 32px !important;
  padding: 0 14px !important;
  border-radius: 8px !important;
  background: rgba(255, 255, 255, 0.08) !important;
  border: 1px solid rgba(255, 255, 255, 0.12) !important;
  font-size: 13px !important;
  font-weight: 600 !important;
  line-height: 1.1 !important;
  color: rgba(255, 255, 255, 0.78) !important;
  white-space: nowrap !important;
  width: fit-content !important;
  min-width: 200px !important;
  max-width: 360px !important;
  overflow: hidden !important;
  opacity: 0.9;
  z-index: 3 !important;
}

ytmusic-player-page tp-yt-paper-tabs.tab-header-container .nankill-blyrics-footer-in-tabs a,
ytmusic-player-page tp-yt-paper-tabs.tab-header-container .blyrics-footer__container a {
  color: rgba(255, 255, 255, 0.9) !important;
  text-decoration: none !important;
  font-size: inherit !important;
  line-height: 1.1 !important;
  overflow: hidden;
  text-overflow: ellipsis;
}

ytmusic-player-page tp-yt-paper-tabs.tab-header-container .nankill-blyrics-footer-in-tabs img,
ytmusic-player-page tp-yt-paper-tabs.tab-header-container .blyrics-footer__container img {
  width: 18px !important;
  height: 18px !important;
  border-radius: 4px;
  flex-shrink: 0;
}

.thumbnail-image-wrapper {
  /* Bo tròn các góc */
  border-radius: 12px; /* Bạn có thể tăng giảm số này, hoặc dùng 50% nếu muốn hình tròn hoàn toàn */
  /* Đảm bảo ảnh bên trong không bị tràn ra ngoài phần góc đã bo */
  overflow: hidden; 
  /* Đổ bóng để tạo cảm giác nổi lên */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2); 
}
/* ============================================== */
/* 8. MENU & HỘP THOẠI (POPUPS, MENUS, DIALOGS)   */
/* ============================================== */
/* KEYFRAMES */
@keyframes menuFadeIn {
  0% {
    opacity: 0;
    margin-top: -10px; /* Trượt nhẹ từ trên xuống */
  }
  100% {
    opacity: 1;
    margin-top: 0;
  }
}

/* Container của Menu 3 chấm */
tp-yt-iron-dropdown.ytmusic-popup-container {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(15px);
  border-radius: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  border: transparent;
  overflow: hidden;
  
  /* THÊM DÒNG NÀY: Kích hoạt hiệu ứng xuất hiện trong 0.2 giây */
  animation: menuFadeIn 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}

/* Ép nền bên trong menu trong suốt để thấy được hiệu ứng kính bên ngoài */
tp-yt-paper-listbox.ytmusic-menu-popup-renderer {
  background: transparent;
  border: 0;
}

/* Gộp cả 6 loại bảng vào chung một thuộc tính */
ytmusic-add-to-playlist-renderer,
ytmusic-unified-share-panel-renderer,
ytmusic-dialog,
ytmusic-engagement-panel-section-list-renderer,
tp-yt-paper-dialog:has(yt-confirm-dialog-renderer),
tp-yt-paper-dialog:has(ytmusic-dismissable-dialog-renderer) {
  /* Nền đen trong suốt & hiệu ứng mờ */
  background-color: rgba(15, 15, 15, 0.5) !important;
  backdrop-filter: blur(15px) !important;
  -webkit-backdrop-filter: blur(15px) !important;
  
  /* Viền và khối 3D */
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 16px !important;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3) !important;
  
  /* Ép bảng luôn nằm giữa màn hình (ghi đè inline CSS của YouTube) */
  position: fixed !important;
  top: 50% !important;
  left: 50% !important;
  margin: 0 !important; /* Xóa margin thừa nếu có */

  /* Gọi animation xuất hiện */
  animation: popupXuatHien 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) forwards !important;
}

ytmusic-engagement-panel-title-header-renderer #header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important; /* Tạo đường kẻ mờ ngăn cách header */
  background: transparent !important;
}

/* Animation xuất hiện */
@keyframes popupXuatHien {
  0% {
    opacity: 0;
    transform: translate(-50%, -45%) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

/* Sửa nền của mục đang được chọn bên menu trái */
tp-yt-paper-item.category-menu-item.iron-selected {
  background-color: rgba(255, 255, 255, 0.15) !important; /* Trắng mờ 15% */
}

/* (Tùy chọn) Chỉnh luôn hiệu ứng khi di chuột qua các mục khác cho đồng bộ */
tp-yt-paper-item.category-menu-item:hover {
  background-color: rgba(255, 255, 255, 0.08) !important; 
}

/* Áp dụng nền kính mờ cho các hộp thoại thả xuống (Quyền riêng tư, Chất lượng âm thanh, Ngôn ngữ...) */
tp-yt-iron-dropdown .dropdown-content {
  background-color: rgba(15, 15, 15, 0.6) !important;
  backdrop-filter: blur(15px) !important;
  -webkit-backdrop-filter: blur(15px) !important;
  
  /* Thêm viền mỏng và shadow */
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 12px !important; /* Bo góc 12px cho menu nhỏ nhắn hơn */
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5) !important;
  color: rgba(255, 255, 255, 0.9) !important;
  
  /* Animation nhẹ khi mở thẻ */
  animation: menuFadeIn 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) forwards !important;
}

/* Đảm bảo paper-listbox bên trong trong suốt để không đè lên hiệu ứng kính mờ của khung ngoài */
tp-yt-iron-dropdown tp-yt-paper-listbox.dropdown-content {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

/* Đảm bảo màu chữ trong các dropdown của Settings luôn trắng (nhất là thẻ span bên trong) */
tp-yt-iron-dropdown tp-yt-paper-listbox tp-yt-paper-item,
tp-yt-iron-dropdown tp-yt-paper-listbox tp-yt-paper-item span.ytmusic-setting-single-option-menu-renderer {
  color: #fff !important;
  font-family: 'Inter', 'Roboto', sans-serif !important;
}

/* Hiệu ứng sáng lên khi di chuột qua (Hover) */
tp-yt-paper-listbox ytmusic-dropdown-item-renderer:hover,
tp-yt-paper-listbox tp-yt-paper-item.menu-item:hover {
  background-color: rgba(255, 255, 255, 0.1) !important;
  transition: background-color 0.2s ease !important;
  border-radius: 8px !important; /* Bo tròn xíu cho các item được hover */
}

/* Hiệu ứng sáng hơn một chút cho mục đang được chọn (Selected) */
tp-yt-paper-listbox ytmusic-dropdown-item-renderer.iron-selected,
tp-yt-paper-listbox tp-yt-paper-item.menu-item.iron-selected {
  background-color: rgba(255, 255, 255, 0.15) !important;
  border-radius: 8px !important;
  font-weight: 600 !important;
}

/* Bỏ viền outline xấu xí khi click vào mục menu */
tp-yt-paper-listbox tp-yt-paper-item:focus {
  outline: none !important;
}

/* Hiệu ứng khi di chuột qua các mục chọn (Highlight) */
ytmusic-multi-select-menu-item-renderer:hover {
  background-color: rgba(255, 255, 255, 0.08) !important;
}

/* ============================================== */
/* 9. TRANG ĐẶC BIỆT (ARTIST, PODCAST PAGES)      */
/* ============================================== */
/* ========================== ARTIST PAGE ========================== */

ytmusic-immersive-header-renderer {
  background: var(--ytmusic-app); /* Biến mặc định của YT Music, giữ nguyên để không lỗi giao diện web */
}

/* Kéo toàn bộ thẻ bao ngoài lên trên để lấp khoảng trống do --menu-bar-height tạo ra */
ytmusic-immersive-header-renderer,
ytmusic-visual-header-renderer {
    margin-top: calc(var(--menu-bar-height, 0px) * -1) !important;
}

ytmusic-immersive-header-renderer .image {
  margin-left: 0 !important;
  opacity: 0.8;
  filter: brightness(0.95);
}

.description.ytmusic-immersive-header-renderer {
  color: white;
}

ytmusic-toggle-button-renderer yt-formatted-string.ytmusic-toggle-button-renderer {
  color: white;
}

ytmusic-immersive-header-renderer[is-description-expanded] .image {
  filter: brightness(0.55);
}

/* Artist Header */
.image.ytmusic-immersive-header-renderer {
  mask-image: linear-gradient(to bottom, black 60%, transparent 100%);
  mask-repeat: no-repeat;
  mask-size: 100%;
}

/* Sub Button */
ytmusic-subscribe-button-renderer {
  --ytmusic-subscribe-button-outline-color: transparent;
  --ytmusic-subscribe-button-color: white;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  border: transparent;
}

ytmusic-subscribe-button-renderer:hover {
  background: rgba(255, 255, 255, 0.4);
}

ytmusic-subscribe-button-renderer[is-subscribed] {
  --ytmusic-subscribe-button-outline-color: transparent;
  --ytmusic-subscribe-button-color: white;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: transparent;
}

ytmusic-subscribe-button-renderer[is-subscribed]:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Unsub Confirm */
yt-confirm-dialog-renderer[dialog][dialog][dialog] {
  --ytd-user-comment-color: white;
  background: transparent;
}

ytmusic-popup-container tp-yt-paper-dialog.ytmusic-popup-container[role=dialog] {
  outline: none !important;
}

/* Shuffle and Radio Button */
.yt-spec-button-shape-next--mono.yt-spec-button-shape-next--filled {
  color: white;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: transparent;
  border-radius: 16px;
}

.yt-spec-button-shape-next--mono.yt-spec-button-shape-next--filled:hover {
  background: rgba(255, 255, 255, 0.2);
  border: transparent;
}

.yt-spec-button-shape-next--mono.yt-spec-button-shape-next--filled .yt-icon-shape {
  color: white;
}

/* User Page */
ytmusic-subscribe-button-renderer.ytmusic-visual-header-renderer {
  background: none;
}

/* ========================== PODCAST ========================== */

ytmusic-player-page[player-fullscreened] ytmusic-description-shelf-renderer {
  display: none;
}

ytmusic-multi-row-list-item-renderer[is-detailed-view] {
  --ytmusic-list-item-height: 182px;
  --ytmusic-multi-row-list-item-thumbnail-size: 80px;
}

.image.ytmusic-visual-header-renderer {
  mask-image: linear-gradient(to bottom, black 40%, transparent 100%);
  mask-repeat: no-repeat;
  mask-size: 100%;
}

/* Podcast Hover */
.thumbnail-wrapper.ytmusic-multi-row-list-item-renderer {
  position: relative;
  /* Radius art mặc định: 8px */
  border-radius: 8px;
}

ytmusic-multi-row-list-item-renderer.ytmusic-shelf-renderer .thumbnail-overlay {
  aspect-ratio: 16 / 9;
  top: auto;
  bottom: auto;
  height: auto;
}

ytmusic-responsive-header-renderer ytmusic-toggle-button-renderer.ytmusic-responsive-header-renderer {
  /* Button color: rgba(255, 255, 255, 0.1) */
  background: rgba(255, 255, 255, 0.1) !important;
  border: transparent !important;
}

/* Podcast Focused */
ytmusic-multi-row-list-item-renderer[play-button-state] {
  /* Radius highlight big: 12px */
  border-radius: 12px;
}

ytmusic-multi-row-list-item-renderer.ytmusic-shelf-renderer {
  border-bottom: 0 !important;
}

/* Progress Bar */
.foreground-bar.ytmusic-playback-progress-renderer {
  /* Accent color: white */
  background: white;
}

.subtitle.ytmusic-multi-row-list-item-renderer {
  /* Text color 2: rgba(white, 0.7) */
  color: rgba(255, 255, 255, 0.7);
}

/* ============================================== */
/* 10. FADE IN/OUT/SLIDE THÔNG TIN BÀI HÁT CHUYỂN BÀI */
/* ============================================== */
.middle-controls.ytmusic-player-bar {
  position: relative;
}

/* Transition cho các phần tử con (KHÔNG áp dụng cho overlay JS) */
.middle-controls.ytmusic-player-bar > .thumbnail-image-wrapper,
.middle-controls.ytmusic-player-bar > .content-info-wrapper,
.middle-controls.ytmusic-player-bar > .middle-controls-buttons {
  transition: opacity 0.4s cubic-bezier(0.2, 0.8, 0.2, 1),
              transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) !important;
  will-change: opacity, transform;
}

/* Khi đang chuyển bài → ẩn nội dung gốc (overlay JS sẽ fade out thay) */
.middle-controls.ytmusic-player-bar:has(.title[is-empty]) > .thumbnail-image-wrapper,
.middle-controls.ytmusic-player-bar:has(.title[is-empty]) > .content-info-wrapper,
.middle-controls.ytmusic-player-bar:has(.title[is-empty]) > .middle-controls-buttons {
  opacity: 0 !important;
  transform: translateY(5px) !important;
  pointer-events: none !important;
}

/* Thêm padding trái cho nút no-lyrics/LYRIC_FOOTER khi KHÔNG fullscreen */
ytmusic-player-page:not([player-fullscreened]) .blyrics-no-lyrics-button-container {
  padding-left: 18px;
}

/* Thêm padding trái cho dải phân loại (chips) ở up-next khi KHÔNG fullscreen */
ytmusic-player-page:not([player-fullscreened]) ytmusic-chip-cloud-renderer#steering-chips {
  padding-left: 18px;
}

/* =========================================================
   GlassyUI - Side Panel Playlist Queue Design
   ========================================================= */

/* 1. Container: Bóp vào trong bằng margin để không chạm viền */
#contents.ytmusic-player-queue {
  display: flex !important;
  flex-direction: column !important;
  padding: 8px 6px !important;
  border-radius: 20px !important;
  overflow-y: overlay !important;
}

/* 2. Trạng thái mặc định của Item */
ytmusic-player-queue-item {
  display: flex !important;
  align-items: center !important;
  padding: 8px 12px !important;
  border-radius: 12px !important;
  background: transparent !important;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
  cursor: pointer !important;
  border: 1px solid transparent !important;
  margin: 4px 20px !important; /* Đảm bảo an toàn 2 bên ở mọi mục */
  box-sizing: border-box !important;
  position: relative !important;
  z-index: 1 !important;
}

/* 3. Hover Item: NỔI LÊN (Scale & Shadow) thay vì lướt ngang */
ytmusic-player-queue-item:hover {
  background: rgba(255, 255, 255, 0.12) !important;
  backdrop-filter: saturate(110%) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  transform: translateY(-2px) scale(1.02) !important; /* Scale và bay lên */
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25) !important;
  z-index: 5 !important;
}

/* 4. Trạng thái đang phát (Playing/Selected): Khối nổi 3D, Gradient & Glow */
ytmusic-player-queue-item[selected=""] {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1)) !important;
  backdrop-filter: saturate(120%) !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.2) !important;
  transform: scale(1.02) !important;
  margin-top: 6px !important;
  margin-bottom: 10px !important;
  z-index: 4 !important;
}

ytmusic-player-queue-item[selected=""]:hover {
  transform: translateY(-2px) scale(1.03) !important;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05)) !important;
}

/* 5. Typography (Song Info) */
ytmusic-player-queue-item .song-info {
  display: flex !important;
  flex-direction: column !important;
  justify-content: center !important;
  flex-grow: 1 !important;
  overflow: hidden !important;
}

ytmusic-player-queue-item .song-title {
  color: rgba(255, 255, 255, 0.9) !important;
  letter-spacing: 0.3px !important;
  margin-bottom: 2px !important;
  transition: color 0.3s, text-shadow 0.3s !important;
}

ytmusic-player-queue-item .byline {
  color: rgba(255, 255, 255, 0.45) !important;
  transition: color 0.3s !important;
}
ytmusic-player-queue-item:hover .byline {
  color: rgba(255, 255, 255, 0.7) !important;
}
ytmusic-player-queue-item[selected=""] .byline {
  color: rgba(255, 255, 255, 0.85) !important;
}

/* =========================================================
   GlassyUI - Queue Header & Autoplay Footer Design
   ========================================================= */

/* Queue Header ("Playing from") */
ytmusic-queue-header-renderer {
  margin: 12px 14px 12px 14px !important;
  padding: 16px 20px !important;
  background: rgba(20, 20, 20, 0.2) !important;
  backdrop-filter: saturate(180%) !important;
  border-radius: 20px !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.3) !important;
}

ytmusic-queue-header-renderer .container-name.ytmusic-queue-header-renderer {
  gap: 4px !important;
  display: flex !important;
  flex-direction: column !important;
}

ytmusic-queue-header-renderer .title.ytmusic-queue-header-renderer {
  color: rgba(255, 255, 255, 0.5) !important;
  letter-spacing: 0.5px !important;
  text-transform: uppercase !important;
}

ytmusic-queue-header-renderer .subtitle.ytmusic-queue-header-renderer {
  color: rgba(255, 255, 255, 0.95) !important;
  letter-spacing: 0.3px !important;
  text-shadow: 0 2px 10px rgba(255, 255, 255, 0.2) !important;
}

/* Save Button inside Header */
ytmusic-queue-header-renderer ytmusic-chip-cloud-chip-renderer {
  background: transparent !important;
  border: none !important;
  transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) !important;
}

ytmusic-queue-header-renderer ytmusic-chip-cloud-chip-renderer:hover {
  transform: scale(1.05) !important;
}

ytmusic-queue-header-renderer .gradient-box.ytmusic-chip-cloud-chip-renderer {
  background: rgba(255, 255, 255, 0.08) !important;
  border: 1px solid rgba(255, 255, 255, 0.12) !important;
  border-radius: 12px !important;
  padding: 0 14px !important;
  height: 32px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

ytmusic-queue-header-renderer .gradient-box.ytmusic-chip-cloud-chip-renderer:hover {
  background: rgba(255, 255, 255, 0.15) !important;
}

ytmusic-queue-header-renderer a.yt-simple-endpoint.ytmusic-chip-cloud-chip-renderer {
  background: transparent !important;
  display: flex !important;
  align-items: center !important;
  gap: 6px !important;
  text-decoration: none !important;
}

ytmusic-queue-header-renderer yt-icon.ytmusic-chip-cloud-chip-renderer {
  color: rgba(255, 255, 255, 0.9) !important;
  width: 18px !important;
  height: 18px !important;
  margin: 0 !important;
}

ytmusic-queue-header-renderer .text.ytmusic-chip-cloud-chip-renderer {
  color: rgba(255, 255, 255, 0.9) !important;
}

/* Autoplay Footer */
.autoplay.ytmusic-tab-renderer {
  margin: 12px 14px 12px 14px !important;
  padding: 16px 20px !important;
  background: rgba(20, 20, 20, 0.2) !important;
  backdrop-filter: saturate(180%) !important;
  border-radius: 20px !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.3) !important;
}

.autoplay.ytmusic-tab-renderer:not([hidden]) {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
}

.autoplay.ytmusic-tab-renderer[hidden],
.autoplay.ytmusic-tab-renderer[style*="display: none"] {
  display: none !important;
}

.autoplay.ytmusic-tab-renderer .title.ytmusic-tab-renderer {
  color: rgba(255, 255, 255, 0.9) !important;
  letter-spacing: 0.3px !important;
}

.autoplay.ytmusic-tab-renderer .subtitle.ytmusic-tab-renderer {
  color: rgba(255, 255, 255, 0.5) !important;
  margin-top: 4px !important;
}

/* Autoplay Toggle Switch Styling */
.autoplay.ytmusic-tab-renderer tp-yt-paper-toggle-button {
  --paper-toggle-button-checked-bar-color: rgba(255, 255, 255, 0.4) !important;
  --paper-toggle-button-checked-button-color: #fff !important;
  --paper-toggle-button-checked-ink-color: rgba(255, 255, 255, 0.2) !important;
  --paper-toggle-button-unchecked-bar-color: rgba(255, 255, 255, 0.1) !important;
  --paper-toggle-button-unchecked-button-color: rgba(255, 255, 255, 0.4) !important;
}
/* Autoplay Indicator inside Queue List */
div.autoplay.ytmusic-player-queue {
  padding-left: 12px !important;
}

/* =========================================================
   GlassyUI - Toast Notifications
   ========================================================= */
tp-yt-paper-toast#toast {
  /* Ép sử dụng màu Album do plugin tạo ra nhưng kèm vùng alpha để nhìn xuyên qua kính */
  background-color: rgba(var(--ytmusic-album-color-dark, 30, 30, 30), 0.6) !important;
  backdrop-filter: blur(20px) saturate(150%) !important;
  -webkit-backdrop-filter: blur(20px) saturate(150%) !important;
  border-radius: 14px !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.2) !important;
}

/* Fix chữ bên trong để luôn dễ đọc trên nền glass */
tp-yt-paper-toast#toast #label.style-scope.tp-yt-paper-toast,
tp-yt-paper-toast#toast yt-formatted-string,
tp-yt-paper-toast#toast .style-scope.yt-formatted-string {
  font-weight: 500 !important;
  color: rgba(255, 255, 255, 0.95) !important;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.4) !important;
}

/* Nút Action "Thay đổi", "Hoàn tác"... */
tp-yt-paper-toast#toast yt-button-renderer button {
  background: rgba(255, 255, 255, 0.15) !important;
  border-radius: 10px !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) !important;
  box-shadow: none !important;
}

tp-yt-paper-toast#toast yt-button-renderer button:hover {
  background: rgba(255, 255, 255, 0.25) !important;
  transform: translateY(-1px) !important;
}

tp-yt-paper-toast#toast yt-button-renderer button .yt-spec-button-shape-next__button-text-content {
  color: #fff !important;
  font-weight: 600 !important;
  letter-spacing: 0.3px !important;
}

/* Nút Đóng (Close) */
tp-yt-paper-toast#toast yt-icon-button#close-button button {
  background: rgba(255, 255, 255, 0.1) !important;
  border-radius: 50% !important;
  transition: all 0.2s ease !important;
}

tp-yt-paper-toast#toast yt-icon-button#close-button button:hover {
  background: rgba(255, 255, 255, 0.25) !important;
}

tp-yt-paper-toast#toast yt-icon-button#close-button yt-icon {
  fill: #fff !important;
  color: #fff !important;
}
`;

function injectStyles() {
  const existingStyle = document.getElementById('force-nankill-skibidi-theme');
  if (existingStyle) {
    if (existingStyle.textContent !== MY_CUSTOM_CSS) {
      existingStyle.textContent = MY_CUSTOM_CSS;
    }
    return;
  }

  console.info('[GlassyUI] Booting Merged Theme...');

  // Tạo thẻ <style>
  const style = document.createElement('style');
  style.id = 'force-nankill-skibidi-theme';
  style.type = 'text/css';

  // Thêm CSS vào
  if (style.styleSheet) {
    style.styleSheet.cssText = MY_CUSTOM_CSS;
  } else {
    style.appendChild(document.createTextNode(MY_CUSTOM_CSS));
  }

  // Chèn vào đầu trang (hoặc cuối body để ghi đè mạnh hơn)
  (document.head || document.documentElement).appendChild(style);
}

const NANKILL_BLYRICS_SOURCE_LINK_ID = 'betterLyricsFooterLink';

function getSourceLinkInContainer(container) {
  return container.querySelector(`a#${NANKILL_BLYRICS_SOURCE_LINK_ID}, a[data-nankill-source-link]`);
}

function getBetterLyricsSourceContainers() {
  return Array.from(document.querySelectorAll('.blyrics-footer__container')).filter((container) => {
    return Boolean(getSourceLinkInContainer(container));
  });
}

function pickPrimarySourceContainer(containers) {
  return (
    containers.find((container) => container.classList.contains('nankill-blyrics-footer-in-tabs')) ||
    containers.find((container) => {
      const link = getSourceLinkInContainer(container);
      if (!link) {
        return false;
      }
      return Boolean(link.getAttribute('href')) || link.textContent.trim().length > 0;
    }) ||
    containers[0]
  );
}

function sanitizeSourceContainers({ containers, primary, tabsHost }) {
  for (const container of containers) {
    const sourceLink = getSourceLinkInContainer(container);
    if (!sourceLink) {
      continue;
    }

    if (container === primary) {
      sourceLink.id = NANKILL_BLYRICS_SOURCE_LINK_ID;
      sourceLink.dataset.nankillSourceLink = 'primary';
      container.dataset.nankillSourceClone = '0';
      container.style.removeProperty('display');
      continue;
    }

    const isInTabsHost = tabsHost && tabsHost.contains(container);
    if (isInTabsHost) {
      continue;
    }

    // Better Lyrics có thể tạo lại một source footer mới sau khi đổi bài.
    // Ẩn bản clone và gỡ id để không cướp luồng cập nhật từ bản đang dock trên tab.
    sourceLink.removeAttribute('id');
    sourceLink.dataset.nankillSourceLink = 'clone';
    container.dataset.nankillSourceClone = '1';
    container.style.setProperty('display', 'none', 'important');
  }
}

function dockBetterLyricsFooterToTabs() {
  const sourceContainers = getBetterLyricsSourceContainers();
  const tabsHost = document.querySelector('ytmusic-player-page tp-yt-paper-tabs.tab-header-container');

  if (!sourceContainers.length || !tabsHost) {
    return;
  }

  const footer = pickPrimarySourceContainer(sourceContainers);
  if (!footer) {
    return;
  }

  // Chỉ chuyển node khi cần, tránh thao tác DOM lặp vô ích.
  if (footer.parentElement !== tabsHost) {
    console.info('[GlassyUI] Successfully docked lyrics footer to tabs.');
    footer.classList.add('nankill-blyrics-footer-in-tabs');
    tabsHost.appendChild(footer);
  }

  sanitizeSourceContainers({
    containers: sourceContainers,
    primary: footer,
    tabsHost,
  });
}

let nankillFooterDockObserver;
function setupFooterDockingObserver() {
  let rafPending = false;
  const scheduleDock = () => {
    if (rafPending) {
      return;
    }
    rafPending = true;
    requestAnimationFrame(() => {
      rafPending = false;
      dockBetterLyricsFooterToTabs();
    });
  };

  dockBetterLyricsFooterToTabs();

  if (!nankillFooterDockObserver) {
    console.info('[GlassyUI] Starting DOM observer for lyrics footer docking...');
    nankillFooterDockObserver = new MutationObserver(scheduleDock);
    nankillFooterDockObserver.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  }

  window.addEventListener('resize', scheduleDock);
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *  NO-SYNC DETECTION — Phát hiện lyrics tĩnh/không sync
 *
 *  BetterLyrics luôn đặt `data-time` và `data-duration` trên mỗi dòng:
 *    - Synced: data-duration có giá trị thực ("5.3", "2.1", ...)
 *    - Static: data-duration = "0" cho TẤT CẢ các dòng
 *
 *  Logic: Check xem có .blyrics--line nào có data-duration != "0" không.
 *    - Có → synced → giữ blur.
 *    - Không có → static → bỏ blur.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
let noSyncContainer = null;
let noSyncObserver = null;
let isNoSyncMode = false;

let noSyncTransitionTimer = null;

function setNoSyncMode(container, enabled) {
  if (isNoSyncMode === enabled) return;
  const wasNoSync = isNoSyncMode;
  isNoSyncMode = enabled;

  // Cleanup transition timer nếu đang chạy
  if (noSyncTransitionTimer) {
    clearTimeout(noSyncTransitionTimer);
    noSyncTransitionTimer = null;
    container.classList.remove('blyrics--entering-sync');
  }

  if (enabled) {
    // Chuyển sang no-sync: hiện rõ tất cả lyrics
    container.classList.add('blyrics--no-sync');
    console.info('[GlassyUI] 🔇 No-sync detected (all lines data-duration=0) — blur disabled.');
  } else {
    // Chuyển sang sync: blur lại
    container.classList.remove('blyrics--no-sync');

    // Nếu trước đó đang là no-sync → thêm animation mượt
    if (wasNoSync) {
      container.classList.add('blyrics--entering-sync');
      noSyncTransitionTimer = setTimeout(() => {
        container.classList.remove('blyrics--entering-sync');
        noSyncTransitionTimer = null;
      }, 750); // hơi dư so với animation 0.7s
    }

    console.info('[GlassyUI] 🎵 Synced lyrics detected (data-duration > 0 found) — blur enabled.');
  }
}

function checkSyncState(container) {
  if (!container || !container.isConnected) return;
  // Synced: ít nhất 1 dòng có data-duration khác "0"
  // Static: TẤT CẢ dòng đều có data-duration="0"
  const hasSyncedLine = container.querySelector('.blyrics--line[data-duration]:not([data-duration="0"])');
  setNoSyncMode(container, !hasSyncedLine);
}

function startNoSyncDetection(container) {
  // Cleanup cũ
  if (noSyncObserver) {
    noSyncObserver.disconnect();
    noSyncObserver = null;
  }
  if (noSyncContainer && noSyncContainer !== container) {
    noSyncContainer.classList.remove('blyrics--no-sync');
  }
  noSyncContainer = container;
  isNoSyncMode = false;

  // Check ngay lập tức
  checkSyncState(container);

  // Observer theo dõi khi nội dung thay đổi (lines được thêm/xóa khi đổi bài)
  noSyncObserver = new MutationObserver(() => {
    if (!container.isConnected) return;
    checkSyncState(container);
  });

  noSyncObserver.observe(container, {
    childList: true,
    subtree: true,
  });
}

let noSyncDomObserver = null;
function setupNoSyncDomObserver() {
  if (noSyncDomObserver) return;

  console.info('[GlassyUI] Starting no-sync detection observer...');

  let lastContainer = null;
  let domCheckQueued = false;

  noSyncDomObserver = new MutationObserver(() => {
    if (domCheckQueued) return;
    domCheckQueued = true;
    queueMicrotask(() => {
      domCheckQueued = false;
      const container = document.querySelector('.blyrics-container');
      if (container && container !== lastContainer) {
        lastContainer = container;
        startNoSyncDetection(container);
      }
    });
  });

  noSyncDomObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Check ngay nếu container đã tồn tại
  const existing = document.querySelector('.blyrics-container');
  if (existing) {
    lastContainer = existing;
    startNoSyncDetection(existing);
  }
}

// Chèn ngay lập tức
injectStyles();
dockBetterLyricsFooterToTabs();
setupFooterDockingObserver();
setupNoSyncDomObserver();

// Chèn lại lần nữa khi trang load xong (đề phòng bị extension ghi đè)
window.addEventListener('DOMContentLoaded', () => {
  injectStyles();
  dockBetterLyricsFooterToTabs();
  setupFooterDockingObserver();
  setupNoSyncDomObserver();
});

window.addEventListener('load', () => {
  injectStyles();
  dockBetterLyricsFooterToTabs();
  setupFooterDockingObserver();
  setupNoSyncDomObserver();
});
