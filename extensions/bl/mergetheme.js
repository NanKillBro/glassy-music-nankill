// Dán CSS theme "cucu" của bạn vào giữa 2 dấu huyền (`) ở dưới
const MY_CUSTOM_CSS = `
/* =================================================================================================================*/
/* MERGED THEME V17: Major UI Update                                                                                */
/* Adds: More rounded corner, more blur, more smooth animation,...                                                  */
/* Fixes: Artist Page, Podcast Page,...                                                                             */
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

/* ============================================== */
/* PHẦN 3: FULLSCREEN MODE FIXES (NEW)            */
/* ============================================== */

/* 1. Xóa bỏ hiệu ứng kính và mở rộng tối đa không gian của side-panel */
ytmusic-player-page[player-fullscreened] #side-panel {
  background: transparent !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
  border: none !important;
  
  /* Bổ sung: Xóa khoảng trống bên ngoài và giới hạn chiều cao */
  max-height: none !important; 
  height: 100% !important;
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
/* ============================================== */
/* BẢN CẬP NHẬT: GIAO DIỆN TRANG CHỦ (HARDCODED)  */
/* Đã loại bỏ SCSS, gán cứng theo Default Preset  */
/* ============================================== */

/* Xóa thanh cuộn cho gọn mắt */
html, .scrollable-content, .scroller {
  scrollbar-width: none !important;
}
body::-webkit-scrollbar {
  display: none;
}

/* 1. BACKGROUND ĐỘNG TRANG CHỦ & TÌM KIẾM */
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
  transition: background 0.4s ease-in-out 0.5s;
  will-change: background;
}

/* Fix xóa nền xám mặc định của YouTube Music */
.background-gradient {
  background: none !important;
}
ytmusic-fullbleed-thumbnail-renderer[is-background] .image {
  mask-image: linear-gradient(transparent);
}

/* 2. THANH ĐIỀU HƯỚNG & MENU BÊN - HIỆU ỨNG KÍNH */
#nav-bar-background.ytmusic-app-layout,
ytmusic-app-layout.content-scrolled #nav-bar-divider {
  opacity: 1;
  backdrop-filter: blur(10px);
  background: transparent;
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

/* 3. THANH TÌM KIẾM (SEARCH BOX) MỚI */
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
ytmusic-search-box #suggestion-list ytmusic-search-suggestions-section {
  background: transparent !important;
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

/* 4. NÚT BẤM VÀ CÁC THÀNH PHẦN NỔI BẬT KHÁC */
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

/* 1. KHAI BÁO HIỆU ỨNG XUẤT HIỆN */
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

/* 2. Container của Menu 3 chấm */
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

/* Nếu bạn muốn áp dụng riêng cho phần hộp thoại bên trong */
.ytmusicMultiPageMenuRendererHost {
    background: transparent;
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
ytmusic-item-section-renderer #items.ytmusic-item-section-renderer {
  background: transparent !important;
  background-color: transparent !important;
}

/* Triệt tiêu nền xám của bảng Engagement Panel và các thành phần con */
ytmusic-engagement-panel-section-list-renderer,
ytmusic-engagement-panel-title-header-renderer,
playlist-collaboration-view-model,
content-list-item-view-model,
.ytContentListItemViewModelContentListItemWrapper,
#header.ytmusic-engagement-panel-section-list-renderer,
#content.ytmusic-engagement-panel-section-list-renderer,
.scrollable-content.ytmusic-engagement-panel-section-list-renderer {
  background: transparent !important;
  background-color: transparent !important;
  /* Ghi đè các biến màu hệ thống của YouTube */
  --ytmusic-background: transparent !important;
  --yt-spec-brand-background-primary: transparent !important;
  --yt-spec-general-background-a: transparent !important;
}

/* Xử lý nền của Avatar và các phần tử nhỏ hơn */
yt-avatar-shape,
.yt-spec-avatar-shape,
.yt-spec-avatar-shape--avatar-size-extra-large {
  background: transparent !important;
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

/* Áp dụng nền kính mờ cho các hộp thoại thả xuống (Quyền riêng tư, Chất lượng âm thanh...) */
tp-yt-iron-dropdown .dropdown-content,
tp-yt-paper-listbox.dropdown-content {
  background-color: rgba(15, 15, 15, 0.7) !important;
  
  /* Thêm viền mỏng và shadow */
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 12px !important; /* Bo góc 12px cho menu nhỏ nhắn hơn */
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5) !important;
}

/* 2. Hiệu ứng sáng lên khi di chuột qua (Hover) */
tp-yt-paper-listbox ytmusic-dropdown-item-renderer:hover,
tp-yt-paper-listbox tp-yt-paper-item.menu-item:hover {
  background-color: rgba(255, 255, 255, 0.1) !important;
  transition: background-color 0.2s ease !important;
}

/* 3. Hiệu ứng sáng hơn một chút cho mục đang được chọn (Selected) */
tp-yt-paper-listbox ytmusic-dropdown-item-renderer.iron-selected,
tp-yt-paper-listbox tp-yt-paper-item.menu-item.iron-selected {
  background-color: rgba(255, 255, 255, 0.15) !important;
}

/* (Tùy chọn) Bỏ viền outline xấu xí khi click vào mục menu */
tp-yt-paper-listbox tp-yt-paper-item:focus {
  outline: none !important;
}

/* =========================================
   1. BẢNG XÁC NHẬN (Ví dụ: Hủy đăng ký)
   2. BẢNG THÔNG TIN BÀI HÁT (Credits)
   ========================================= */

/* Áp dụng cho bảng Sắp xếp và Chọn quốc gia */
ytmusic-multi-select-menu-renderer {
  background-color: transparent !important;
}

/* Làm trong suốt các dòng item đơn lẻ */
ytmusic-multi-select-menu-item-renderer,
ytmusic-multi-select-menu-item-renderer button {
  background-color: transparent !important;
}

/* Hiệu ứng khi di chuột qua các mục chọn (Highlight) */
ytmusic-multi-select-menu-item-renderer:hover {
  background-color: rgba(255, 255, 255, 0.08) !important;
}

/* Bo góc cho toàn bộ khung ảnh Album/Playlist ở Trang chủ */
ytmusic-two-row-item-renderer .image-wrapper,
ytmusic-responsive-list-item-renderer[play-button-state] {
  border-radius: 16px; /* Bạn có thể đổi thành 8px hoặc 12px tùy sở thích */
  overflow: hidden;
}

/* 1. Trả lại hiệu ứng fade mượt cho toàn bộ overlay mặc định của YouTube */
ytmusic-item-thumbnail-overlay-renderer {
  transition: opacity 0.3s ease !important;
}

/* 2. Logic gốc: Ép tàng hình nền đen của bài ĐANG PHÁT (khi không di chuột) */
ytmusic-item-thumbnail-overlay-renderer:not([play-button-state="default"]) #background.ytmusic-item-thumbnail-overlay-renderer {
  opacity: 0 !important;
}

/* 3. Logic gốc: Hiện lại nền đen của bài ĐANG PHÁT khi di chuột vào */
ytmusic-item-thumbnail-overlay-renderer:not([play-button-state="default"]):hover #background.ytmusic-item-thumbnail-overlay-renderer {
  opacity: 1 !important;
}

/* 4. Logic gốc: Lớp nền đen bo tròn bao quanh cái nút Play bự ở Trang chủ */
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
    /* 1. Thu gọn và căn giữa */
    width: 50% !important;  /* Tự co lại vừa khít với các tab bên trong */
    margin: 10px auto 0 auto !important;      /* Đẩy thanh tab ra giữa màn hình */
    top: calc(var(--menu-bar-height, 0px) + 100px) !important;

    /* 2. Bo tròn và hiệu ứng kính mờ (cũ) */
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

/* 1. Tắt thanh gạch chân chạy qua chạy lại mặc định của YouTube Music */
ytmusic-tabs#tabs tp-yt-paper-tabs-selection-bar,
ytmusic-tabs#tabs .selection-bar {
    display: none !important; 
}

/* 2. Style cho Tab ĐANG ĐƯỢC CHỌN (Nổi bật) */
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

/* 3. Style cho Tab BÌNH THƯỜNG (Chưa được chọn) */
ytmusic-tabs#tabs .tab:not(.selected) {
    color: rgba(255, 255, 255, 0.5) !important; /* Chữ mờ đi để nhường sân khấu cho tab đang chọn */
    font-weight: 500 !important;
    padding: 8px 20px !important;
    margin: 0 4px !important;
    transition: all 0.3s ease !important;
}

/* 4. Hiệu ứng khi lướt chuột qua Tab bình thường */
ytmusic-tabs#tabs .tab:not(.selected):hover {
    background-color: rgba(255, 255, 255, 0.08) !important; /* Sáng nhẹ lên khi di chuột */
    border-radius: 10px !important;
    color: #ffffff !important;
}

/* ========================================================== */
/* HIỆU ỨNG MỞ/ĐÓNG PLAYER PAGE & MINIPLAYER ĐÃ ĐƯỢC HARDCODE */
/* ========================================================== */

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

/* 5. Hiệu ứng Blur (Kính mờ) CHỈ ÁP DỤNG KHI FULLSCREEN */
ytmusic-player-page[player-fullscreened] .av-toggle.ytmusic-av-toggle {
    backdrop-filter: blur(12px) !important;
    -webkit-backdrop-filter: blur(12px) !important; /* Hỗ trợ thêm cho các trình duyệt lõi Chromium */
    background-color: rgba(0, 0, 0, 0.2) !important; /* Tùy chọn: Làm nền trong suốt hơn một chút để thấy rõ hiệu ứng blur */
}

/* ============================================== */
/* PHẦN 6: SMOOTH TRANSITIONS & ANIMATIONS        */
/* ============================================== */

/* --- 1. KEYFRAMES --- */
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

/* --- 2. TRẠNG THÁI FULLSCREEN --- */
ytmusic-player[player-ui-state="FULLSCREEN"],
ytmusic-player-page[player-fullscreened] #player.ytmusic-player-page {
    /* Ép tắt mọi animation đang chạy lỡ dở từ miniplayer/mở player để tránh xung đột */
    animation: none !important; 
    transition: max-width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s,
                opacity 0.4s ease 0.2s !important; 
    will-change: max-width, opacity; 
}

/* --- 3. TRẠNG THÁI MỞ PLAYER BÌNH THƯỜNG --- */
ytmusic-player-page[player-page-open]:not([player-fullscreened]) #player.ytmusic-player-page {
    animation: mp-grow 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) !important;
    transition: none !important; 
    will-change: transform, opacity;
}

/* --- 4. TRẠNG THÁI THU NHỎ XUỐNG MINIPLAYER --- */
/* Đã thêm :not([player-fullscreened]) để chặn đứng hiệu ứng này khi bấm Fullscreen */
ytmusic-player-page[mini-player-enabled]:not([player-page-open]):not([player-fullscreened]) #player.ytmusic-player-page {
    animation: mp-shrink 0.5s cubic-bezier(0.4, 0, 0.2, 1) !important;
    transition: none !important; 
    will-change: transform, opacity;
}
/* ========================== ARTIST PAGE ========================== */

ytmusic-immersive-header-renderer {
  background: var(--ytmusic-app); /* Biến mặc định của YT Music, giữ nguyên để không lỗi giao diện web */
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

.ytmusic-browse-response .content-container-wrapper,
.content-container-wrapper .gradient-container {
  background: transparent !important;
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

/* Podcast Header */
ytmusic-visual-header-renderer[has-banner-image] .gradient-container.ytmusic-visual-header-renderer {
  background: transparent;
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

.menu.ytmusic-multi-row-list-item-renderer {
  background: transparent !important;
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
`;

function injectStyles() {
    console.log("[NanKill's Skibidi Theme] Injecting MERGED THEME V17...");
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
