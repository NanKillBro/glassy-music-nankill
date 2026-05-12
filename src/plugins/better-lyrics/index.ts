import { session, app, BrowserWindow } from 'electron';
import path from 'path';
import fs from 'fs';
import { createPlugin } from '@/utils';

// ID này lấy từ manifest key bạn cung cấp, hoặc bạn xem log cũ (mjfeakl...)
// Nếu build xong mở không lên thì check log xem ID thực tế là gì rồi thay vào đây
const EXTENSION_ID = 'effdbpeggelllpfkjppbokhmmiinhlmg';

export default createPlugin({
  name: () => 'Better Lyrics',
  restartNeeded: false,
  config: {
    enabled: true,
    enableV4Scroll: true,
  },
  // THÊM PHẦN NÀY: Tạo menu để mở cài đặt
  menu: async ({ getConfig, setConfig }) => {
    const config = await getConfig();

    return [
      {
        label: 'GlassyFlow v5 (Restart Required)',
        type: 'checkbox',
        checked: config.enableV4Scroll !== false,
        click: () => setConfig({ enableV4Scroll: config.enableV4Scroll === false ? true : false }),
      },
      {
        label: 'Open Settings',
        click: () => {
          const settingsWin = new BrowserWindow({
            width: 600,
            height: 700,
            autoHideMenuBar: true,
            frame: false,
            transparent: true,
            show: false,
            hasShadow: false,
            backgroundColor: '#00000000',
            webPreferences: {
              nodeIntegration: false,
              contextIsolation: true,
            },
          });

          // Force canvas transparency for chrome-extension pages
          settingsWin.setBackgroundColor('#00000000');


          const optionsUrl = `chrome-extension://${EXTENSION_ID}/options_ui/page.html`;

          settingsWin.loadURL(optionsUrl).catch((err) => {
            console.error('Cannot open settings page:', err);
            settingsWin.loadURL(`chrome-extension://${EXTENSION_ID}/action/default_popup.html`);
          });

          // Inject frameless window UI after the page loads
          settingsWin.webContents.on('dom-ready', () => {
            settingsWin.webContents.executeJavaScript(`
              (function() {
                // --- Inject Styles ---
                const style = document.createElement('style');
                style.textContent = \`
                  :root, html {
                    background: transparent !important;
                    background-color: transparent !important;
                    width: 100% !important;
                    min-width: 100% !important;
                    max-width: 100% !important;
                    overflow: hidden !important;
                  }
                  
                  body {
                    background: transparent !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    overflow: hidden !important;
                    height: 100vh !important;
                  }

                  #glassy-wrapper {
                    position: fixed;
                    inset: 0;
                    background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
                    background-size: 400% 400%;
                    animation: glassyGradient 15s ease infinite, glassyAppear 0.65s cubic-bezier(0.22, 1, 0.36, 1) forwards;
                    border-radius: 20px;
                    border: 1px solid rgba(255, 255, 255, 0.18);
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.05);
                    clip-path: inset(0 round 20px);
                    -webkit-app-region: drag;
                    z-index: 999999;
                  }

                  #glassy-wrapper.closing {
                    animation: glassyGradient 15s ease infinite, glassyDisappear 0.4s cubic-bezier(0.32, 0, 0.67, 0) forwards !important;
                    pointer-events: none;
                  }

                  @keyframes glassyGradient {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                  }

                  @keyframes glassyAppear {
                    0% {
                      opacity: 0;
                      transform: scale(0.85) translateY(40px);
                      filter: blur(15px);
                    }
                    100% {
                      opacity: 1;
                      transform: scale(1) translateY(0);
                      filter: blur(0px);
                    }
                  }

                  @keyframes glassyDisappear {
                    0% {
                      opacity: 1;
                      transform: scale(1) translateY(0);
                      filter: blur(0px);
                    }
                    40% { opacity: 0.8; }
                    100% {
                      opacity: 0;
                      transform: scale(0.9) translateY(25px);
                      filter: blur(12px);
                    }
                  }

                  /* Ensure the original nav doesn't capture drag */
                  nav, nav * {
                    -webkit-app-region: no-drag !important;
                  }

                  #glassy-titlebar {
                    height: 42px;
                    min-height: 42px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 16px;
                    -webkit-app-region: drag !important;
                    user-select: none;
                    z-index: 10002 !important;
                    position: relative;
                  }

                  #glassy-titlebar-label {
                    font-family: 'Segoe UI', sans-serif;
                    font-size: 13px;
                    font-weight: 600;
                    color: rgba(255,255,255,0.85);
                    letter-spacing: 0.3px;
                  }

                  #glassy-close-btn {
                    -webkit-app-region: no-drag;
                    width: 30px;
                    height: 30px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 50%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    cursor: pointer;
                    transition: all 0.3s;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    backdrop-filter: blur(10px);
                  }

                  #glassy-close-btn:hover {
                    background: rgba(255, 80, 80, 0.8);
                    transform: scale(1.1);
                  }

                  #glassy-close-btn svg {
                    width: 13px;
                    height: 13px;
                    fill: #fff;
                  }

                  #glassy-content {
                    flex: 1;
                    overflow: auto;
                    -webkit-app-region: no-drag;
                    border-radius: 0 0 20px 20px;
                    padding: 1.25rem 2rem 1rem !important; /* Restore original body padding */
                    box-sizing: border-box;
                    background: rgba(30, 31, 34, 0.75); /* Dark glass layer for readability */
                    backdrop-filter: blur(25px) saturate(180%);
                    -webkit-backdrop-filter: blur(25px) saturate(180%);
                    border-top: 1px solid rgba(255,255,255,0.05);
                  }

                  /* --- Modern Glassmorphism Overrides --- */
                  
                  * {
                    box-sizing: border-box;
                  }

                  ::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                  }
                  ::-webkit-scrollbar-track {
                    background: rgba(0, 0, 0, 0.1);
                    border-radius: 4px;
                  }
                  ::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 4px;
                  }
                  ::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.4);
                  }

                  body, html {
                    font-family: 'Satoshi', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
                    color: rgba(255, 255, 255, 0.9) !important;
                  }

                  #navbar {
                    background: transparent !important;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
                    padding: 0 0 1rem 0 !important;
                    margin-bottom: 1.5rem !important;
                    display: flex !important;
                    justify-content: space-between !important;
                    align-items: center !important;
                  }

                  #navbar h1 {
                    font-size: 1.2rem !important;
                    font-weight: 700 !important;
                    text-shadow: 0 2px 10px rgba(0,0,0,0.2) !important;
                    display: flex !important;
                    align-items: center !important;
                    gap: 10px !important;
                    margin: 0 !important;
                  }
                  
                  #navbar h1 img {
                    border-radius: 20%;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.3);
                  }

                  .heading {
                    display: flex;
                    align-items: baseline;
                    gap: 8px;
                  }

                  .heading span {
                    font-size: 0.7rem !important;
                    background: rgba(255,255,255,0.1);
                    padding: 2px 6px;
                    border-radius: 8px;
                    color: #23d5ab;
                  }

                  /* Tabs */
                  .tab-scroll-wrapper {
                    background: transparent !important;
                    border: none !important;
                    box-shadow: none !important;
                    margin-bottom: 2rem !important;
                    position: relative !important;
                    display: flex !important;
                    align-items: center !important;
                    border-radius: 16px !important;
                  }

                  .tab-container {
                    display: flex !important;
                    gap: 0.5rem !important;
                    background: rgba(0, 0, 0, 0.2) !important;
                    padding: 0.5rem !important;
                    border-radius: 16px !important;
                    border: 1px solid rgba(255, 255, 255, 0.05) !important;
                    overflow-x: auto !important;
                    scroll-behavior: smooth !important;
                    flex: 1 !important;
                    margin-bottom: 0 !important;
                  }

                  .tab-container::-webkit-scrollbar {
                    display: none !important;
                  }

                  .tab-arrow {
                    background: rgba(255,255,255,0.1) !important;
                    border: 1px solid rgba(255,255,255,0.1) !important;
                    color: #fff !important;
                    border-radius: 50% !important;
                    width: 32px !important;
                    height: 32px !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    cursor: pointer !important;
                    flex-shrink: 0 !important;
                    backdrop-filter: blur(5px) !important;
                    transition: all 0.2s !important;
                    z-index: 10 !important;
                  }

                  .tab-arrow:hover {
                    background: rgba(255,255,255,0.2) !important;
                  }

                  .tab-arrow-left {
                    margin-right: 0.5rem !important;
                  }

                  .tab-arrow-right {
                    margin-left: 0.5rem !important;
                  }

                  .tab {
                    background: transparent !important;
                    border: none !important;
                    color: rgba(255, 255, 255, 0.6) !important;
                    padding: 0.6rem 1rem !important;
                    border-radius: 12px !important;
                    font-weight: 600 !important;
                    font-size: 0.9rem !important;
                    cursor: pointer !important;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                    white-space: nowrap;
                  }

                  .tab:hover {
                    background: rgba(255, 255, 255, 0.05) !important;
                    color: rgba(255, 255, 255, 0.9) !important;
                  }

                  .tab.active {
                    background: rgba(255, 255, 255, 0.15) !important;
                    color: #fff !important;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1) !important;
                    border: 1px solid rgba(255, 255, 255, 0.1) !important;
                  }

                  /* Settings Groups & Containers */
                  .settings-group {
                    background: rgba(255, 255, 255, 0.03) !important;
                    border: 1px solid rgba(255, 255, 255, 0.08) !important;
                    border-radius: 20px !important;
                    padding: 1.5rem !important;
                    margin-bottom: 1.5rem !important;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1) !important;
                    backdrop-filter: blur(10px) !important;
                  }

                  .settings-group h2 {
                    display: flex !important;
                    align-items: center !important;
                    gap: 0.75rem !important;
                    font-size: 1.15rem !important;
                    margin-top: 0 !important;
                    margin-bottom: 0.5rem !important;
                    color: #fff !important;
                  }

                  .settings-group h2 svg {
                    width: 20px !important;
                    height: 20px !important;
                    color: #23a6d5 !important;
                    filter: drop-shadow(0 0 8px rgba(35, 166, 213, 0.5));
                  }

                  .settings-group > p {
                    color: rgba(255, 255, 255, 0.6) !important;
                    margin-bottom: 1.5rem !important;
                    line-height: 1.5 !important;
                    font-size: 0.9rem !important;
                  }

                  .container {
                    display: flex !important;
                    justify-content: space-between !important;
                    align-items: center !important;
                    background: rgba(0, 0, 0, 0.2) !important;
                    padding: 1rem 1.2rem !important;
                    border-radius: 14px !important;
                    margin-bottom: 0.75rem !important;
                    border: 1px solid rgba(255, 255, 255, 0.03) !important;
                    transition: all 0.3s ease !important;
                  }

                  .container:hover {
                    background: rgba(255, 255, 255, 0.06) !important;
                    border-color: rgba(255, 255, 255, 0.1) !important;
                    transform: translateY(-1px) !important;
                  }

                  .container[style*="display: none"] {
                    display: none !important;
                  }

                  .container > span {
                    font-weight: 500 !important;
                    font-size: 0.95rem !important;
                  }

                  /* Checkbox Toggle Switch Style */
                  .container > label {
                    position: relative !important;
                    display: inline-block !important;
                    width: 44px !important;
                    height: 24px !important;
                    margin: 0 !important;
                  }

                  .container > label input {
                    opacity: 0 !important;
                    width: 0 !important;
                    height: 0 !important;
                  }

                  .container .checkmark {
                    position: absolute !important;
                    cursor: pointer !important;
                    top: 0 !important;
                    left: 0 !important;
                    right: 0 !important;
                    bottom: 0 !important;
                    background-color: rgba(255, 255, 255, 0.1) !important;
                    transition: .4s !important;
                    border-radius: 34px !important;
                    border: 1px solid rgba(255, 255, 255, 0.2) !important;
                  }

                  .container .checkmark:before {
                    position: absolute !important;
                    content: "" !important;
                    height: 16px !important;
                    width: 16px !important;
                    left: 3px !important;
                    bottom: 3px !important;
                    background-color: #fff !important;
                    transition: .4s cubic-bezier(0.68, -0.55, 0.265, 1.55) !important;
                    border-radius: 50% !important;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.3) !important;
                  }

                  .container input:checked + .checkmark {
                    background-color: #23a6d5 !important;
                    border-color: #23d5ab !important;
                    box-shadow: 0 0 12px rgba(35, 166, 213, 0.4) !important;
                  }

                  .container input:checked + .checkmark:before {
                    transform: translateX(20px) !important;
                  }

                  /* Fix for .checkbox-container in Sortable List */
                  .checkbox-container {
                    width: 44px !important;
                    max-width: 44px !important;
                    height: 24px !important;
                    margin: 0 !important;
                  }
                  .checkbox-container .checkmark {
                    border-radius: 34px !important;
                    background-color: rgba(255, 255, 255, 0.1) !important;
                    border: 1px solid rgba(255, 255, 255, 0.2) !important;
                  }
                  .checkbox-container .checkmark:before {
                    width: 16px !important;
                    height: 16px !important;
                    left: 3px !important;
                    bottom: 3px !important;
                    background-color: #fff !important;
                    border-radius: 50% !important;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.3) !important;
                  }
                  .checkbox-container input:checked + .checkmark {
                    background-color: #23a6d5 !important;
                    border-color: #23d5ab !important;
                    box-shadow: 0 0 12px rgba(35, 166, 213, 0.4) !important;
                  }
                  .checkbox-container input:checked + .checkmark:before {
                    transform: translateX(20px) !important;
                  }

                  .provider-name {
                    margin-left: calc(44px + 1rem) !important;
                  }

                  /* Buttons */
                  button:not(.tab) {
                    background: rgba(255, 255, 255, 0.1) !important;
                    border: 1px solid rgba(255, 255, 255, 0.2) !important;
                    color: #fff !important;
                    padding: 0.6rem 1.2rem !important;
                    border-radius: 10px !important;
                    cursor: pointer !important;
                    font-weight: 600 !important;
                    font-size: 0.85rem !important;
                    transition: all 0.3s ease !important;
                    display: inline-flex !important;
                    align-items: center !important;
                    gap: 0.5rem !important;
                    backdrop-filter: blur(5px) !important;
                  }

                  button:not(.tab):hover {
                    background: rgba(255, 255, 255, 0.2) !important;
                    transform: translateY(-2px) !important;
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2) !important;
                  }

                  button:not(.tab):active {
                    transform: translateY(0) !important;
                  }

                  button.btn-danger {
                    background: rgba(231, 60, 126, 0.15) !important;
                    border-color: rgba(231, 60, 126, 0.3) !important;
                    color: #ff8fb3 !important;
                  }

                  button.btn-danger:hover {
                    background: rgba(231, 60, 126, 0.3) !important;
                    box-shadow: 0 5px 15px rgba(231, 60, 126, 0.2) !important;
                  }

                  button svg {
                    width: 16px !important;
                    height: 16px !important;
                  }

                  /* Select */
                  .select {
                    position: relative !important;
                    background: transparent !important;
                    border: none !important;
                    padding: 0 !important;
                  }

                  select {
                    background: rgba(0, 0, 0, 0.3) !important;
                    border: 1px solid rgba(255, 255, 255, 0.1) !important;
                    color: #fff !important;
                    padding: 0.6rem 2rem 0.6rem 1rem !important;
                    border-radius: 10px !important;
                    appearance: none !important;
                    font-family: inherit !important;
                    font-size: 0.9rem !important;
                    cursor: pointer !important;
                    backdrop-filter: blur(5px) !important;
                    transition: all 0.3s ease !important;
                  }

                  select:hover, select:focus {
                    background: rgba(0, 0, 0, 0.5) !important;
                    border-color: rgba(255, 255, 255, 0.3) !important;
                    outline: none !important;
                  }

                  .select::after {
                    content: '▼' !important;
                    background: none !important;
                    position: absolute !important;
                    right: 0.8rem !important;
                    top: 50% !important;
                    transform: translateY(-50%) !important;
                    color: rgba(255, 255, 255, 0.5) !important;
                    pointer-events: none !important;
                    font-size: 0.7rem !important;
                  }

                  select option {
                    background: #1e1f22 !important;
                    color: #fff !important;
                  }

                  /* Modals */
                  .modal-overlay {
                    background: rgba(0, 0, 0, 0.5) !important;
                    backdrop-filter: blur(10px) !important;
                  }

                  .modal {
                    background: rgba(30, 31, 34, 0.85) !important;
                    border: 1px solid rgba(255, 255, 255, 0.15) !important;
                    border-radius: 20px !important;
                    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5) !important;
                    backdrop-filter: blur(25px) saturate(200%) !important;
                  }

                  .modal-header {
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
                  }

                  .modal-footer {
                    border-top: 1px solid rgba(255, 255, 255, 0.08) !important;
                    background: transparent !important;
                  }

                  button.modal-close-btn {
                    background: transparent !important;
                    border: none !important;
                    padding: 0.5rem !important;
                    width: 32px !important;
                    height: 32px !important;
                    display: grid !important;
                    justify-items: center !important;
                    align-items: center !important;
                    box-shadow: none !important;
                  }
                  button.modal-close-btn:hover {
                    background: rgba(255,255,255,0.1) !important;
                    transform: none !important;
                    box-shadow: none !important;
                  }
                  button.modal-close-btn svg {
                    fill: currentColor !important;
                    width: 1.25rem !important;
                    height: 1.25rem !important;
                  }

                  /* Miscellaneous */
                  .text-group {
                    background: rgba(0, 0, 0, 0.2) !important;
                    padding: 1.2rem !important;
                    border-radius: 14px !important;
                    border: 1px solid rgba(255, 255, 255, 0.03) !important;
                  }

                  .text-group p {
                    display: flex !important;
                    justify-content: space-between !important;
                    margin: 0.5rem 0 !important;
                    color: rgba(255, 255, 255, 0.8) !important;
                    font-size: 0.9rem !important;
                    align-items: center !important;
                  }

                  .text-group p span:last-child {
                    font-family: 'JetBrains Mono', monospace !important;
                    color: #23d5ab !important;
                    background: rgba(35, 213, 171, 0.1) !important;
                    padding: 0.2rem 0.5rem !important;
                    border-radius: 6px !important;
                    font-size: 0.85rem !important;
                  }

                  .dots {
                    flex-grow: 1 !important;
                    border-bottom: 1px dashed rgba(255,255,255,0.2) !important;
                    margin: 0 10px !important;
                    opacity: 0.5 !important;
                  }

                  /* Animations */
                  .tab-content {
                    display: none;
                    opacity: 0;
                  }

                  .tab-content.active {
                    display: block !important;
                    animation: fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
                  }

                  @keyframes fadeUp {
                    from {
                      opacity: 0;
                      transform: translateY(15px);
                    }
                    to {
                      opacity: 1;
                      transform: translateY(0);
                    }
                  }

                  /* Pre tags / Code blocks */
                  pre {
                    background: rgba(0, 0, 0, 0.3) !important;
                    border: 1px solid rgba(255, 255, 255, 0.1) !important;
                    border-radius: 12px !important;
                    padding: 1.2rem !important;
                    box-shadow: inset 0 2px 10px rgba(0,0,0,0.2) !important;
                  }

                  /* Providers list */
                  .sortable-list {
                    width: 100% !important;
                    padding: 0 !important;
                    margin: 0 !important;
                    list-style: none !important;
                  }
                  
                  .sortable-list li {
                    background: rgba(255,255,255,0.05) !important;
                    border: 1px solid rgba(255,255,255,0.1) !important;
                    margin-bottom: 8px !important;
                    padding: 10px 15px !important;
                    border-radius: 10px !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: space-between !important;
                  }
                  
                  #options {
                    margin-top: 10px !important;
                  }

                  /* Modals Extra Styling (Unison & Language Exclusions) */
                  .modal-tab-container {
                    background: rgba(0, 0, 0, 0.2) !important;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
                    padding: 0.5rem 1rem !important;
                    border-radius: 20px 20px 0 0 !important;
                  }
                  .modal-tab {
                    color: rgba(255, 255, 255, 0.6) !important;
                    border-radius: 12px !important;
                  }
                  .modal-tab.active {
                    background: rgba(255, 255, 255, 0.15) !important;
                    color: #fff !important;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1) !important;
                    border: 1px solid rgba(255, 255, 255, 0.1) !important;
                  }
                  .lang-search-input {
                    background: rgba(0, 0, 0, 0.2) !important;
                    border: 1px solid rgba(255, 255, 255, 0.1) !important;
                    color: #fff !important;
                    border-radius: 10px !important;
                  }
                  .lang-search-input:focus {
                    background: rgba(0, 0, 0, 0.3) !important;
                    border-color: rgba(35, 213, 171, 0.5) !important;
                  }
                  .lang-pill {
                    background: rgba(255, 255, 255, 0.05) !important;
                    border: 1px solid rgba(255, 255, 255, 0.1) !important;
                    border-radius: 8px !important;
                  }
                  .lang-pill:hover {
                    background: rgba(255, 255, 255, 0.1) !important;
                  }
                  .position-frame {
                    border: 1px solid rgba(255, 255, 255, 0.1) !important;
                    background: rgba(0, 0, 0, 0.2) !important;
                    border-radius: 16px !important;
                  }
                  .position-cell {
                    background: rgba(255, 255, 255, 0.05) !important;
                  }
                  .position-cell:hover {
                    background: rgba(255, 255, 255, 0.1) !important;
                  }
                  .position-cell[data-selected="true"] {
                    background: rgba(35, 166, 213, 0.3) !important;
                  }
                  .position-cell[data-selected="true"]:before {
                    background: #23d5ab !important;
                  }
                \`;
                document.head.appendChild(style);

                // --- Move original body children into wrapper ---
                const wrapper = document.createElement('div');
                wrapper.id = 'glassy-wrapper';

                const titlebar = document.createElement('div');
                titlebar.id = 'glassy-titlebar';
                titlebar.innerHTML = \`
                  <span id="glassy-titlebar-label">Better Lyrics Settings</span>
                  <div id="glassy-close-btn">
                    <svg viewBox="0 0 24 24">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                  </div>
                \`;

                const contentArea = document.createElement('div');
                contentArea.id = 'glassy-content';

                // Move all existing body children into the content area
                while (document.body.firstChild) {
                  contentArea.appendChild(document.body.firstChild);
                }

                wrapper.appendChild(titlebar);
                wrapper.appendChild(contentArea);

                // Move modals and absolute elements out of the scrollable content area
                // so they don't scroll with the content and position properly
                const fixedElements = contentArea.querySelectorAll('.modal-overlay, #status-css, #status, #sync-indicator');
                fixedElements.forEach(el => wrapper.appendChild(el));

                document.body.appendChild(wrapper);

                // --- Close button handler ---
                document.getElementById('glassy-close-btn').addEventListener('click', () => {
                  if (wrapper.classList.contains('closing')) return;
                  wrapper.classList.add('closing');
                  setTimeout(() => {
                    document.title = '__GLASSY_CLOSE__';
                  }, 50);
                });

                // --- Tab arrows injector ---
                const checkAndInject = setInterval(() => {
                  const tabWrapper = document.querySelector('.tab-scroll-wrapper');
                  if (tabWrapper && !tabWrapper.querySelector('.tab-arrow')) {
                    clearInterval(checkAndInject);
                    const tabContainer = tabWrapper.querySelector('.tab-container');
                    if (tabContainer) {
                      const leftArrow = document.createElement('div');
                      leftArrow.className = 'tab-arrow tab-arrow-left';
                      leftArrow.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="white"><path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"/></svg>';
                      
                      const rightArrow = document.createElement('div');
                      rightArrow.className = 'tab-arrow tab-arrow-right';
                      rightArrow.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="white"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>';
                      
                      tabWrapper.insertBefore(leftArrow, tabContainer);
                      tabWrapper.appendChild(rightArrow);
                      
                      leftArrow.addEventListener('click', () => {
                        tabContainer.scrollBy({ left: -150, behavior: 'smooth' });
                      });
                      rightArrow.addEventListener('click', () => {
                        tabContainer.scrollBy({ left: 150, behavior: 'smooth' });
                      });

                      // Center active tab on click
                      const tabs = tabContainer.querySelectorAll('.tab');
                      tabs.forEach(tab => {
                        tab.addEventListener('click', (e) => {
                          const tabRect = e.target.getBoundingClientRect();
                          const containerRect = tabContainer.getBoundingClientRect();
                          const scrollLeft = tabContainer.scrollLeft + (tabRect.left - containerRect.left) - (containerRect.width / 2) + (tabRect.width / 2);
                          tabContainer.scrollTo({ left: scrollLeft, behavior: 'smooth' });
                        });
                      });
                    }
                  }
                }, 100);
                setTimeout(() => clearInterval(checkAndInject), 5000); // safety timeout
              })();
            `).then(() => {
              settingsWin.show();
            }).catch(console.error);
          });

          // Handle close animation at Electron level
          settingsWin.webContents.on('page-title-updated', (event, title) => {
            event.preventDefault();
            if (title !== '__GLASSY_CLOSE__') return;
            if (settingsWin.isDestroyed()) return;

            setTimeout(() => {
              if (settingsWin.isDestroyed()) return;
              let opacity = 1;
              const steps = 18;
              const interval = 280 / steps;
              const fadeTimer = setInterval(() => {
                opacity -= 1 / steps;
                if (opacity <= 0) {
                  clearInterval(fadeTimer);
                  if (!settingsWin.isDestroyed()) {
                    settingsWin.destroy();
                  }
                } else if (!settingsWin.isDestroyed()) {
                  settingsWin.setOpacity(Math.max(0, opacity));
                } else {
                  clearInterval(fadeTimer);
                }
              }, interval);
            }, 120);
          });
        },
      },
    ];
  },
  backend: {
    async start({ getConfig, window }) {
      const config = await getConfig();
      const basePath = app.isPackaged
        ? process.resourcesPath
        : path.join(__dirname, '../../');

      const extensionPath = path.join(basePath, 'extensions', 'bl');

      console.log('Loading Better Lyrics from:', extensionPath);

      session.defaultSession.loadExtension(extensionPath)
        .then((ext) => {
          console.log('Better Lyrics loaded! ID:', ext.id);
          // Nếu ID in ra khác với ID bạn điền ở trên, hãy sửa lại biến EXTENSION_ID nhé
        })
        .catch((err) => {
          console.error('Failed to load Better Lyrics:', err);
        });

      if (config.enableV4Scroll !== false) {
        const jsPath = path.join(basePath, 'extensions', 'bl-scroll', 'glassyflow.js');

        try {
          const jsCode = fs.readFileSync(jsPath, 'utf8');
          window.webContents.on('dom-ready', () => {
            window.webContents.executeJavaScript(jsCode).catch(console.error);
          });
        } catch (err) {
          console.error('Failed to load lyrics scroll script:', err);
        }
      }
    },
  },
});