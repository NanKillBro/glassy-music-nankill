import { BrowserWindow } from 'electron';

import * as config from '@/config';

let fontSettingsWindow: BrowserWindow | null = null;

export const openFontSettingsWindow = (parentWin: BrowserWindow) => {
  if (fontSettingsWindow && !fontSettingsWindow.isDestroyed()) {
    fontSettingsWindow.focus();
    return;
  }

  const currentFonts = config.get('options.customFonts') ?? {
    youtubeUI: { enabled: false, family: 'Inter', size: 14, sizeUnit: 'px', weight: 400 },
    lyrics: { enabled: false, family: 'Satoshi', size: 3, sizeUnit: 'rem', weight: 700 },
  };

  fontSettingsWindow = new BrowserWindow({
    parent: parentWin,
    width: 580,
    height: 700,
    resizable: false,
    title: 'Font Settings',
    minimizable: false,
    maximizable: false,
    autoHideMenuBar: true,
    frame: false,
    transparent: true,
    show: false,
    backgroundColor: '#00000000',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  fontSettingsWindow.once('ready-to-show', () => {
    fontSettingsWindow?.show();
  });

  const ytEnabled = currentFonts.youtubeUI?.enabled ?? false;
  const lyEnabled = currentFonts.lyrics?.enabled ?? false;

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300..800&display=swap" rel="stylesheet">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }

        html { background: transparent !important; }

        body {
            font-family: 'Inter', 'Segoe UI', sans-serif;
            background: transparent !important;
            color: #fff;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            overflow: hidden;
            user-select: none;
        }
        .window-wrapper {
            position: absolute;
            inset: 0;
            background: radial-gradient(circle at top left, rgba(30, 30, 40, 0.85), rgba(15, 15, 18, 0.95));
            backdrop-filter: blur(40px) saturate(180%);
            -webkit-backdrop-filter: blur(40px) saturate(180%);
            border-radius: 16px;
            border: 1px solid rgba(255, 255, 255, 0.12);
            overflow: hidden;
            display: flex;
            justify-content: center;
            align-items: center;
            -webkit-app-region: drag;
            box-shadow: 0 25px 60px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.15);
            clip-path: inset(0 round 16px);
            animation: windowAppear 0.65s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .window-wrapper::before {
            content: "";
            position: absolute;
            top: -15%;
            left: -15%;
            width: 70%;
            height: 70%;
            background: radial-gradient(circle, rgba(123, 97, 255, 0.18) 0%, rgba(123, 97, 255, 0) 70%);
            z-index: -1;
            pointer-events: none;
            filter: blur(40px);
        }

        .window-wrapper::after {
            content: "";
            position: absolute;
            bottom: -15%;
            right: -15%;
            width: 70%;
            height: 70%;
            background: radial-gradient(circle, rgba(0, 242, 254, 0.12) 0%, rgba(0, 242, 254, 0) 70%);
            z-index: -1;
            pointer-events: none;
            filter: blur(40px);
        }

        @keyframes glowPulse {
            0% {
                opacity: 0.7;
                transform: scale(0.95) translate(0, 0);
            }
            100% {
                opacity: 1;
                transform: scale(1.05) translate(5%, 5%);
            }
        }

        @keyframes windowAppear {
            0% { opacity: 0; transform: scale(0.85) translateY(40px); filter: blur(15px); }
            100% { opacity: 1; transform: scale(1) translateY(0); filter: blur(0px); }
        }

        @keyframes windowDisappear {
            0% { opacity: 1; transform: scale(1) translateY(0); filter: blur(0px); }
            100% { opacity: 0; transform: scale(0.9) translateY(25px); filter: blur(12px); }
        }

        .window-wrapper.closing {
            animation: windowDisappear 0.4s cubic-bezier(0.32, 0, 0.67, 0) forwards !important;
            pointer-events: none;
        }

        .container, .close-btn, button, input, select, label {
            -webkit-app-region: no-drag;
        }

        .close-btn {
            position: absolute;
            top: 20px;
            right: 20px;
            width: 32px;
            height: 32px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            z-index: 100;
            transition: all 0.3s;
            border: 1px solid rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(10px);
        }
        .close-btn:hover {
            background: rgba(255, 80, 80, 0.8);
            transform: scale(1.1);
        }
        .close-btn svg { width: 14px; height: 14px; fill: #fff; }

        .container {
            width: 100%;
            height: 100%;
            background: rgba(20, 20, 25, 0.5);
            display: flex;
            flex-direction: column;
            padding: 35px 40px;
            position: relative;
            overflow-y: auto;
            box-sizing: border-box;
        }

        .container::-webkit-scrollbar { width: 5px; }
        .container::-webkit-scrollbar-track { background: transparent; }
        .container::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 10px; }

        h1 {
            font-size: 26px;
            font-weight: 700;
            background: linear-gradient(to right, #a78bfa, #818cf8);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            text-align: center;
            margin-bottom: 6px;
        }

        .subtitle {
            text-align: center;
            color: rgba(255,255,255,0.5);
            font-size: 13px;
            margin-bottom: 20px;
        }

        /* Toggle Switch */
        .toggle-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: rgba(255,255,255,0.06);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 14px;
            padding: 14px 18px;
            margin-bottom: 20px;
        }
        .toggle-row span { font-size: 15px; font-weight: 600; }
        .toggle-row .status { font-size: 12px; color: rgba(255,255,255,0.4); margin-left: 8px; }

        .switch {
            position: relative;
            width: 48px;
            height: 26px;
            flex-shrink: 0;
        }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider {
            position: absolute;
            cursor: pointer;
            inset: 0;
            background: rgba(255,255,255,0.15);
            transition: 0.35s;
            border-radius: 26px;
        }
        .slider::before {
            content: '';
            position: absolute;
            height: 20px;
            width: 20px;
            left: 3px;
            bottom: 3px;
            background: white;
            transition: 0.35s;
            border-radius: 50%;
        }
        .switch input:checked + .slider {
            background: linear-gradient(135deg, #a78bfa, #818cf8);
        }
        .switch input:checked + .slider::before {
            transform: translateX(22px);
        }

        /* Small Switch */
        .switch.small {
            width: 36px;
            height: 20px;
        }
        .switch.small .slider::before {
            height: 14px;
            width: 14px;
            left: 3px;
            bottom: 3px;
        }
        .switch.small input:checked + .slider::before {
            transform: translateX(16px);
        }

        /* Section */
        .section {
            background: rgba(255,255,255,0.04);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 16px;
            padding: 18px;
            margin-bottom: 16px;
            transition: opacity 0.3s;
        }
        .section.disabled {
            opacity: 0.35;
            pointer-events: none;
        }
        .section-title {
            font-size: 14px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            color: rgba(255,255,255,0.5);
            margin-bottom: 14px;
            display: flex;
            align-items: center;
        }
        .section-title::after {
            content: '';
            flex: 1;
            height: 1px;
            background: rgba(255,255,255,0.08);
            margin-left: 12px;
        }

        .field {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
            gap: 8px;
        }
        .field:last-child { margin-bottom: 0; }
        .field label {
            font-size: 13px;
            color: rgba(255,255,255,0.7);
            width: 70px;
            flex-shrink: 0;
        }
        .field input[type="text"],
        .field input[type="number"] {
            flex: 1;
            background: rgba(255,255,255,0.08);
            border: 1px solid rgba(255,255,255,0.12);
            border-radius: 10px;
            padding: 8px 12px;
            color: #fff;
            font-size: 13px;
            font-family: 'Inter', sans-serif;
            outline: none;
            transition: border-color 0.2s;
        }
        .field input:focus {
            border-color: rgba(167, 139, 250, 0.6);
        }
        .field select {
            background: rgba(255,255,255,0.08);
            border: 1px solid rgba(255,255,255,0.12);
            border-radius: 10px;
            padding: 8px 10px;
            color: #fff;
            font-size: 13px;
            font-family: 'Inter', sans-serif;
            outline: none;
            cursor: pointer;
            appearance: none;
            min-width: 60px;
        }
        .field select option { background: #2a2a3a; color: #fff; }

        /* Weight presets */
        .weight-presets {
            display: flex;
            gap: 4px;
            flex-wrap: wrap;
        }
        .weight-presets button {
            background: rgba(255,255,255,0.08);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 8px;
            padding: 4px 8px;
            color: rgba(255,255,255,0.7);
            font-size: 11px;
            cursor: pointer;
            transition: all 0.2s;
            font-family: 'Inter', sans-serif;
        }
        .weight-presets button:hover {
            background: rgba(167,139,250,0.3);
            color: #fff;
        }
        .weight-presets button.active {
            background: rgba(167,139,250,0.4);
            border-color: rgba(167,139,250,0.6);
            color: #fff;
        }

        /* Save button */
        .save-btn {
            width: 100%;
            padding: 12px;
            border: none;
            border-radius: 14px;
            background: linear-gradient(135deg, #a78bfa, #818cf8);
            color: #fff;
            font-size: 15px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.3s;
            font-family: 'Inter', sans-serif;
            margin-top: 6px;
            letter-spacing: 0.3px;
        }
        .save-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(129, 140, 248, 0.4);
        }
        .save-btn:active {
            transform: translateY(0);
        }

        /* Help docs */
        .help-box {
            background: rgba(167,139,250,0.08);
            border: 1px solid rgba(167,139,250,0.2);
            border-radius: 12px;
            padding: 14px 16px;
            margin-bottom: 18px;
            font-size: 12px;
            line-height: 1.7;
            color: rgba(255,255,255,0.6);
        }
        .help-box summary {
            cursor: pointer;
            font-weight: 600;
            color: rgba(255,255,255,0.8);
            font-size: 13px;
            margin-bottom: 6px;
        }
        .help-box code {
            background: rgba(0,0,0,0.3);
            color: #a78bfa;
            padding: 1px 5px;
            border-radius: 4px;
            font-family: 'Consolas', monospace;
            font-size: 11px;
        }
        .help-box ul { padding-left: 16px; margin: 4px 0; }
        .help-box li { margin-bottom: 2px; }

        /* Section toggle */
        .section-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 14px;
        }
        .section-body.disabled {
            opacity: 0.35;
            pointer-events: none;
        }

        /* Validation */
        .field input.invalid, .field select.invalid {
            border-color: rgba(255,100,100,0.6) !important;
            background: rgba(255,50,50,0.08) !important;
        }
        .toast {
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%) translateY(20px);
            background: rgba(255,80,80,0.9);
            color: #fff;
            padding: 10px 20px;
            border-radius: 10px;
            font-size: 13px;
            font-weight: 600;
            opacity: 0;
            transition: all 0.3s;
            z-index: 999;
            pointer-events: none;
            backdrop-filter: blur(10px);
        }
        .toast.show {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
        .toast.success {
            background: rgba(80,200,120,0.9);
        }

        /* Google Font status */
        .gf-status {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            font-size: 11px;
            font-weight: 600;
            padding: 3px 8px;
            border-radius: 6px;
            transition: all 0.3s;
            white-space: nowrap;
        }
        .gf-status .dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            flex-shrink: 0;
        }
        .gf-status.idle { display: none; }
        .gf-status.checking {
            color: rgba(255,255,255,0.5);
            background: rgba(255,255,255,0.05);
        }
        .gf-status.checking .dot {
            background: rgba(255,255,255,0.4);
            animation: pulse 0.8s ease-in-out infinite;
        }
        @keyframes pulse {
            0%, 100% { opacity: 0.3; transform: scale(0.8); }
            50% { opacity: 1; transform: scale(1.2); }
        }
        .gf-status.ok {
            color: #6ee7b7;
            background: rgba(110,231,183,0.08);
        }
        .gf-status.ok .dot { background: #6ee7b7; }
        .gf-status.error {
            color: #fca5a5;
            background: rgba(252,165,165,0.08);
        }
        .gf-status.error .dot { background: #f87171; }
    </style>
</head>
<body>
    <div class="window-wrapper" id="windowWrapper">
        <div class="close-btn" id="closeBtn" title="Close">
            <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
        </div>

        <div class="container">
            <h1>Font Settings</h1>
            <div class="subtitle">Customize fonts for YouTube Music UI and Lyrics</div>

            <!-- Help Docs -->
            <details class="help-box">
                <summary>How to use — click to expand</summary>
                <p><strong>Font Family:</strong> Enter a font name installed on your computer.</p>
                <ul>
                    <li>Common: <code>Inter</code>, <code>Arial</code>, <code>Segoe UI</code>, <code>Roboto</code></li>
                    <li>If the font is not found, the browser will use a fallback.</li>
                </ul>
                <p><strong>Font Size:</strong> Numbers only. <code>px</code> = fixed, <code>rem</code> = relative.</p>
                <p><strong>Font Weight:</strong> 100 (thin) → 900 (black). Common: 400 (regular), 700 (bold).</p>
                <p><strong>Note: Only Merge Theme is supported.</strong></p>
            </details>

            <!-- YouTube Music UI Section -->
            <div class="section" id="ytSection">
                <div class="section-header">
                    <div class="section-title" style="margin-bottom:0">YouTube Music UI & Song Info</div>
                    <label class="switch">
                        <input type="checkbox" id="ytEnabled" ${ytEnabled ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                </div>
                <div class="section-body ${!ytEnabled ? 'disabled' : ''}" id="ytBody">
                    <div class="field">
                        <label>Family</label>
                        <input type="text" id="ytFamily" value="${currentFonts.youtubeUI.family}" placeholder="Inter, Arial, ...">
                    </div>
                    <div class="field" style="flex-wrap: wrap; justify-content: space-between; background: rgba(167,139,250,0.05); border: 1px solid rgba(167,139,250,0.1); padding: 10px 12px; border-radius: 10px; margin-top: -2px; margin-bottom: 14px;">
                        <div style="display:flex; align-items:center; gap:6px;" title="Type exact font name from fonts.google.com. We will download it automatically!">
                            <span style="font-size:13px; color:#a78bfa;">Load from Google Fonts</span>
                            <span style="display:inline-flex; align-items:center; justify-content:center; width:14px; height:14px; border-radius:50%; background:rgba(167,139,250,0.2); color:#a78bfa; font-size:10px; font-weight:bold; cursor:help;">i</span>
                        </div>
                        <div style="display:flex; align-items:center; gap:8px;">
                            <span class="gf-status idle" id="ytGfStatus"><span class="dot"></span><span class="msg"></span></span>
                            <label class="switch small">
                                <input type="checkbox" id="ytGoogleFont" ${currentFonts.youtubeUI.useGoogleFont ? 'checked' : ''}>
                                <span class="slider"></span>
                            </label>
                        </div>
                    </div>
                    <div class="field">
                        <label style="display:flex; align-items:center; gap:4px;" title="This size only applies to the Song Info text (title & artist) to preserve YouTube Music's default visual hierarchy.">
                            Size
                            <span style="display:inline-flex; align-items:center; justify-content:center; width:14px; height:14px; border-radius:50%; background:rgba(255,255,255,0.2); color:rgba(255,255,255,0.8); font-size:10px; font-weight:bold; cursor:help;">i</span>
                        </label>
                        <input type="number" id="ytSize" value="${currentFonts.youtubeUI.size}" min="1" max="200" step="0.1">
                        <select id="ytSizeUnit">
                            <option value="px" ${currentFonts.youtubeUI.sizeUnit === 'px' ? 'selected' : ''}>px</option>
                            <option value="rem" ${currentFonts.youtubeUI.sizeUnit === 'rem' ? 'selected' : ''}>rem</option>
                        </select>
                    </div>
                    <div class="field">
                        <label>Weight</label>
                        <input type="number" id="ytWeight" value="${currentFonts.youtubeUI.weight}" min="100" max="900" step="100">
                        <div class="weight-presets" data-target="ytWeight">
                            <button data-val="300">Light</button>
                            <button data-val="400">Regular</button>
                            <button data-val="500">Medium</button>
                            <button data-val="600">Semi</button>
                            <button data-val="700">Bold</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Lyrics Section -->
            <div class="section" id="lyricsSection">
                <div class="section-header">
                    <div class="section-title" style="margin-bottom:0">Lyrics (Better Lyrics)</div>
                    <label class="switch">
                        <input type="checkbox" id="lyricsEnabled" ${lyEnabled ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                </div>
                <div class="section-body ${!lyEnabled ? 'disabled' : ''}" id="lyricsBody">
                    <div class="field">
                        <label>Family</label>
                        <input type="text" id="lyricsFamily" value="${currentFonts.lyrics.family}" placeholder="Satoshi, ...">
                    </div>
                    <div class="field" style="flex-wrap: wrap; justify-content: space-between; background: rgba(167,139,250,0.05); border: 1px solid rgba(167,139,250,0.1); padding: 10px 12px; border-radius: 10px; margin-top: -2px; margin-bottom: 14px;">
                        <div style="display:flex; align-items:center; gap:6px;" title="Type exact font name from fonts.google.com. We will download it automatically!">
                            <span style="font-size:13px; color:#a78bfa;">Load from Google Fonts</span>
                            <span style="display:inline-flex; align-items:center; justify-content:center; width:14px; height:14px; border-radius:50%; background:rgba(167,139,250,0.2); color:#a78bfa; font-size:10px; font-weight:bold; cursor:help;">i</span>
                        </div>
                        <div style="display:flex; align-items:center; gap:8px;">
                            <span class="gf-status idle" id="lyricsGfStatus"><span class="dot"></span><span class="msg"></span></span>
                            <label class="switch small">
                                <input type="checkbox" id="lyricsGoogleFont" ${currentFonts.lyrics.useGoogleFont ? 'checked' : ''}>
                                <span class="slider"></span>
                            </label>
                        </div>
                    </div>
                    <div class="field">
                        <label>Size</label>
                        <input type="number" id="lyricsSize" value="${currentFonts.lyrics.size}" min="0.1" max="200" step="0.1">
                        <select id="lyricsSizeUnit">
                            <option value="px" ${currentFonts.lyrics.sizeUnit === 'px' ? 'selected' : ''}>px</option>
                            <option value="rem" ${currentFonts.lyrics.sizeUnit === 'rem' ? 'selected' : ''}>rem</option>
                        </select>
                    </div>
                    <div class="field">
                        <label>Weight</label>
                        <input type="number" id="lyricsWeight" value="${currentFonts.lyrics.weight}" min="100" max="900" step="100">
                        <div class="weight-presets" data-target="lyricsWeight">
                            <button data-val="400">Regular</button>
                            <button data-val="500">Medium</button>
                            <button data-val="600">Semi</button>
                            <button data-val="700">Bold</button>
                            <button data-val="800">Extra</button>
                        </div>
                    </div>
                </div>
            </div>

            <button class="save-btn" id="saveBtn">Save & Apply</button>
        </div>
        <div class="toast" id="toast"></div>
    </div>

    <script>
        // Per-section toggles
        const ytToggle = document.getElementById('ytEnabled');
        const lyricsToggle = document.getElementById('lyricsEnabled');
        const ytBody = document.getElementById('ytBody');
        const lyricsBody = document.getElementById('lyricsBody');

        ytToggle.addEventListener('change', () => {
            ytBody.classList.toggle('disabled', !ytToggle.checked);
        });
        // Google Fonts status check
        async function checkGoogleFont(fontFamily, weight, statusEl) {
            if (!fontFamily || !fontFamily.trim()) {
                statusEl.className = 'gf-status idle';
                return;
            }
            statusEl.className = 'gf-status checking';
            statusEl.querySelector('.msg').textContent = 'Checking...';
            try {
                const name = fontFamily.trim().replace(/ /g, '+');
                const url = 'https://fonts.googleapis.com/css2?family=' + name + ':wght@' + weight + '&display=swap';
                const res = await fetch(url, { method: 'HEAD' });
                if (res.ok) {
                    statusEl.className = 'gf-status ok';
                    statusEl.querySelector('.msg').textContent = '✓ Found';
                } else {
                    statusEl.className = 'gf-status error';
                    statusEl.querySelector('.msg').textContent = '✗ ' + (res.status === 400 || res.status === 404 ? 'Not Found' : res.status);
                }
            } catch (e) {
                statusEl.className = 'gf-status error';
                statusEl.querySelector('.msg').textContent = navigator.onLine ? '✗ Not Found' : '✗ Offline';
            }
        }

        let ytGfTimer = null, lyGfTimer = null;
        function scheduleGfCheck(familyId, statusId, timerKey) {
            const toggle = document.getElementById(familyId.replace('Family', 'GoogleFont'));
            const statusEl = document.getElementById(statusId);
            if (!toggle.checked) { statusEl.className = 'gf-status idle'; return; }
            const weightInput = document.getElementById(familyId.replace('Family', 'Weight'));
            const weight = weightInput ? (weightInput.value || 400) : 400;
            const familyVal = document.getElementById(familyId).value;
            if (timerKey === 'yt') { clearTimeout(ytGfTimer); ytGfTimer = setTimeout(() => checkGoogleFont(familyVal, weight, statusEl), 1000); }
            else { clearTimeout(lyGfTimer); lyGfTimer = setTimeout(() => checkGoogleFont(familyVal, weight, statusEl), 1000); }
        }

        // Wire up Google Font toggle + family/weight input events
        document.getElementById('ytGoogleFont').addEventListener('change', () => scheduleGfCheck('ytFamily', 'ytGfStatus', 'yt'));
        document.getElementById('ytFamily').addEventListener('input', () => { if (document.getElementById('ytGoogleFont').checked) scheduleGfCheck('ytFamily', 'ytGfStatus', 'yt'); });
        document.getElementById('ytWeight').addEventListener('input', () => { if (document.getElementById('ytGoogleFont').checked) scheduleGfCheck('ytFamily', 'ytGfStatus', 'yt'); });

        document.getElementById('lyricsGoogleFont').addEventListener('change', () => scheduleGfCheck('lyricsFamily', 'lyricsGfStatus', 'ly'));
        document.getElementById('lyricsFamily').addEventListener('input', () => { if (document.getElementById('lyricsGoogleFont').checked) scheduleGfCheck('lyricsFamily', 'lyricsGfStatus', 'ly'); });
        document.getElementById('lyricsWeight').addEventListener('input', () => { if (document.getElementById('lyricsGoogleFont').checked) scheduleGfCheck('lyricsFamily', 'lyricsGfStatus', 'ly'); });

        // Auto-check on load if Google Font is enabled
        if (document.getElementById('ytGoogleFont').checked) scheduleGfCheck('ytFamily', 'ytGfStatus', 'yt');
        if (document.getElementById('lyricsGoogleFont').checked) scheduleGfCheck('lyricsFamily', 'lyricsGfStatus', 'ly');

        lyricsToggle.addEventListener('change', () => {
            lyricsBody.classList.toggle('disabled', !lyricsToggle.checked);
        });

        // Weight preset buttons
        document.querySelectorAll('.weight-presets').forEach(group => {
            const targetId = group.dataset.target;
            const input = document.getElementById(targetId);
            group.querySelectorAll('button').forEach(btn => {
                if (btn.dataset.val === input.value) btn.classList.add('active');
                btn.addEventListener('click', () => {
                    input.value = btn.dataset.val;
                    group.querySelectorAll('button').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    input.dispatchEvent(new Event('input'));
                });
            });
            input.addEventListener('input', () => {
                group.querySelectorAll('button').forEach(b => {
                    b.classList.toggle('active', b.dataset.val === input.value);
                });
            });
        });

        // Toast
        function showToast(msg, isSuccess) {
            const toast = document.getElementById('toast');
            toast.textContent = msg;
            toast.className = 'toast show' + (isSuccess ? ' success' : '');
            setTimeout(() => { toast.className = 'toast'; }, 4000);
        }

        // Validation helpers
        function validateNumber(el, min, max) {
            const v = parseFloat(el.value);
            if (isNaN(v) || v < min || v > max) { el.classList.add('invalid'); return null; }
            el.classList.remove('invalid');
            return v;
        }
        function validateText(el) {
            const v = el.value.trim();
            if (!v || /[<>{}]/.test(v)) { el.classList.add('invalid'); return null; }
            el.classList.remove('invalid');
            return v;
        }
        function validateWeight(el) {
            const v = parseInt(el.value);
            if (isNaN(v) || v < 100 || v > 900) { el.classList.add('invalid'); return null; }
            el.classList.remove('invalid');
            return v;
        }

        // Close
        document.getElementById('closeBtn').addEventListener('click', () => {
            const wrapper = document.getElementById('windowWrapper');
            if (wrapper.classList.contains('closing')) return;
            wrapper.classList.add('closing');
            setTimeout(() => { document.title = '__FONT_CLOSE__'; }, 50);
        });

        // Save with validation
        document.getElementById('saveBtn').addEventListener('click', () => {
            document.querySelectorAll('.invalid').forEach(e => e.classList.remove('invalid'));
            let hasError = false;

            let ytF = 'Inter', ytS = 14, ytW = 400;
            if (ytToggle.checked) {
                const f = validateText(document.getElementById('ytFamily'));
                const s = validateNumber(document.getElementById('ytSize'), 1, 200);
                const w = validateWeight(document.getElementById('ytWeight'));
                if (!f || s === null || !w) hasError = true;
                else { ytF = f; ytS = s; ytW = w; }
            } else {
                ytF = document.getElementById('ytFamily').value.trim() || 'Inter';
                ytS = parseFloat(document.getElementById('ytSize').value) || 14;
                ytW = parseInt(document.getElementById('ytWeight').value) || 400;
            }

            let lyF = 'Satoshi', lyS = 3, lyW = 700;
            if (lyricsToggle.checked) {
                const f = validateText(document.getElementById('lyricsFamily'));
                const s = validateNumber(document.getElementById('lyricsSize'), 0.1, 200);
                const w = validateWeight(document.getElementById('lyricsWeight'));
                if (!f || s === null || !w) hasError = true;
                else { lyF = f; lyS = s; lyW = w; }
            } else {
                lyF = document.getElementById('lyricsFamily').value.trim() || 'Satoshi';
                lyS = parseFloat(document.getElementById('lyricsSize').value) || 3;
                lyW = parseInt(document.getElementById('lyricsWeight').value) || 700;
            }

            if (hasError) {
                showToast('⚠️ Invalid values — check highlighted fields', false);
                return;
            }

            const data = {
                youtubeUI: { enabled: ytToggle.checked, useGoogleFont: document.getElementById('ytGoogleFont').checked, family: ytF, size: ytS, sizeUnit: document.getElementById('ytSizeUnit').value, weight: ytW },
                lyrics: { enabled: lyricsToggle.checked, useGoogleFont: document.getElementById('lyricsGoogleFont').checked, family: lyF, size: lyS, sizeUnit: document.getElementById('lyricsSizeUnit').value, weight: lyW },
            };
            document.title = '__FONT_SAVE__' + JSON.stringify(data);
            showToast('✅ Saved! Some display issues may occur, please restart the app for best results.', true);
        });
    </script>
</body>
</html>`;

  fontSettingsWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);

  fontSettingsWindow.webContents.on('page-title-updated', (event, title) => {
    event.preventDefault();

    if (title === '__FONT_CLOSE__') {
      if (!fontSettingsWindow || fontSettingsWindow.isDestroyed()) return;
      setTimeout(() => {
        if (!fontSettingsWindow || fontSettingsWindow.isDestroyed()) return;
        let opacity = 1;
        const steps = 18;
        const interval = 280 / steps;
        const fadeTimer = setInterval(() => {
          opacity -= 1 / steps;
          if (opacity <= 0) {
            clearInterval(fadeTimer);
            if (fontSettingsWindow && !fontSettingsWindow.isDestroyed()) {
              fontSettingsWindow.destroy();
              fontSettingsWindow = null;
            }
          } else if (fontSettingsWindow && !fontSettingsWindow.isDestroyed()) {
            fontSettingsWindow.setOpacity(Math.max(0, opacity));
          } else {
            clearInterval(fadeTimer);
          }
        }, interval);
      }, 120);
      return;
    }

    if (title.startsWith('__FONT_SAVE__')) {
      try {
        const data = JSON.parse(title.replace('__FONT_SAVE__', ''));
        config.set('options.customFonts', data);
        // Send to renderer for live CSS update
        parentWin.webContents.send('peard:custom-fonts-changed', data);
      } catch (err) {
        console.error('Failed to parse font settings:', err);
      }
    }
  });

  fontSettingsWindow.on('closed', () => {
    fontSettingsWindow = null;
  });
};
