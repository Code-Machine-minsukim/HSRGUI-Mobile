// ==UserScript==
// @name         HSRGUI Mobile
// @namespace    hsrgui.mobile
// @version      0.9.1
// @description  HSR themed UI for ChatGPT mobile
// @match        https://chatgpt.com/*
// @grant        GM_addStyle
// @updateURL    https://raw.githubusercontent.com/Code-Machine-minsukim/HSRGUI-Mobile/main/scripts/HSRGUI_Mobile.user.js
// @downloadURL  https://raw.githubusercontent.com/Code-Machine-minsukim/HSRGUI-Mobile/main/scripts/HSRGUI_Mobile.user.js
// ==/UserScript==

(function () {
  "use strict";

  const STORAGE_KEY = "hsrgui_mobile_config_v091";

  const DEFAULT_CONFIG = {
    headerTitle: "오공열차",
    headerSubtitle: "인간개조의 용광로",
    assistantName: "March.7th",
    userName: "오공이",
    assistantAvatarKey: "march7",
    userAvatarKey: "stelle",
    theme: "express",
    showHeaderBadge: true,
    stickerMode: "emotion", // emotion | random | on | off
    characterThemeMode: "march7", // march7 | acheron | asta | castorice | custom
    layoutMode: "default" // default | compact
  };

  const THEMES = {
    express: {
      bg: "#bfc7cf",
      panel: "rgba(255,255,255,0.84)",
      panelBorder: "rgba(0,0,0,0.06)",
      headerTitle: "#111111",
      headerSub: "rgba(0,0,0,0.55)",
      chipBg: "rgba(255,255,255,0.72)",
      chipText: "#111111",
      userBubble: "#d8c39b",
      userBubbleText: "#111111",
      assistantBubble: "#ececec",
      assistantBubbleText: "#111111",
      shadow: "0 4px 12px rgba(0,0,0,0.08)",
      settingsBg: "rgba(255,255,255,0.96)",
      settingsText: "#111111",
      settingsBorder: "rgba(0,0,0,0.08)",
      inputBg: "rgba(255,255,255,0.95)"
    },
    midnight: {
      bg: "#20262d",
      panel: "rgba(38,44,54,0.88)",
      panelBorder: "rgba(255,255,255,0.06)",
      headerTitle: "#f3f5f7",
      headerSub: "rgba(255,255,255,0.65)",
      chipBg: "rgba(255,255,255,0.10)",
      chipText: "#f3f5f7",
      userBubble: "#5a4b7a",
      userBubbleText: "#ffffff",
      assistantBubble: "#2c3340",
      assistantBubbleText: "#f2f2f2",
      shadow: "0 4px 14px rgba(0,0,0,0.24)",
      settingsBg: "rgba(29,34,42,0.98)",
      settingsText: "#f3f5f7",
      settingsBorder: "rgba(255,255,255,0.08)",
      inputBg: "rgba(29,34,42,0.96)"
    },
    silver: {
      bg: "#d8dde3",
      panel: "rgba(250,250,252,0.88)",
      panelBorder: "rgba(0,0,0,0.05)",
      headerTitle: "#20242a",
      headerSub: "rgba(0,0,0,0.50)",
      chipBg: "rgba(255,255,255,0.72)",
      chipText: "#20242a",
      userBubble: "#cfd4dc",
      userBubbleText: "#111111",
      assistantBubble: "#f3f4f6",
      assistantBubbleText: "#111111",
      shadow: "0 4px 12px rgba(0,0,0,0.07)",
      settingsBg: "rgba(252,252,253,0.98)",
      settingsText: "#20242a",
      settingsBorder: "rgba(0,0,0,0.08)",
      inputBg: "rgba(255,255,255,0.96)"
    },
    acheron: {
      bg: "#2a2233",
      panel: "rgba(39,31,48,0.90)",
      panelBorder: "rgba(255,255,255,0.06)",
      headerTitle: "#efe7ff",
      headerSub: "rgba(239,231,255,0.68)",
      chipBg: "rgba(255,255,255,0.10)",
      chipText: "#efe7ff",
      userBubble: "#6c5a88",
      userBubbleText: "#ffffff",
      assistantBubble: "#372d45",
      assistantBubbleText: "#f6f2ff",
      shadow: "0 4px 16px rgba(0,0,0,0.28)",
      settingsBg: "rgba(30,25,38,0.98)",
      settingsText: "#efe7ff",
      settingsBorder: "rgba(255,255,255,0.08)",
      inputBg: "rgba(30,25,38,0.96)"
    },
    asta: {
      bg: "#f1d7c6",
      panel: "rgba(255,250,246,0.90)",
      panelBorder: "rgba(120,70,40,0.08)",
      headerTitle: "#7a3f16",
      headerSub: "rgba(122,63,22,0.68)",
      chipBg: "rgba(255,255,255,0.74)",
      chipText: "#7a3f16",
      userBubble: "#f0b287",
      userBubbleText: "#3a1b08",
      assistantBubble: "#fff3ea",
      assistantBubbleText: "#3a1b08",
      shadow: "0 4px 12px rgba(120,70,40,0.12)",
      settingsBg: "rgba(255,250,246,0.98)",
      settingsText: "#5f3113",
      settingsBorder: "rgba(120,70,40,0.10)",
      inputBg: "rgba(255,252,248,0.96)"
    },
    castorice: {
      bg: "#d7d9ee",
      panel: "rgba(248,248,255,0.90)",
      panelBorder: "rgba(60,70,120,0.08)",
      headerTitle: "#4a4f84",
      headerSub: "rgba(74,79,132,0.64)",
      chipBg: "rgba(255,255,255,0.78)",
      chipText: "#4a4f84",
      userBubble: "#c9d2ff",
      userBubbleText: "#1c2244",
      assistantBubble: "#f6f7ff",
      assistantBubbleText: "#1c2244",
      shadow: "0 4px 12px rgba(60,70,120,0.10)",
      settingsBg: "rgba(250,250,255,0.98)",
      settingsText: "#3d4478",
      settingsBorder: "rgba(60,70,120,0.10)",
      inputBg: "rgba(252,252,255,0.96)"
    }
  };

  const CHARACTER_PRESETS = {
    march7: {
      assistantName: "March.7th",
      assistantAvatarKey: "march7",
      theme: "express"
    },
    acheron: {
      assistantName: "Acheron",
      assistantAvatarKey: "acheron",
      theme: "acheron"
    },
    asta: {
      assistantName: "Asta",
      assistantAvatarKey: "asta",
      theme: "asta"
    },
    castorice: {
      assistantName: "Castorice",
      assistantAvatarKey: "castorice",
      theme: "castorice"
    },
    custom: null
  };

  function loadConfig() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULT_CONFIG };
      return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
    } catch {
      return { ...DEFAULT_CONFIG };
    }
  }

  function saveConfig() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(CONFIG));
    } catch {}
  }

  const CONFIG = loadConfig();

  function applyCharacterPreset(mode) {
    if (!CHARACTER_PRESETS[mode]) return;
    if (mode === "custom") {
      CONFIG.characterThemeMode = "custom";
      saveConfig();
      return;
    }
    const preset = CHARACTER_PRESETS[mode];
    CONFIG.characterThemeMode = mode;
    CONFIG.assistantName = preset.assistantName;
    CONFIG.assistantAvatarKey = preset.assistantAvatarKey;
    CONFIG.theme = preset.theme;
    saveConfig();
  }

  if (!CONFIG.characterThemeMode) CONFIG.characterThemeMode = "march7";
  if (!CONFIG.layoutMode) CONFIG.layoutMode = "default";

  let theme = THEMES[CONFIG.theme] || THEMES.express;

  const CDN_JSDELIVR = "https://cdn.jsdelivr.net/gh/Code-Machine-minsukim/HSRGUI-Mobile@main/assets";
  const CDN_RAW = "https://raw.githubusercontent.com/Code-Machine-minsukim/HSRGUI-Mobile/main/assets";
  const ASSET_VERSION = "091";

  function assetUrl(path, useRaw = false) {
    const base = useRaw ? CDN_RAW : CDN_JSDELIVR;
    return `${base}/${path}?v=${ASSET_VERSION}`;
  }

  const AVATAR_PATHS = {
    march7: "icons/march7.png",
    stelle: "icons/stelle.png",
    acheron: "icons/acheron.png",
    asta: "icons/asta.png",
    castorice: "icons/castorice.png"
  };

  function avatarUrl(key, fallback = "march7", useRaw = false) {
    const path = AVATAR_PATHS[key] || AVATAR_PATHS[fallback];
    return assetUrl(path, useRaw);
  }

  const STICKER_BANK = {
    happy: [
      "stickers/sticker_1.png",
      "stickers/sticker_2.png",
      "stickers/sticker_10.png",
      "stickers/sticker_11.png",
      "stickers/sticker_12.png",
      "stickers/sticker_14.png",
      "stickers/sticker_24.png",
      "stickers/sticker_30.png"
    ],
    thinking: [
      "stickers/sticker_3.png",
      "stickers/sticker_4.png",
      "stickers/sticker_16.png",
      "stickers/sticker_33.png",
      "stickers/sticker_42.png",
      "stickers/sticker_50.png",
      "stickers/sticker_57.png",
      "stickers/sticker_64.png"
    ],
    surprise: [
      "stickers/sticker_5.png",
      "stickers/sticker_6.png",
      "stickers/sticker_37.png",
      "stickers/sticker_72.png",
      "stickers/sticker_81.png",
      "stickers/sticker_89.png",
      "stickers/sticker_99.png",
      "stickers/sticker_114.png"
    ],
    sad: [
      "stickers/sticker_7.png",
      "stickers/sticker_8.png",
      "stickers/sticker_9.png",
      "stickers/sticker_13.png",
      "stickers/sticker_15.png",
      "stickers/sticker_120.png",
      "stickers/sticker_131.png",
      "stickers/sticker_148.png"
    ]
  };

  const RANDOM_STICKERS = [
    "stickers/sticker_1.png", "stickers/sticker_2.png", "stickers/sticker_3.png",
    "stickers/sticker_4.png", "stickers/sticker_5.png", "stickers/sticker_6.png",
    "stickers/sticker_7.png", "stickers/sticker_8.png", "stickers/sticker_9.png",
    "stickers/sticker_10.png", "stickers/sticker_11.png", "stickers/sticker_12.png",
    "stickers/sticker_13.png", "stickers/sticker_14.png", "stickers/sticker_15.png",
    "stickers/sticker_16.png", "stickers/sticker_24.png", "stickers/sticker_30.png",
    "stickers/sticker_33.png", "stickers/sticker_37.png", "stickers/sticker_42.png",
    "stickers/sticker_50.png", "stickers/sticker_57.png", "stickers/sticker_64.png",
    "stickers/sticker_72.png", "stickers/sticker_81.png", "stickers/sticker_89.png",
    "stickers/sticker_99.png", "stickers/sticker_114.png", "stickers/sticker_120.png",
    "stickers/sticker_131.png", "stickers/sticker_148.png", "stickers/sticker_167.png",
    "stickers/sticker_190.png", "stickers/sticker_193.png", "stickers/sticker_194.png",
    "stickers/sticker_195.png", "stickers/sticker_196.png", "stickers/sticker_217.png",
    "stickers/sticker_239.png", "stickers/sticker_274.png", "stickers/sticker_301.png",
    "stickers/sticker_330.png", "stickers/sticker_336.png", "stickers/sticker_337.png",
    "stickers/sticker_338.png", "stickers/sticker_339.png", "stickers/sticker_340.png",
    "stickers/sticker_370.png", "stickers/sticker_425.png"
  ];

  function pickFrom(arr, seed) {
    if (!arr || !arr.length) return "";
    return arr[seed % arr.length];
  }

  function isCompact() {
    return CONFIG.layoutMode === "compact";
  }

  function buildCss() {
    theme = THEMES[CONFIG.theme] || THEMES.express;

    const headerPad = isCompact() ? "10px 14px 8px 14px" : "14px 18px 10px 18px";
    const titleSize = isCompact() ? "18px" : "20px";
    const subtitleSize = isCompact() ? "11px" : "12px";
    const labelFont = isCompact() ? "13px" : "14px";
    const avatarSize = isCompact() ? "34px" : "42px";
    const bubblePad = isCompact() ? "11px 13px" : "14px 16px";
    const stickerWidth = isCompact() ? "82px" : "110px";
    const turnGap = isCompact() ? "2px" : "4px";
    const settingsTop = isCompact() ? "56px" : "64px";

    return `
      body {
        background: ${theme.bg} !important;
        overflow-x: hidden !important;
      }

      header {
        display: none !important;
      }

      #hsr-header {
        position: sticky;
        top: 0;
        z-index: 999;
        background: ${theme.panel};
        backdrop-filter: blur(12px);
        border-bottom: 1px solid ${theme.panelBorder};
        padding: ${headerPad};
        box-shadow: ${theme.shadow};
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 12px;
      }

      #hsr-header-left {
        min-width: 0;
      }

      #hsr-title {
        font-weight: 800;
        font-size: ${titleSize};
        color: ${theme.headerTitle};
        line-height: 1.1;
        letter-spacing: -0.02em;
      }

      #hsr-subtitle {
        margin-top: 4px;
        font-size: ${subtitleSize};
        color: ${theme.headerSub};
        line-height: 1.2;
      }

      #hsr-header-right {
        display: flex;
        flex-direction: row;
        align-items: flex-start;
        gap: 8px;
        flex-shrink: 0;
      }

      #hsr-badge {
        display: ${CONFIG.showHeaderBadge ? "flex" : "none"};
        align-items: center;
        gap: 8px;
        padding: 6px 10px;
        border-radius: 999px;
        background: rgba(255,255,255,0.55);
        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      }

      #hsr-badge img {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        object-fit: cover;
        display: block;
        background: rgba(255,255,255,0.35);
      }

      #hsr-badge-text {
        font-size: 12px;
        font-weight: 700;
        color: ${theme.headerTitle};
        white-space: nowrap;
      }

      #hsr-settings-btn {
        border: none;
        border-radius: 999px;
        padding: 7px 11px;
        font-size: 14px;
        font-weight: 800;
        background: ${theme.chipBg};
        color: ${theme.chipText};
        box-shadow: 0 2px 8px rgba(0,0,0,0.07);
      }

      #hsr-settings-panel {
        position: fixed;
        top: ${settingsTop};
        right: 12px;
        width: min(340px, calc(100vw - 24px));
        max-height: 70vh;
        overflow-y: auto;
        background: ${theme.settingsBg};
        color: ${theme.settingsText};
        border: 1px solid ${theme.settingsBorder};
        border-radius: 16px;
        box-shadow: 0 16px 36px rgba(0,0,0,0.18);
        padding: 14px;
        z-index: 99999;
        display: none;
        backdrop-filter: blur(12px);
      }

      #hsr-settings-panel.open {
        display: block;
      }

      .hsr-settings-title {
        font-size: 15px;
        font-weight: 900;
        margin-bottom: 12px;
      }

      .hsr-settings-group {
        margin-bottom: 12px;
      }

      .hsr-settings-label {
        font-size: 12px;
        font-weight: 800;
        margin-bottom: 6px;
        opacity: 0.8;
      }

      .hsr-settings-options {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
      }

      .hsr-settings-option {
        border: none;
        border-radius: 999px;
        padding: 6px 10px;
        font-size: 11px;
        font-weight: 800;
        background: ${theme.chipBg};
        color: ${theme.chipText};
        box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      }

      .hsr-settings-option.is-active {
        outline: 2px solid rgba(0,0,0,0.18);
      }

      .hsr-settings-inputs {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .hsr-settings-input {
        width: 100%;
        box-sizing: border-box;
        border: 1px solid ${theme.settingsBorder};
        background: ${theme.inputBg};
        color: ${theme.settingsText};
        border-radius: 12px;
        padding: 10px 12px;
        font-size: 13px;
        outline: none;
      }

      .hsr-settings-hint {
        font-size: 11px;
        opacity: 0.65;
        margin-top: 2px;
      }

      main article,
      main [data-message-author-role],
      main .markdown,
      main .prose,
      main [class*="prose"],
      main [class*="markdown"] {
        opacity: 1 !important;
        visibility: visible !important;
        max-height: none !important;
        overflow: visible !important;
        color: inherit !important;
      }

      .hsr-turn-wrap {
        display: flex !important;
        flex-direction: column !important;
        width: 100% !important;
        box-sizing: border-box !important;
        animation: hsrFadeIn .25s ease;
        gap: ${turnGap};
      }

      .hsr-turn-wrap[data-message-author-role="assistant"] {
        align-items: flex-start !important;
        text-align: left !important;
      }

      .hsr-turn-wrap[data-message-author-role="user"] {
        align-items: flex-end !important;
        text-align: right !important;
      }

      @keyframes hsrFadeIn {
        from { opacity: 0; transform: translateY(6px); }
        to   { opacity: 1; transform: translateY(0); }
      }

      .hsr-avatar-label {
        display: flex !important;
        align-items: center !important;
        gap: 10px !important;
        margin: 4px 0 8px 0 !important;
        font-weight: 800 !important;
        font-size: ${labelFont} !important;
        color: ${theme.headerTitle};
      }

      .hsr-avatar-label img {
        width: ${avatarSize};
        height: ${avatarSize};
        border-radius: 50%;
        object-fit: cover;
        box-shadow: 0 2px 6px rgba(0,0,0,0.18);
        flex-shrink: 0;
        display: block;
        background: rgba(255,255,255,0.35);
      }

      .hsr-user-label {
        flex-direction: row-reverse !important;
        justify-content: flex-end !important;
        align-self: flex-end !important;
        text-align: right !important;
      }

      .hsr-bubble {
        border-radius: 18px !important;
        padding: ${bubblePad} !important;
        box-shadow: 0 4px 10px rgba(0,0,0,0.10);
        overflow: visible !important;
        word-break: break-word !important;
      }

      .hsr-turn-wrap[data-message-author-role="assistant"] .hsr-bubble {
        max-width: min(78%, 760px) !important;
        align-self: flex-start !important;
        background: ${theme.assistantBubble} !important;
        color: ${theme.assistantBubbleText} !important;
      }

      .hsr-turn-wrap[data-message-author-role="user"] .hsr-bubble {
        max-width: min(62%, 520px) !important;
        align-self: flex-end !important;
        background: ${theme.userBubble} !important;
        color: ${theme.userBubbleText} !important;
      }

      .hsr-sticker {
        width: ${stickerWidth};
        height: auto;
        display: block;
        margin-top: 10px;
        filter: drop-shadow(0 6px 8px rgba(0,0,0,0.12));
        user-select: none;
        pointer-events: none;
        animation: hsrStickerIn .24s ease;
        transform-origin: center center;
      }

      @keyframes hsrStickerIn {
        from { opacity: 0; transform: translateY(8px) scale(0.9); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
      }

      .hsr-turn-wrap[data-message-author-role="assistant"] .hsr-sticker {
        align-self: flex-start !important;
        margin-left: 8px !important;
        margin-right: 0 !important;
      }

      .hsr-turn-wrap[data-message-author-role="user"] .hsr-sticker {
        align-self: flex-end !important;
        margin-right: 8px !important;
        margin-left: 0 !important;
      }

      .hsr-sticker.hsr-hidden {
        display: none !important;
      }

      @media (max-width: 900px) {
        #hsr-header { padding: ${isCompact() ? "9px 12px 7px 12px" : "12px 16px 9px 16px"}; }
        #hsr-title { font-size: ${isCompact() ? "17px" : "18px"}; }
        #hsr-subtitle { font-size: 11px; }
        #hsr-badge { padding: 5px 9px; }
        #hsr-badge img { width: 24px; height: 24px; }
        #hsr-badge-text { font-size: 11px; }
        #hsr-settings-btn { padding: 6px 10px; font-size: 13px; }
        #hsr-settings-panel { top: ${isCompact() ? "52px" : "58px"}; right: 8px; width: min(320px, calc(100vw - 16px)); }
      }
    `;
  }

  let styleEl = null;
  function applyCss() {
    const css = buildCss();
    if (styleEl) styleEl.remove();
    styleEl = document.createElement("style");
    styleEl.id = "hsr-dynamic-style";
    styleEl.textContent = css;
    document.head.appendChild(styleEl);
  }

  function createHeader() {
    let header = document.getElementById("hsr-header");
    if (!header) {
      header = document.createElement("div");
      header.id = "hsr-header";

      const left = document.createElement("div");
      left.id = "hsr-header-left";

      const title = document.createElement("div");
      title.id = "hsr-title";

      const subtitle = document.createElement("div");
      subtitle.id = "hsr-subtitle";

      left.appendChild(title);
      left.appendChild(subtitle);

      const right = document.createElement("div");
      right.id = "hsr-header-right";

      const badge = document.createElement("div");
      badge.id = "hsr-badge";

      const badgeImg = document.createElement("img");
      badgeImg.id = "hsr-badge-img";
      badgeImg.onerror = () => {
        if (badgeImg.dataset.fallbackApplied === "1") {
          badgeImg.style.display = "none";
          return;
        }
        badgeImg.dataset.fallbackApplied = "1";
        badgeImg.src = avatarUrl(CONFIG.assistantAvatarKey, "march7", true);
      };

      const badgeText = document.createElement("div");
      badgeText.id = "hsr-badge-text";

      badge.appendChild(badgeImg);
      badge.appendChild(badgeText);

      const settingsBtn = document.createElement("button");
      settingsBtn.id = "hsr-settings-btn";
      settingsBtn.type = "button";
      settingsBtn.textContent = "⚙";
      settingsBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleSettingsPanel();
      });

      right.appendChild(badge);
      right.appendChild(settingsBtn);

      header.appendChild(left);
      header.appendChild(right);

      document.body.prepend(header);
    }

    createSettingsPanel();
    refreshHeader();
  }

  function createSettingsPanel() {
    let panel = document.getElementById("hsr-settings-panel");
    if (panel) return;

    panel = document.createElement("div");
    panel.id = "hsr-settings-panel";

    panel.innerHTML = `
      <div class="hsr-settings-title">HSR Settings</div>

      <div class="hsr-settings-group">
        <div class="hsr-settings-label">Character Theme</div>
        <div class="hsr-settings-options" id="hsr-character-theme-options"></div>
      </div>

      <div class="hsr-settings-group">
        <div class="hsr-settings-label">Theme</div>
        <div class="hsr-settings-options" id="hsr-theme-options"></div>
      </div>

      <div class="hsr-settings-group">
        <div class="hsr-settings-label">Sticker Mode</div>
        <div class="hsr-settings-options" id="hsr-sticker-options"></div>
      </div>

      <div class="hsr-settings-group">
        <div class="hsr-settings-label">Assistant Avatar</div>
        <div class="hsr-settings-options" id="hsr-assistant-avatar-options"></div>
      </div>

      <div class="hsr-settings-group">
        <div class="hsr-settings-label">User Avatar</div>
        <div class="hsr-settings-options" id="hsr-user-avatar-options"></div>
      </div>

      <div class="hsr-settings-group">
        <div class="hsr-settings-label">Layout Mode</div>
        <div class="hsr-settings-options" id="hsr-layout-options"></div>
      </div>

      <div class="hsr-settings-group">
        <div class="hsr-settings-label">Chat Settings</div>
        <div class="hsr-settings-inputs">
          <input id="hsr-room-title" class="hsr-settings-input" type="text" maxlength="40" placeholder="Room Title">
          <input id="hsr-room-subtitle" class="hsr-settings-input" type="text" maxlength="60" placeholder="Room Subtitle">
          <input id="hsr-user-name" class="hsr-settings-input" type="text" maxlength="24" placeholder="User Name">
        </div>
        <div class="hsr-settings-hint">Changes are saved automatically.</div>
      </div>
    `;

    document.body.appendChild(panel);

    buildOptionGroup("hsr-character-theme-options", [
      ["march7", "March7"],
      ["acheron", "Acheron"],
      ["asta", "Asta"],
      ["castorice", "Castorice"],
      ["custom", "Custom"]
    ], (value) => {
      applyCharacterPreset(value);
      applyCss();
      refreshHeader();
      syncSettingsPanel();
      processMessages(true);
    });

    buildOptionGroup("hsr-theme-options", [
      ["express", "Express"],
      ["midnight", "Midnight"],
      ["silver", "Silver"],
      ["acheron", "Acheron"],
      ["asta", "Asta"],
      ["castorice", "Castorice"]
    ], (value) => {
      CONFIG.theme = value;
      CONFIG.characterThemeMode = "custom";
      saveConfig();
      applyCss();
      refreshHeader();
      syncSettingsPanel();
      processMessages(true);
    });

    buildOptionGroup("hsr-sticker-options", [
      ["emotion", "Auto"],
      ["random", "Random"],
      ["on", "On"],
      ["off", "Off"]
    ], (value) => {
      CONFIG.stickerMode = value;
      saveConfig();
      syncSettingsPanel();
      processMessages(true);
    });

    buildOptionGroup("hsr-assistant-avatar-options", [
      ["march7", "March7"],
      ["acheron", "Acheron"],
      ["asta", "Asta"],
      ["castorice", "Castorice"]
    ], (value) => {
      CONFIG.assistantAvatarKey = value;
      CONFIG.characterThemeMode = "custom";
      saveConfig();
      refreshHeader();
      syncSettingsPanel();
      processMessages(true);
    });

    buildOptionGroup("hsr-user-avatar-options", [
      ["stelle", "Stelle"],
      ["march7", "March7"],
      ["acheron", "Acheron"],
      ["asta", "Asta"],
      ["castorice", "Castorice"]
    ], (value) => {
      CONFIG.userAvatarKey = value;
      saveConfig();
      syncSettingsPanel();
      processMessages(true);
    });

    buildOptionGroup("hsr-layout-options", [
      ["default", "Default"],
      ["compact", "Compact"]
    ], (value) => {
      CONFIG.layoutMode = value;
      saveConfig();
      applyCss();
      refreshHeader();
      syncSettingsPanel();
      processMessages(true);
    });

    const titleInput = panel.querySelector("#hsr-room-title");
    const subtitleInput = panel.querySelector("#hsr-room-subtitle");
    const userNameInput = panel.querySelector("#hsr-user-name");

    titleInput.addEventListener("input", () => {
      CONFIG.headerTitle = titleInput.value || DEFAULT_CONFIG.headerTitle;
      saveConfig();
      refreshHeader();
    });

    subtitleInput.addEventListener("input", () => {
      CONFIG.headerSubtitle = subtitleInput.value || DEFAULT_CONFIG.headerSubtitle;
      saveConfig();
      refreshHeader();
    });

    userNameInput.addEventListener("input", () => {
      CONFIG.userName = userNameInput.value || DEFAULT_CONFIG.userName;
      saveConfig();
      processMessages(true);
    });

    document.addEventListener("click", (e) => {
      const btn = document.getElementById("hsr-settings-btn");
      const panelEl = document.getElementById("hsr-settings-panel");
      if (!panelEl || !btn) return;
      if (panelEl.contains(e.target) || btn.contains(e.target)) return;
      panelEl.classList.remove("open");
    });

    syncSettingsPanel();
  }

  function buildOptionGroup(id, items, onClick) {
    const wrap = document.getElementById(id);
    if (!wrap) return;

    items.forEach(([value, label]) => {
      const btn = document.createElement("button");
      btn.className = "hsr-settings-option";
      btn.type = "button";
      btn.dataset.value = value;
      btn.textContent = label;
      btn.addEventListener("click", () => onClick(value));
      wrap.appendChild(btn);
    });
  }

  function syncSettingsPanel() {
    markOptionActive("hsr-character-theme-options", CONFIG.characterThemeMode);
    markOptionActive("hsr-theme-options", CONFIG.theme);
    markOptionActive("hsr-sticker-options", CONFIG.stickerMode);
    markOptionActive("hsr-assistant-avatar-options", CONFIG.assistantAvatarKey);
    markOptionActive("hsr-user-avatar-options", CONFIG.userAvatarKey);
    markOptionActive("hsr-layout-options", CONFIG.layoutMode);

    const panel = document.getElementById("hsr-settings-panel");
    if (!panel) return;
    const titleInput = panel.querySelector("#hsr-room-title");
    const subtitleInput = panel.querySelector("#hsr-room-subtitle");
    const userNameInput = panel.querySelector("#hsr-user-name");
    if (titleInput) titleInput.value = CONFIG.headerTitle || "";
    if (subtitleInput) subtitleInput.value = CONFIG.headerSubtitle || "";
    if (userNameInput) userNameInput.value = CONFIG.userName || "";
  }

  function markOptionActive(groupId, activeValue) {
    const wrap = document.getElementById(groupId);
    if (!wrap) return;
    wrap.querySelectorAll(".hsr-settings-option").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.value === activeValue);
    });
  }

  function toggleSettingsPanel() {
    const panel = document.getElementById("hsr-settings-panel");
    if (!panel) return;
    panel.classList.toggle("open");
  }

  function refreshHeader() {
    const title = document.getElementById("hsr-title");
    const subtitle = document.getElementById("hsr-subtitle");
    const badge = document.getElementById("hsr-badge");
    const badgeImg = document.getElementById("hsr-badge-img");
    const badgeText = document.getElementById("hsr-badge-text");

    if (title) title.textContent = CONFIG.headerTitle;
    if (subtitle) subtitle.textContent = CONFIG.headerSubtitle;
    if (badge) badge.style.display = CONFIG.showHeaderBadge ? "flex" : "none";
    if (badgeImg) {
      badgeImg.style.display = "";
      badgeImg.dataset.fallbackApplied = "0";
      badgeImg.src = avatarUrl(CONFIG.assistantAvatarKey, "march7", false);
    }
    if (badgeText) badgeText.textContent = CONFIG.assistantName;
  }

  function getRoleNodes() {
    return Array.from(document.querySelectorAll('[data-message-author-role]'));
  }

  function getLastUserTextBefore(assistantNode) {
    const roleNodes = getRoleNodes();
    const idx = roleNodes.indexOf(assistantNode);
    if (idx <= 0) return "";

    for (let i = idx - 1; i >= 0; i--) {
      const node = roleNodes[i];
      if (node.getAttribute("data-message-author-role") === "user") {
        return getTurnText(node);
      }
    }
    return "";
  }

  function findBubbleTarget(roleNode) {
    const candidates = roleNode.querySelectorAll(".markdown, .prose, [class*='markdown'], [class*='prose']");
    if (candidates.length) return candidates[0];

    const divs = Array.from(roleNode.querySelectorAll("div"));
    const texty = divs.find((el) => (el.innerText || "").trim().length > 0);
    return texty || roleNode;
  }

  function getTurnText(roleNode) {
    const bubble = findBubbleTarget(roleNode);
    return (bubble?.innerText || roleNode.innerText || "").trim();
  }

  function normalizeText(s) {
    return (s || "").toLowerCase().replace(/\s+/g, " ").trim();
  }

  function scoreKeywords(text, table) {
    let score = 0;
    for (const item of table) {
      if (text.includes(item.word)) score += item.weight;
    }
    return score;
  }

  function detectMood(answerText, userText, index) {
    if (CONFIG.stickerMode === "off") return "off";
    if (CONFIG.stickerMode === "random" || CONFIG.stickerMode === "on") return "random";

    const answer = normalizeText(answerText);
    const user = normalizeText(userText);
    const combined = `${user} ${answer}`;

    const scores = { happy: 0, thinking: 0, surprise: 0, sad: 0 };

    const directCommandRules = [
      { mood: "happy", words: ["웃어봐", "웃어 봐", "웃어", "웃는 척", "기쁜 척", "행복한 척"] },
      { mood: "thinking", words: ["생각해봐", "생각해 봐", "생각해", "고민해봐", "생각하는 척", "분석해봐"] },
      { mood: "surprise", words: ["놀란척", "놀란 척", "놀라봐", "놀라 봐", "깜짝 놀란 척", "헉 해봐"] },
      { mood: "sad", words: ["슬픈척", "슬픈 척", "울어봐", "울어 봐", "슬퍼해봐", "슬퍼해 봐", "우울한 척"] }
    ];

    for (const rule of directCommandRules) {
      if (rule.words.some((w) => user.includes(w))) scores[rule.mood] += 100;
    }

    scores.happy += scoreKeywords(combined, [
      { word: "ㅎㅎ", weight: 14 }, { word: "ㅋㅋ", weight: 14 }, { word: "😄", weight: 20 },
      { word: "😊", weight: 18 }, { word: "웃", weight: 18 }, { word: "기뻐", weight: 18 },
      { word: "좋아", weight: 14 }, { word: "행복", weight: 16 }, { word: "반가", weight: 10 },
      { word: "축하", weight: 12 }, { word: "성공", weight: 10 }, { word: "완료", weight: 8 }
    ]);

    scores.thinking += scoreKeywords(combined, [
      { word: "🤔", weight: 20 }, { word: "생각", weight: 18 }, { word: "고민", weight: 16 },
      { word: "분석", weight: 14 }, { word: "정리", weight: 12 }, { word: "설명", weight: 10 },
      { word: "검토", weight: 10 }, { word: "비교", weight: 10 }, { word: "이유", weight: 8 },
      { word: "방법", weight: 8 }, { word: "요약", weight: 8 }, { word: "흠", weight: 10 },
      { word: "음", weight: 6 }
    ]);

    scores.surprise += scoreKeywords(combined, [
      { word: "😲", weight: 20 }, { word: "놀라", weight: 18 }, { word: "깜짝", weight: 18 },
      { word: "헉", weight: 20 }, { word: "어?", weight: 16 }, { word: "어!", weight: 16 },
      { word: "주의", weight: 12 }, { word: "경고", weight: 12 }, { word: "중요", weight: 8 },
      { word: "!!", weight: 10 }
    ]);

    scores.sad += scoreKeywords(combined, [
      { word: "😢", weight: 20 }, { word: "ㅠ", weight: 16 }, { word: "ㅜ", weight: 16 },
      { word: "슬프", weight: 18 }, { word: "울", weight: 16 }, { word: "흑", weight: 16 },
      { word: "아쉽", weight: 14 }, { word: "미안", weight: 12 }, { word: "죄송", weight: 12 },
      { word: "실패", weight: 10 }, { word: "안돼", weight: 10 }, { word: "불가", weight: 10 },
      { word: "어렵", weight: 10 }
    ]);

    const entries = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const topMood = entries[0][0];
    const topScore = entries[0][1];

    if (topScore <= 0) return ["happy", "thinking", "surprise", "sad"][index % 4];
    return topMood;
  }

  function stickerUrlFor(answerText, userText, index, useRaw = false) {
    const mood = detectMood(answerText, userText, index);
    if (mood === "off") return "";
    if (mood === "random") return assetUrl(pickFrom(RANDOM_STICKERS, index), useRaw);
    return assetUrl(pickFrom(STICKER_BANK[mood], index), useRaw);
  }

  function ensureWrap(roleNode) {
    if (roleNode.classList.contains("hsr-turn-wrap")) return roleNode;
    roleNode.classList.add("hsr-turn-wrap");
    return roleNode;
  }

  function ensureLabel(roleNode, role) {
    let label = roleNode.querySelector(".hsr-avatar-label");
    if (!label) {
      label = document.createElement("div");
      label.className = "hsr-avatar-label" + (role === "user" ? " hsr-user-label" : "");

      const img = document.createElement("img");
      img.className = "hsr-label-avatar";
      img.onerror = () => {
        if (img.dataset.fallbackApplied === "1") {
          img.style.display = "none";
          return;
        }
        img.dataset.fallbackApplied = "1";
        img.src = role === "user"
          ? avatarUrl(CONFIG.userAvatarKey, "stelle", true)
          : avatarUrl(CONFIG.assistantAvatarKey, "march7", true);
      };

      const text = document.createElement("div");
      text.className = "hsr-label-name";

      label.appendChild(img);
      label.appendChild(text);
      roleNode.prepend(label);
    }

    const img = label.querySelector(".hsr-label-avatar");
    const text = label.querySelector(".hsr-label-name");
    if (img) {
      img.style.display = "";
      img.dataset.fallbackApplied = "0";
      img.src = role === "user"
        ? avatarUrl(CONFIG.userAvatarKey, "stelle", false)
        : avatarUrl(CONFIG.assistantAvatarKey, "march7", false);
    }
    if (text) {
      text.textContent = role === "user" ? CONFIG.userName : CONFIG.assistantName;
    }
  }

  function ensureBubble(roleNode) {
    const bubble = findBubbleTarget(roleNode);
    if (!bubble) return;
    bubble.classList.add("hsr-bubble");
  }

  function ensureSticker(roleNode, index, forceRefresh) {
    if (roleNode.getAttribute("data-message-author-role") !== "assistant") return;

    const answerText = getTurnText(roleNode);
    const userText = getLastUserTextBefore(roleNode);

    let img = roleNode.querySelector(".hsr-sticker");
    if (!img) {
      img = document.createElement("img");
      img.className = "hsr-sticker";
      roleNode.appendChild(img);
    }

    const nextUrl = stickerUrlFor(answerText, userText, index, false);

    if (!nextUrl) {
      img.classList.add("hsr-hidden");
      return;
    }

    if (!forceRefresh && img.dataset.ready === "1" && img.dataset.srcApplied === nextUrl) return;

    img.classList.remove("hsr-hidden");
    img.dataset.fallbackApplied = "0";
    img.src = nextUrl;
    img.dataset.ready = "1";
    img.dataset.srcApplied = nextUrl;

    img.onerror = () => {
      if (img.dataset.fallbackApplied === "1") {
        img.classList.add("hsr-hidden");
        return;
      }
      img.dataset.fallbackApplied = "1";
      const rawUrl = stickerUrlFor(answerText, userText, index, true);
      if (!rawUrl) {
        img.classList.add("hsr-hidden");
        return;
      }
      img.src = rawUrl;
    };
  }

  function processMessages(forceRefresh = false) {
    const turns = getRoleNodes();

    turns.forEach((roleNode, index) => {
      const role = roleNode.getAttribute("data-message-author-role");
      if (!role) return;

      ensureWrap(roleNode);
      ensureLabel(roleNode, role);
      ensureBubble(roleNode);
      ensureSticker(roleNode, index, forceRefresh);
    });
  }

  let scheduled = false;
  function scheduleRefresh() {
    if (scheduled) return;
    scheduled = true;

    setTimeout(() => {
      try {
        createHeader();
        processMessages();
      } finally {
        scheduled = false;
      }
    }, 220);
  }

  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      const target = m.target;
      if (target && target.id === "hsr-header") return;
      if (target && target.closest && target.closest("#hsr-header")) return;
      if (target && target.id === "hsr-settings-panel") return;
      if (target && target.closest && target.closest("#hsr-settings-panel")) return;
    }
    scheduleRefresh();
  });

  applyCss();
  createHeader();
  processMessages();

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
})();
