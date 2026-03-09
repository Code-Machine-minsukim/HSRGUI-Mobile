// ==UserScript==
// @name         HSRGUI Mobile Stable 0.5.2
// @namespace    hsrgui-mobile-monolith
// @version      0.5.2
// @description  Monolithic HSRGUI mobile patch 0.5.2 (header upgrade pass, compact layout, safe upgrades)
// @match        https://chatgpt.com/*
// @match        https://chat.openai.com/*
// @run-at       document-idle
// @grant        GM_addStyle
// ==/UserScript==

(() => {
  'use strict';

  const RAW_BASE = 'https://raw.githubusercontent.com/engineer-502/HSRGUI/main/chatgpt_hsr_extension/';
  const CONFIG_KEY = 'hsrConfig';
  const DEFAULT_CONFIG = {
    enabled: true,
    scope: 'conversation-only',
    domains: 'chatgpt+chat_openai',
    fidelity: 'screenshot-high',
    splitMode: 'sentence-length-hybrid',
    splitMaxChars: 180,
    splitMaxSentences: 2,
    actorPreset: 'march7th-stelle',
    userName: '오공이',
    headerTitle: '오공열차',
    headerSubtitle: '인간개조의 용광로'
  };

  const listeners = new Set();

  function readConfig() {
    try {
      const raw = localStorage.getItem(CONFIG_KEY);
      if (!raw) return { ...DEFAULT_CONFIG };
      return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
    } catch {
      return { ...DEFAULT_CONFIG };
    }
  }

  function writeConfig(next) {
    const prev = readConfig();
    localStorage.setItem(CONFIG_KEY, JSON.stringify(next));
    const changes = {
      [CONFIG_KEY]: {
        oldValue: prev,
        newValue: next
      }
    };
    for (const fn of listeners) {
      try {
        fn(changes, 'sync');
      } catch {}
    }
  }

  const chromeShim = {
    runtime: {
      getURL(path) {
        const clean = String(path || '').replace(/^\/+/, '');
        return RAW_BASE + clean;
      }
    },
    storage: {
      sync: {
        get(key, cb) {
          const value = readConfig();
          if (typeof key === 'string') {
            cb?.({ [key]: value });
            return;
          }
          if (Array.isArray(key)) {
            const out = {};
            for (const k of key) out[k] = (k === CONFIG_KEY ? value : null);
            cb?.(out);
            return;
          }
          cb?.({ [CONFIG_KEY]: value });
        },
        set(obj, cb) {
          if (obj && Object.prototype.hasOwnProperty.call(obj, CONFIG_KEY)) {
            writeConfig(obj[CONFIG_KEY]);
          }
          cb?.();
        }
      },
      onChanged: {
        addListener(fn) {
          listeners.add(fn);
        },
        removeListener(fn) {
          listeners.delete(fn);
        }
      }
    }
  };

  if (!window.chrome) {
    window.chrome = chromeShim;
  } else {
    window.chrome.runtime = window.chrome.runtime || chromeShim.runtime;
    window.chrome.storage = window.chrome.storage || chromeShim.storage;
    window.chrome.storage.sync = window.chrome.storage.sync || chromeShim.storage.sync;
    window.chrome.storage.onChanged =
      window.chrome.storage.onChanged || chromeShim.storage.onChanged;
    if (!window.chrome.runtime.getURL) {
      window.chrome.runtime.getURL = chromeShim.runtime.getURL;
    }
  }

  if (!localStorage.getItem(CONFIG_KEY)) {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(DEFAULT_CONFIG));
  }

  let cssText = `:root {
  --hsr-bg-chat: #d7dfe5;
  --hsr-bg-friend: #ededed;
  --hsr-bg-user: #ddcaa5;
  --hsr-text-main: #121212;
  --hsr-text-muted: #666868;
  --hsr-stroke: #9ea0a1;
  --hsr-soft-line: #c3c8cd;
  --hsr-code-bg: #1b1f2a;
  --hsr-code-fg: #e6edf3;
  --hsr-code-line: #3a4150;
  --hsr-bubble-max: 70%;
  --hsr-avatar-size: 48px;
  --hsr-avatar-offset: 60px;
  --hsr-lane-pad: 20px;
  --hsr-strip-max: 980px;
  --hsr-strip-gap: 12px;
  --hsr-header-offset-x: 25px;
  --hsr-header-height: 80px;
  --hsr-header-pad-x: 26px;
  --hsr-header-line: #b8c1c9;
}

/* Hide raw assistant body during boot/pending to avoid native GPT flash. */
html.hsr-booting [data-message-author-role="assistant"] [data-message-content],
html.hsr-booting [data-message-author-role="assistant"] .markdown,
html.hsr-booting [data-message-author-role="assistant"] .prose,
html.hsr-enabled .hsr-turn.hsr-assistant.hsr-pending > :not(.hsr-role-meta):not(.hsr-stream-overlay) {
  visibility: hidden !important;
}

/* Streaming hard-lock: keep assistant body hidden until finalized render. */
html.hsr-enabled .hsr-turn.hsr-assistant.hsr-streaming > :not(.hsr-role-meta):not(.hsr-stream-overlay) {
  display: none !important;
}

html.hsr-enabled .hsr-turn.hsr-assistant.hsr-streaming [data-message-content],
html.hsr-enabled .hsr-turn.hsr-assistant.hsr-streaming .markdown,
html.hsr-enabled .hsr-turn.hsr-assistant.hsr-streaming .prose {
  visibility: hidden !important;
}

html.hsr-enabled .hsr-conversation-root {
  position: relative !important;
  isolation: isolate !important;
  background: transparent !important;
  overflow-x: clip !important;
  padding-top: var(--hsr-header-height) !important;
}

/* Center chat lane background strip (not full page). */
html.hsr-enabled .hsr-conversation-root::before {
  content: "" !important;
  position: fixed !important;
  inset: 0 auto 0 50% !important;
  transform: translateX(-50%) !important;
  width: min(var(--hsr-strip-max), calc(100vw - (var(--hsr-strip-gap) * 2))) !important;
  background: var(--hsr-bg-chat) !important;
  border-radius: 24px 24px 0 0 !important;
  pointer-events: none !important;
  z-index: 0 !important;
}

html.hsr-enabled .hsr-conversation-root > * {
  position: relative !important;
  z-index: 1 !important;
}

html.hsr-enabled .hsr-fixed-header {
  position: fixed !important;
  top: 0 !important;
  left: calc(50% + var(--hsr-header-offset-x)) !important;
  transform: translateX(-50%) !important;
  width: min(var(--hsr-strip-max), calc(100vw - (var(--hsr-strip-gap) * 2))) !important;
  margin: 0 !important;
  min-height: var(--hsr-header-height) !important;
  padding: 14px 32px 12px !important;
  display: flex !important;
  flex-direction: column !important;
  justify-content: flex-end !important;
  align-items: flex-start !important;
  background: var(--hsr-bg-chat) !important;
  border-radius: 24px 24px 0 0 !important;
  border-bottom: 1px solid var(--hsr-header-line) !important;
  box-shadow: inset 0 -1px 0 var(--hsr-header-line) !important;
  z-index: 4 !important;
  pointer-events: none !important;
  box-sizing: border-box !important;
  overflow: hidden !important;
}

html.hsr-enabled .hsr-fixed-header-title {
  margin: 0 !important;
  width: 100% !important;
  font-size: 32px !important;
  line-height: 1.02 !important;
  font-weight: 800 !important;
  letter-spacing: -0.045em !important;
  color: #131517 !important;
  text-align: left !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}

html.hsr-enabled .hsr-fixed-header-subtitle {
  margin: 4px 0 0 !important;
  width: 100% !important;
  font-size: 12px !important;
  line-height: 1.2 !important;
  font-weight: 700 !important;
  color: #6e7680 !important;
  text-align: left !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}

html.hsr-enabled .hsr-turn {
  position: relative !important;
  max-width: min(920px, 95vw) !important;
  margin: 0 auto 16px !important;
  padding: 8px var(--hsr-lane-pad) !important;
}

html.hsr-enabled .hsr-turn.hsr-assistant {
  padding-left: var(--hsr-lane-pad) !important;
}

html.hsr-enabled .hsr-turn.hsr-user {
  padding-right: var(--hsr-lane-pad) !important;
}

html.hsr-enabled .hsr-role-meta {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  width: fit-content !important;
  max-width: 100% !important;
  margin-bottom: 6px !important;
}

html.hsr-enabled .hsr-assistant .hsr-role-meta,
html.hsr-enabled .hsr-role-meta[data-role="assistant"] {
  margin-right: auto !important;
  justify-content: flex-start !important;
}

html.hsr-enabled .hsr-user .hsr-role-meta,
html.hsr-enabled .hsr-role-meta[data-role="user"] {
  position: absolute !important;
  right: var(--hsr-lane-pad) !important;
  top: 6px !important;
  z-index: 2 !important;
  margin: 0 !important;
  margin-left: auto !important;
  justify-content: flex-end !important;
  flex-direction: row-reverse !important;
  align-items: flex-start !important;
}

html.hsr-enabled .hsr-role-avatar {
  width: var(--hsr-avatar-size) !important;
  height: var(--hsr-avatar-size) !important;
  border-radius: 50% !important;
  border: 3px solid #3c373d !important;
  object-fit: cover !important;
  background: #3c373d !important;
  flex: 0 0 auto !important;
}

html.hsr-enabled .hsr-role-name {
  font-size: 17px !important;
  line-height: 1.1 !important;
  font-weight: 700 !important;
  color: var(--hsr-text-muted) !important;
}

html.hsr-enabled .hsr-user .hsr-role-name {
  margin-right: 6px !important;
  margin-top: -1px !important;
  text-align: right !important;
}

html.hsr-enabled .hsr-message-container {
  display: flex !important;
  flex-direction: column !important;
  gap: 8px !important;
  width: auto !important;
  max-width: 100% !important;
}

html.hsr-enabled .hsr-assistant .hsr-message-container {
  align-items: flex-start !important;
  margin-left: 0 !important;
}

html.hsr-enabled .hsr-user .hsr-message-container {
  align-items: flex-end !important;
  margin-right: calc(var(--hsr-avatar-size) + 16px) !important;
  margin-left: auto !important;
  margin-top: 18px !important;
}

html.hsr-enabled .hsr-message-container,
html.hsr-enabled .hsr-message-container p,
html.hsr-enabled .hsr-message-container li,
html.hsr-enabled .hsr-message-container h1,
html.hsr-enabled .hsr-message-container h2,
html.hsr-enabled .hsr-message-container h3,
html.hsr-enabled .hsr-message-container h4,
html.hsr-enabled .hsr-message-container h5,
html.hsr-enabled .hsr-message-container h6,
html.hsr-enabled .hsr-message-container strong,
html.hsr-enabled .hsr-message-container b,
html.hsr-enabled .hsr-message-container em,
html.hsr-enabled .hsr-message-container i,
html.hsr-enabled .hsr-message-container u,
html.hsr-enabled .hsr-message-container s,
html.hsr-enabled .hsr-message-container small {
  color: var(--hsr-text-main) !important;
}

html.hsr-enabled .hsr-assistant .hsr-message-container:not(:has(.hsr-block-wrap)) {
  width: fit-content !important;
  max-width: var(--hsr-bubble-max) !important;
  background: var(--hsr-bg-friend) !important;
  border-radius: 2px 20px 20px 20px !important;
  box-shadow: -1px 2px var(--hsr-stroke) !important;
  border: 1px solid rgba(0, 0, 0, 0.03) !important;
  padding: 10px 14px !important;
}

/* If synthetic shells are direct children, keep container transparent
   so only one visual bubble layer is rendered. */
html.hsr-enabled .hsr-assistant .hsr-message-container:has(> .hsr-split-shell),
html.hsr-enabled .hsr-assistant .hsr-message-container:has(> .hsr-image-group) {
  background: transparent !important;
  border: 0 !important;
  box-shadow: none !important;
  padding: 0 !important;
  border-radius: 0 !important;
}

html.hsr-enabled .hsr-user .hsr-message-container:not(:has(.hsr-block-wrap)) {
  width: fit-content !important;
  max-width: var(--hsr-bubble-max) !important;
  background: var(--hsr-bg-user) !important;
  border-radius: 20px 2px 20px 20px !important;
  box-shadow: 1px 2px var(--hsr-stroke) !important;
  border: 1px solid rgba(0, 0, 0, 0.03) !important;
  padding: 10px 14px !important;
}

html.hsr-enabled .hsr-user .hsr-message-container:has([class*="user-message-bubble-color"]) {
  background: transparent !important;
  border: 0 !important;
  box-shadow: none !important;
  padding: 0 !important;
  border-radius: 0 !important;
}

html.hsr-enabled .hsr-block-wrap {
  width: fit-content !important;
  max-width: var(--hsr-bubble-max) !important;
  background: var(--hsr-bg-friend) !important;
  border-radius: 2px 20px 20px 20px !important;
  box-shadow: -1px 2px var(--hsr-stroke) !important;
  border: 1px solid rgba(0, 0, 0, 0.03) !important;
  padding: 10px 14px !important;
  margin-left: 0 !important;
}

html.hsr-enabled .hsr-user .hsr-block-wrap {
  background: var(--hsr-bg-user) !important;
  border-radius: 20px 2px 20px 20px !important;
  box-shadow: 1px 2px var(--hsr-stroke) !important;
}

/* Flatten wrapper when generated UI components already draw their own shell.
   Prevents "box inside box" artifacts for split bubbles/image groups. */
html.hsr-enabled .hsr-block-wrap:has(> .hsr-split-shell),
html.hsr-enabled .hsr-block-wrap:has(> .hsr-image-group),
html.hsr-enabled .hsr-block-wrap:has(> .hsr-stream-preview) {
  background: transparent !important;
  border: 0 !important;
  box-shadow: none !important;
  padding: 0 !important;
  border-radius: 0 !important;
}

/* Keep GPT native user bubble structure and recolor only. */
html.hsr-enabled .hsr-user .hsr-block-wrap:has([class*="user-message-bubble-color"]) {
  background: transparent !important;
  border: 0 !important;
  box-shadow: none !important;
  padding: 0 !important;
  border-radius: 0 !important;
}

html.hsr-enabled .hsr-user .hsr-message-container [class*="user-message-bubble-color"] {
  background: var(--hsr-bg-user) !important;
  color: var(--hsr-text-main) !important;
  border: 1px solid rgba(0, 0, 0, 0.03) !important;
  box-shadow: 1px 2px var(--hsr-stroke) !important;
  border-radius: 20px 2px 20px 20px !important;
}

html.hsr-enabled .hsr-user .hsr-message-container [class*="user-message-bubble-color"] * {
  color: var(--hsr-text-main) !important;
}

/* Exact fix for native GPT user bubble structure:
   .user-message-bubble-color > .whitespace-pre-wrap.hsr-message-container */
html.hsr-enabled .hsr-user .user-message-bubble-color {
  background: var(--hsr-bg-user) !important;
  color: var(--hsr-text-main) !important;
  border: 1px solid rgba(0, 0, 0, 0.03) !important;
  box-shadow: 1px 2px var(--hsr-stroke) !important;
  border-radius: 20px 2px 20px 20px !important;
}

html.hsr-enabled .hsr-user .user-message-bubble-color > .whitespace-pre-wrap.hsr-message-container {
  display: block !important;
  width: auto !important;
  max-width: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
  gap: 0 !important;
  align-items: initial !important;
  background: transparent !important;
  border: 0 !important;
  box-shadow: none !important;
  border-radius: 0 !important;
  color: var(--hsr-text-main) !important;
  white-space: pre-wrap !important;
  overflow-wrap: anywhere !important;
  word-break: keep-all !important;
}

html.hsr-enabled .hsr-user .user-message-bubble-color > .whitespace-pre-wrap.hsr-message-container * {
  color: var(--hsr-text-main) !important;
}

html.hsr-enabled .hsr-block-wrap,
html.hsr-enabled .hsr-block-wrap p,
html.hsr-enabled .hsr-block-wrap li,
html.hsr-enabled .hsr-block-wrap h1,
html.hsr-enabled .hsr-block-wrap h2,
html.hsr-enabled .hsr-block-wrap h3,
html.hsr-enabled .hsr-block-wrap h4,
html.hsr-enabled .hsr-block-wrap h5,
html.hsr-enabled .hsr-block-wrap h6,
html.hsr-enabled .hsr-block-wrap strong,
html.hsr-enabled .hsr-block-wrap b,
html.hsr-enabled .hsr-block-wrap em,
html.hsr-enabled .hsr-block-wrap i,
html.hsr-enabled .hsr-block-wrap u,
html.hsr-enabled .hsr-block-wrap s,
html.hsr-enabled .hsr-block-wrap small {
  color: var(--hsr-text-main) !important;
}

html.hsr-enabled .hsr-message-container mark,
html.hsr-enabled .hsr-block-wrap mark {
  color: #1e1f22 !important;
  background: #f0db8c !important;
  padding: 0 3px !important;
  border-radius: 4px !important;
}

html.hsr-enabled .hsr-block-wrap > * {
  margin: 0 !important;
}

html.hsr-enabled .hsr-block-wrap + .hsr-block-wrap {
  margin-top: 6px !important;
}

html.hsr-enabled .hsr-block-code-block,
html.hsr-enabled .hsr-block-table,
html.hsr-enabled .hsr-block-image,
html.hsr-enabled .hsr-block-file-attachment,
html.hsr-enabled .hsr-block-widget {
  max-width: var(--hsr-bubble-max) !important;
  width: var(--hsr-bubble-max) !important;
  background: #f6f6f6 !important;
  border-radius: 10px !important;
  border: 1px solid var(--hsr-soft-line) !important;
}

html.hsr-enabled .hsr-block-image {
  padding: 10px !important;
  min-width: 280px !important;
  border-radius: 2px 20px 20px 20px !important;
  box-shadow: -1px 2px var(--hsr-stroke) !important;
  overflow: hidden !important;
}

html.hsr-enabled .hsr-user .hsr-block-image {
  border-radius: 20px 2px 20px 20px !important;
  box-shadow: 1px 2px var(--hsr-stroke) !important;
}

html.hsr-enabled .hsr-image-group {
  display: grid !important;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)) !important;
  gap: 8px !important;
  width: var(--hsr-bubble-max) !important;
  max-width: var(--hsr-bubble-max) !important;
  background: #f6f6f6 !important;
  border: 1px solid var(--hsr-soft-line) !important;
  border-radius: 2px 20px 20px 20px !important;
  box-shadow: -1px 2px var(--hsr-stroke) !important;
  padding: 10px !important;
  overflow: hidden !important;
}

html.hsr-enabled .hsr-user .hsr-image-group {
  border-radius: 20px 2px 20px 20px !important;
  box-shadow: 1px 2px var(--hsr-stroke) !important;
}

html.hsr-enabled .hsr-image-group > .hsr-block-wrap {
  width: auto !important;
  max-width: none !important;
  min-width: 0 !important;
  background: transparent !important;
  border: 0 !important;
  box-shadow: none !important;
  border-radius: 10px !important;
  padding: 0 !important;
  margin: 0 !important;
}

html.hsr-enabled .hsr-image-group > .hsr-block-wrap + .hsr-block-wrap {
  margin-top: 0 !important;
}

html.hsr-enabled .hsr-image-group .hsr-image {
  width: 100% !important;
  max-width: 100% !important;
  height: auto !important;
  border-radius: 10px !important;
}

html.hsr-enabled .hsr-block-image > * {
  width: 100% !important;
  max-width: 100% !important;
}

html.hsr-enabled .hsr-block-image .hsr-image,
html.hsr-enabled .hsr-image-group .hsr-image {
  width: 100% !important;
  aspect-ratio: 16 / 10 !important;
  object-fit: cover !important;
  background: #cfd5db !important;
}

/* Fallback: 이미지 블록이 hsr-block-image로 래핑되지 않은 경우 */
html.hsr-enabled .hsr-assistant .hsr-message-container
  > :is(div,figure,picture):not(.hsr-block-wrap):not(.hsr-random-sticker):has(img):not(:has(pre,table,ul,ol,blockquote,code,h1,h2,h3,h4,h5,h6)) {
  max-width: var(--hsr-bubble-max) !important;
  width: var(--hsr-bubble-max) !important;
  min-width: 280px !important;
  background: #f6f6f6 !important;
  border: 1px solid var(--hsr-soft-line) !important;
  border-radius: 2px 20px 20px 20px !important;
  box-shadow: -1px 2px var(--hsr-stroke) !important;
  padding: 10px !important;
  overflow: hidden !important;
}

html.hsr-enabled .hsr-user .hsr-message-container
  > :is(div,figure,picture):not(.hsr-block-wrap):not(.hsr-random-sticker):has(img):not(:has(pre,table,ul,ol,blockquote,code,h1,h2,h3,h4,h5,h6)) {
  max-width: var(--hsr-bubble-max) !important;
  width: var(--hsr-bubble-max) !important;
  min-width: 280px !important;
  background: #f6f6f6 !important;
  border: 1px solid var(--hsr-soft-line) !important;
  border-radius: 20px 2px 20px 20px !important;
  box-shadow: 1px 2px var(--hsr-stroke) !important;
  padding: 10px !important;
  overflow: hidden !important;
}

html.hsr-enabled .hsr-code-pre {
  margin: 0 !important;
  background: var(--hsr-code-bg) !important;
  color: var(--hsr-code-fg) !important;
  border: 1px solid var(--hsr-code-line) !important;
  border-radius: 8px !important;
  padding: 12px !important;
  overflow: auto !important;
}

html.hsr-enabled .hsr-code-block {
  color: var(--hsr-code-fg) !important;
}

html.hsr-enabled .hsr-block-code-block,
html.hsr-enabled .hsr-block-code-block :is(div,span,button,strong,b,em,i,code,a) {
  color: var(--hsr-code-fg) !important;
}

html.hsr-enabled .hsr-block-code-block svg {
  color: var(--hsr-code-fg) !important;
  stroke: currentColor !important;
}

html.hsr-enabled .hsr-message-container pre.hsr-code-pre,
html.hsr-enabled .hsr-message-container pre.hsr-code-pre *,
html.hsr-enabled .hsr-block-wrap pre.hsr-code-pre,
html.hsr-enabled .hsr-block-wrap pre.hsr-code-pre * {
  color: var(--hsr-code-fg) !important;
}

html.hsr-enabled .hsr-message-container pre.hsr-code-pre [style*="color"],
html.hsr-enabled .hsr-block-wrap pre.hsr-code-pre [style*="color"] {
  color: var(--hsr-code-fg) !important;
}

html.hsr-enabled .hsr-inline-code {
  background: rgba(60, 55, 61, 0.12) !important;
  border-radius: 4px !important;
  padding: 1px 5px !important;
  color: #23262b !important;
}

html.hsr-enabled .hsr-table {
  width: 100% !important;
  border-collapse: collapse !important;
}

html.hsr-enabled .hsr-table th,
html.hsr-enabled .hsr-table td {
  border: 1px solid #bfc4c8 !important;
  padding: 8px 10px !important;
  color: var(--hsr-text-main) !important;
}

html.hsr-enabled .hsr-table thead th {
  background: #dde1e4 !important;
}

html.hsr-enabled .hsr-quote {
  margin: 0 !important;
  border-left: 4px solid var(--hsr-stroke) !important;
  padding-left: 10px !important;
  color: #4f5358 !important;
}

html.hsr-enabled .hsr-link {
  color: #2f5fd0 !important;
  text-decoration: underline !important;
}

/* Hide source/citation UI and source-chip links in image responses. */
html.hsr-enabled .hsr-hide-source-link,
html.hsr-enabled [data-testid*="citation"],
html.hsr-enabled [data-testid*="source"],
html.hsr-enabled [data-testid*="reference"],
html.hsr-enabled button[aria-label*="Source"],
html.hsr-enabled button[aria-label*="출처"],
html.hsr-enabled a[aria-label*="Source"],
html.hsr-enabled a[aria-label*="출처"] {
  display: none !important;
}

html.hsr-enabled .hsr-image {
  display: block !important;
  max-width: 100% !important;
  border-radius: 10px !important;
}

html.hsr-enabled .hsr-original-paragraph {
  display: none !important;
}

html.hsr-enabled .hsr-stream-overlay {
  display: flex !important;
  flex-direction: column !important;
  gap: 8px !important;
  width: 100% !important;
  max-width: 100% !important;
  margin-top: 6px !important;
}

html.hsr-enabled .hsr-assistant > .hsr-stream-overlay {
  align-items: flex-start !important;
  padding-left: calc(var(--hsr-avatar-size) + 14px) !important;
}

html.hsr-enabled .hsr-user > .hsr-stream-overlay {
  align-items: flex-end !important;
  padding-right: calc(var(--hsr-avatar-size) + 16px) !important;
  margin-top: 18px !important;
}

html.hsr-enabled .hsr-stream-preview {
  display: flex !important;
  flex-direction: column !important;
  gap: 8px !important;
  width: fit-content !important;
  max-width: var(--hsr-bubble-max) !important;
}

html.hsr-enabled .hsr-stream-bubble {
  margin: 0 !important;
}

.hsr-typing-shell,
.hsr-seq-loader {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: fit-content;
  max-width: var(--hsr-bubble-max);
  padding: 10px 14px;
  background: var(--hsr-bg-friend);
  border-radius: 2px 20px 20px 20px;
  box-shadow: -1px 2px var(--hsr-stroke);
  border: 1px solid rgba(0, 0, 0, 0.03);
  font-size: 0;
  line-height: 0;
}

.hsr-typing-dot,
.hsr-seq-dot {
  display: inline-block;
  flex: 0 0 9px;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #17181b;
  border: 0;
  opacity: 0.35;
  animation: hsr-dot-pulse 1s ease-in-out infinite;
}

.hsr-typing-dot:nth-child(2),
.hsr-seq-dot:nth-child(2) {
  animation-delay: 0.16s;
}

.hsr-typing-dot:nth-child(3),
.hsr-seq-dot:nth-child(3) {
  animation-delay: 0.32s;
}

html.hsr-enabled .hsr-sentence-bubble.hsr-seq-hidden {
  display: none !important;
}

html.hsr-enabled .hsr-sentence-bubble.hsr-seq-visible {
  display: block !important;
  animation: hsr-bubble-enter 0.22s ease-out both;
}

html.hsr-enabled .hsr-final-enter {
  animation: hsr-final-enter 0.17s ease-out both !important;
  will-change: opacity, transform;
}

html.hsr-enabled .hsr-final-seq-hidden {
  display: none !important;
}

@keyframes hsr-dot-pulse {
  0%,
  100% {
    opacity: 0.28;
    transform: translateY(0);
  }
  50% {
    opacity: 1;
    transform: translateY(-1px);
  }
}

@keyframes hsr-bubble-enter {
  from {
    opacity: 0;
    transform: translateY(7px) scale(0.985);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes hsr-final-enter {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hsr-split-shell {
  display: none;
}

html.hsr-enabled .hsr-split-shell {
  display: flex !important;
  flex-direction: column !important;
  gap: 8px !important;
}

html.hsr-enabled .hsr-sentence-bubble {
  margin: 0 !important;
  padding: 10px 14px !important;
  max-width: var(--hsr-bubble-max) !important;
  background: var(--hsr-bg-friend) !important;
  border-radius: 2px 20px 20px 20px !important;
  box-shadow: -1px 2px var(--hsr-stroke) !important;
  color: var(--hsr-text-main) !important;
  line-height: 1.58 !important;
  white-space: pre-wrap !important;
  overflow-wrap: anywhere !important;
  word-break: keep-all !important;
}

html.hsr-enabled .hsr-user .hsr-sentence-bubble {
  background: var(--hsr-bg-user) !important;
  border-radius: 20px 2px 20px 20px !important;
  box-shadow: 1px 2px var(--hsr-stroke) !important;
}

html.hsr-enabled .hsr-random-sticker {
  margin-top: 8px !important;
  background: transparent !important;
  border: 0 !important;
  box-shadow: none !important;
  padding: 0 !important;
  border-radius: 0 !important;
  overflow: visible !important;
}

html.hsr-enabled .hsr-user .hsr-random-sticker {
  align-self: flex-end !important;
}

html.hsr-enabled .hsr-sticker-img {
  width: 132px !important;
  height: 132px !important;
  object-fit: contain !important;
}

@media (max-width: 920px) {
:root {
    --hsr-avatar-size: 42px;
    --hsr-avatar-offset: 52px;
    --hsr-bubble-max: 78%;
    --hsr-lane-pad: 14px;
    --hsr-strip-gap: 0px;
    --hsr-header-offset-x: 0px;
    --hsr-header-height: 84px;
    --hsr-header-pad-x: 16px;
  }

  html.hsr-enabled .hsr-fixed-header {
    padding: 10px 14px 8px !important;
  }

  html.hsr-enabled .hsr-fixed-header-title {
    font-size: 26px !important;
  }

  html.hsr-enabled .hsr-fixed-header-subtitle {
    margin-top: 2px !important;
    font-size: 10px !important;
  }

  html.hsr-enabled .hsr-role-name {
    font-size: 15px !important;
  }

  html.hsr-enabled .hsr-user .hsr-role-meta,
  html.hsr-enabled .hsr-role-meta[data-role="user"] {
    right: var(--hsr-lane-pad) !important;
    top: 4px !important;
  }

  html.hsr-enabled .hsr-user .hsr-message-container {
    margin-top: 16px !important;
  }
}

@media (max-width: 640px) {
  html.hsr-enabled .hsr-fixed-header {
    padding: 8px 12px 7px !important;
    min-height: 74px !important;
    border-radius: 16px 16px 0 0 !important;
  }

  html.hsr-enabled .hsr-fixed-header-title {
    font-size: 23px !important;
    line-height: 1 !important;
  }

  html.hsr-enabled .hsr-fixed-header-subtitle {
    font-size: 9px !important;
  }
}
`;

  cssText = cssText.replace(
    /url\((['"]?)(assets\/[^'")]+)\1\)/g,
    (_, q, rel) => `url(${q}${RAW_BASE}${rel}${q})`
  );
  cssText = cssText.replace(
    /url\((['"]?)(preview\/[^'")]+)\1\)/g,
    (_, q, rel) => `url(${q}${RAW_BASE}${rel}${q})`
  );

  cssText += `
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

    main [data-message-author-role="assistant"],
    main [data-message-author-role="assistant"] *,
    main [data-message-author-role="user"],
    main [data-message-author-role="user"] * {
      visibility: visible !important;
      opacity: 1 !important;
    }

    body {
      overflow-x: hidden !important;
    }
  `;

  GM_addStyle(cssText);

GM_addStyle(`
/* ===== 0.5.2 header upgrade ===== */
html.hsr-enabled {
  --hsr-header-height: 96px !important;
  --hsr-header-pad-x: 24px !important;
  --hsr-header-line: rgba(132, 145, 160, 0.42) !important;
}

html.hsr-enabled .hsr-fixed-header {
  min-height: var(--hsr-header-height) !important;
  padding: 16px 26px 14px !important;
  background:
    linear-gradient(180deg, rgba(248,250,253,0.98) 0%, rgba(236,241,247,0.98) 100%) !important;
  border-radius: 28px 28px 0 0 !important;
  border-bottom: 1px solid var(--hsr-header-line) !important;
  box-shadow:
    0 10px 28px rgba(83, 95, 111, 0.08),
    inset 0 -1px 0 rgba(132,145,160,0.28) !important;
  backdrop-filter: blur(12px) !important;
}

html.hsr-enabled .hsr-fixed-header-title {
  font-size: 30px !important;
  line-height: 1.02 !important;
  font-weight: 900 !important;
  letter-spacing: -0.05em !important;
  color: #111418 !important;
  text-shadow: 0 1px 0 rgba(255,255,255,0.65) !important;
}

html.hsr-enabled .hsr-fixed-header-subtitle {
  margin-top: 6px !important;
  font-size: 12px !important;
  line-height: 1.2 !important;
  font-weight: 800 !important;
  letter-spacing: -0.015em !important;
  color: #6f7684 !important;
}

@media (max-width: 768px) {
  html.hsr-enabled {
    --hsr-header-height: 88px !important;
  }

  html.hsr-enabled .hsr-fixed-header {
    padding: 14px 20px 12px !important;
    border-radius: 22px 22px 0 0 !important;
  }

  html.hsr-enabled .hsr-fixed-header-title {
    font-size: 24px !important;
    letter-spacing: -0.04em !important;
  }

  html.hsr-enabled .hsr-fixed-header-subtitle {
    margin-top: 4px !important;
    font-size: 11px !important;
  }

  html.hsr-enabled .hsr-conversation-root {
    padding-top: calc(var(--hsr-header-height) + 10px) !important;
  }
}
`);


(() => {
  const ROLE_NODE_SELECTOR = "[data-message-author-role]";
  const SEMANTIC_BLOCK_SELECTOR =
    "p,pre,table,ul,ol,blockquote,h1,h2,h3,h4,h5,h6,hr,figure";

  function uniqueNodes(nodes) {
    const set = new Set();
    const result = [];
    for (const node of nodes) {
      if (!node || set.has(node)) {
        continue;
      }
      set.add(node);
      result.push(node);
    }
    return result;
  }

  function findRoleNodes(root = document) {
    return Array.from(root.querySelectorAll(ROLE_NODE_SELECTOR));
  }

  function resolveTurnNode(roleNode) {
    return (
      roleNode.closest('article[data-testid^="conversation-turn-"]') ||
      roleNode.closest('[data-testid*="conversation-turn"]') ||
      roleNode.closest("article") ||
      roleNode.closest('[data-testid^="conversation-turn-"]') ||
      roleNode.closest(".group.w-full") ||
      roleNode
    );
  }

  function findTurnNodes(root = document) {
    const roleNodes = findRoleNodes(root);
    const turns = roleNodes.map(resolveTurnNode).filter(Boolean);
    return uniqueNodes(turns);
  }

  function getRole(turnNode) {
    if (!turnNode || !(turnNode instanceof Element)) {
      return "unknown";
    }

    const direct = turnNode.getAttribute("data-message-author-role");
    if (direct) {
      return normalizeRole(direct);
    }

    const roleNode = turnNode.querySelector(ROLE_NODE_SELECTOR);
    if (!roleNode) {
      return "unknown";
    }

    return normalizeRole(roleNode.getAttribute("data-message-author-role") || "unknown");
  }

  function normalizeRole(role) {
    const value = String(role || "").toLowerCase();
    if (value === "assistant" || value === "user") {
      return value;
    }
    return "unknown";
  }

  function isStreaming(turnNode) {
    if (!turnNode || !(turnNode instanceof Element)) {
      return false;
    }

    const checks = [
      '[data-is-streaming="true"]',
      ".result-streaming",
      '[data-testid*="stop-button"]',
      'button[aria-label*="Stop"]',
      'button[aria-label*="중지"]'
    ];

    for (const selector of checks) {
      if (turnNode.matches(selector) || turnNode.querySelector(selector)) {
        return true;
      }
    }

    // Fallback: ChatGPT stop button can be rendered outside a specific turn.
    for (const selector of checks.slice(2)) {
      if (document.querySelector(selector)) {
        return true;
      }
    }

    return false;
  }

  function scoreCandidate(node) {
    const textLen = (node.innerText || "").trim().length;
    const children = node.children ? node.children.length : 0;
    const tag = node.tagName ? node.tagName.toLowerCase() : "";
    const semanticCount = node.querySelectorAll(SEMANTIC_BLOCK_SELECTOR).length;

    let bonus = 0;
    if (tag === "div" || tag === "section" || tag === "article") {
      bonus += 100;
    }
    if (tag === "p" || tag === "span") {
      bonus -= 40;
    }
    if (textLen > 5000) {
      bonus -= 1500;
    }

    return textLen + semanticCount * 32 + Math.min(children, 20) * 6 + bonus;
  }

  function pickLargestByText(nodes) {
    if (!nodes.length) {
      return null;
    }

    nodes.sort((a, b) => scoreCandidate(b) - scoreCandidate(a));
    return nodes[0] || null;
  }

  function getPrimaryContentRoot(turnNode, role = "unknown") {
    if (!turnNode || !(turnNode instanceof Element)) {
      return null;
    }

    const roleNode = turnNode.matches(ROLE_NODE_SELECTOR)
      ? turnNode
      : turnNode.querySelector(ROLE_NODE_SELECTOR);

    const rootForSearch = roleNode || turnNode;
    const roleSelectors =
      role === "assistant"
        ? [
            '[data-message-content]',
            '[data-testid*="message-content"]',
            ".markdown",
            '[class*="markdown"]',
            ".prose",
            '[class*="prose"]',
            '[class*="text-message"]'
          ]
        : ['[class*="whitespace-pre-wrap"]', "p", '[dir="auto"]', "span"];

    const fallbackSelectors = [
      '[data-message-content]',
      '[data-testid*="message-content"]',
      ".markdown",
      '[class*="markdown"]',
      ".prose",
      '[class*="prose"]',
      '[class*="whitespace-pre-wrap"]',
      '[class*="text-message"]',
      '[dir="auto"]'
    ];

    const candidates = Array.from(
      rootForSearch.querySelectorAll([...new Set([...roleSelectors, ...fallbackSelectors])].join(","))
    ).filter((node) => {
      const text = (node.innerText || "").trim();
      if (!text) {
        return false;
      }
      if (node.querySelector("textarea,input,form")) {
        return false;
      }
      if (node.querySelector('[data-message-author-role]')) {
        return false;
      }
      return true;
    });

    const top = pickLargestByText(candidates);
    if (top) {
      return top;
    }

    if (!roleNode) {
      return turnNode;
    }

    const leafCandidates = Array.from(roleNode.querySelectorAll("div,p,span")).filter(
      (el) => (el.textContent || "").trim().length > 0
    );

    return pickLargestByText(leafCandidates) || roleNode;
  }

  function getDirectRenderableBlocks(contentRoot) {
    if (!contentRoot || !(contentRoot instanceof Element)) {
      return [];
    }

    const children = Array.from(contentRoot.children).filter(
      (el) =>
        !el.classList.contains("hsr-role-meta") &&
        !el.classList.contains("hsr-random-sticker") &&
        !el.classList.contains("hsr-image-group") &&
        !el.classList.contains("hsr-typing-shell") &&
        !el.classList.contains("hsr-seq-loader")
    );

    const blocks = [];
    for (const child of children) {
      if (child.classList.contains("hsr-block-wrap")) {
        const inner = child.firstElementChild;
        if (inner) {
          blocks.push(inner);
        }
        continue;
      }
      blocks.push(child);
    }

    return blocks;
  }

  function isTopLevelSemantic(element, contentRoot) {
    if (!element || !contentRoot) {
      return false;
    }

    let current = element.parentElement;
    while (current && current !== contentRoot) {
      if (current.matches(SEMANTIC_BLOCK_SELECTOR)) {
        return false;
      }
      current = current.parentElement;
    }

    return true;
  }

  function findFallbackTextBlock(contentRoot) {
    const nodes = Array.from(contentRoot.querySelectorAll("p,div,span")).filter((el) => {
      const text = (el.textContent || "").trim();
      if (!text) {
        return false;
      }
      if (
        el.closest(
          ".hsr-block-wrap, .hsr-role-meta, .hsr-random-sticker, .hsr-typing-shell, .hsr-seq-loader"
        )
      ) {
        return false;
      }
      if (el.querySelector("pre,table,ul,ol,blockquote,img,video,svg,button,input,textarea")) {
        return false;
      }
      return true;
    });

    return pickLargestByText(nodes);
  }

  function getRenderableBlocks(contentRoot) {
    if (!contentRoot || !(contentRoot instanceof Element)) {
      return [];
    }

    const semantic = Array.from(contentRoot.querySelectorAll(SEMANTIC_BLOCK_SELECTOR)).filter(
      (el) =>
        isTopLevelSemantic(el, contentRoot) &&
        !el.closest(
          ".hsr-block-wrap, .hsr-role-meta, .hsr-random-sticker, .hsr-typing-shell, .hsr-seq-loader"
        )
    );

    if (semantic.length) {
      return semantic;
    }

    const direct = getDirectRenderableBlocks(contentRoot);
    if (direct.length) {
      return direct;
    }

    const fallback = findFallbackTextBlock(contentRoot);
    return fallback ? [fallback] : [];
  }

  function detectBlockKind(block) {
    if (!block || !(block instanceof Element)) {
      return "unknown";
    }

    const tag = block.tagName.toLowerCase();

    if (/^h[1-6]$/.test(tag)) {
      return "heading";
    }
    if (tag === "ul" || tag === "ol") {
      return "list";
    }
    if (tag === "blockquote") {
      return "blockquote";
    }
    if (tag === "hr") {
      return "hr";
    }
    if (tag === "pre" || block.querySelector("pre > code")) {
      return "code-block";
    }
    if (tag === "code") {
      return "inline-code";
    }
    if (tag === "table" || block.querySelector("table")) {
      return "table";
    }
    if (isImageBlock(block)) {
      return "image";
    }
    if (isAttachmentNode(block)) {
      return "file-attachment";
    }
    if (isWidgetNode(block)) {
      return "widget";
    }
    if (tag === "p" || tag === "div" || tag === "span") {
      return "paragraph";
    }

    return "unknown";
  }

  function isImageBlock(block) {
    if (!block || !(block instanceof Element)) {
      return false;
    }

    const tag = block.tagName.toLowerCase();
    if (["img", "figure", "picture"].includes(tag)) {
      return true;
    }

    const images = Array.from(block.querySelectorAll("img"));
    if (!images.length) {
      return false;
    }

    // Multiple images are almost always an image/gallery block.
    if (images.length >= 2) {
      return true;
    }

    // Keep non-image rich content out.
    if (block.querySelector("pre,table,ul,ol,blockquote")) {
      return false;
    }

    const textNodes = Array.from(block.childNodes).filter((node) => node.nodeType === Node.TEXT_NODE);
    const directText = textNodes.map((node) => String(node.textContent || "")).join(" ").trim();
    const paragraphLikeText = Array.from(block.querySelectorAll("p,li")).reduce(
      (sum, el) => sum + String(el.textContent || "").trim().length,
      0
    );

    // If there is real paragraph/list text, treat as paragraph block.
    if (paragraphLikeText >= 80 || directText.length >= 80) {
      return false;
    }

    // Single image + short badges/captions should still be handled as image.
    return true;
  }

  function isAttachmentNode(block) {
    const link = block.matches("a") ? block : block.querySelector("a[href]");
    if (!link) {
      return false;
    }

    const href = link.getAttribute("href") || "";
    const download = link.hasAttribute("download");
    return download || /\/files?\//i.test(href) || /attachment/i.test(href);
  }

  function isWidgetNode(block) {
    return Boolean(
      block.matches('[data-testid*="widget"]') ||
        block.matches('[class*="widget"]') ||
        block.querySelector('[data-testid*="widget"]')
    );
  }

  function isParagraphCandidate(block) {
    if (!block || !(block instanceof Element)) {
      return false;
    }

    const tag = block.tagName.toLowerCase();
    if (tag === "p") {
      return true;
    }

    if (tag !== "div" && tag !== "span") {
      return false;
    }

    const text = (block.textContent || "").trim();
    if (!text) {
      return false;
    }

    const banned = block.querySelector(
      "pre,table,ul,ol,blockquote,img,video,svg,button,details,summary"
    );
    return !banned;
  }

  function hasInlineFormatting(block) {
    if (!block || !(block instanceof Element)) {
      return false;
    }

    return Boolean(
      block.querySelector("a,strong,em,b,i,code,kbd,mark,sup,sub,math,mjx-container")
    );
  }

  window.HSRSelectors = {
    findTurnNodes,
    getRole,
    isStreaming,
    getPrimaryContentRoot,
    getDirectRenderableBlocks,
    getRenderableBlocks,
    detectBlockKind,
    isParagraphCandidate,
    hasInlineFormatting
  };
})();


(() => {
  function segmentSentences(text) {
    const raw = String(text || "").replace(/\r/g, "").trim();
    if (!raw) {
      return [];
    }

    if (typeof Intl !== "undefined" && typeof Intl.Segmenter === "function") {
      try {
        const segmenter = new Intl.Segmenter("ko", { granularity: "sentence" });
        const parts = [];
        for (const part of segmenter.segment(raw)) {
          const value = String(part.segment || "").trim();
          if (value) {
            parts.push(value);
          }
        }
        if (parts.length) {
          return parts;
        }
      } catch (error) {
        // Fallback below.
      }
    }

    const regexParts = raw.match(/[^.!?\n]+[.!?]?|[^\n]+/g);
    if (!regexParts) {
      return [raw];
    }

    return regexParts
      .map((part) => part.trim())
      .filter(Boolean);
  }

  function splitByLength(text, maxChars) {
    const source = String(text || "").trim();
    if (!source) {
      return [];
    }
    if (source.length <= maxChars) {
      return [source];
    }

    const output = [];
    let remaining = source;

    while (remaining.length > maxChars) {
      let cut = remaining.lastIndexOf(" ", maxChars);
      if (cut < Math.floor(maxChars * 0.55)) {
        cut = maxChars;
      }
      output.push(remaining.slice(0, cut).trim());
      remaining = remaining.slice(cut).trim();
    }

    if (remaining) {
      output.push(remaining);
    }

    return output;
  }

  function chunkSentences(sentences, maxChars, maxSentences) {
    const normalized = [];
    for (const sentence of sentences) {
      const chunks = splitByLength(sentence, maxChars);
      for (const chunk of chunks) {
        normalized.push(chunk);
      }
    }

    const result = [];
    let bucket = [];
    let bucketLength = 0;

    for (const sentence of normalized) {
      const nextLength = bucketLength + (bucketLength ? 1 : 0) + sentence.length;
      const overSentenceLimit = bucket.length >= maxSentences;
      const overLengthLimit = nextLength > maxChars;

      if (bucket.length && (overSentenceLimit || overLengthLimit)) {
        result.push(bucket.join(" ").trim());
        bucket = [sentence];
        bucketLength = sentence.length;
        continue;
      }

      bucket.push(sentence);
      bucketLength = nextLength;
    }

    if (bucket.length) {
      result.push(bucket.join(" ").trim());
    }

    return result.filter(Boolean);
  }

  function isEmojiOnlyChunk(text) {
    const source = String(text || "").replace(/\s+/g, "");
    if (!source) {
      return false;
    }

    try {
      return /^[\p{Extended_Pictographic}\p{Emoji_Presentation}\p{Emoji}\uFE0F\u200D]+$/u.test(
        source
      );
    } catch (error) {
      // Fallback for environments without Unicode property escapes.
      return source.length <= 3;
    }
  }

  function mergeEmojiTailChunks(chunks, maxChars) {
    const merged = [];

    for (const rawChunk of chunks) {
      const chunk = String(rawChunk || "").trim();
      if (!chunk) {
        continue;
      }

      if (isEmojiOnlyChunk(chunk) && merged.length) {
        const lastIndex = merged.length - 1;
        const joined = `${merged[lastIndex]} ${chunk}`.trim();
        // Even if length exceeds slightly, prefer natural UX over isolated emoji bubble.
        if (joined.length <= maxChars + 12) {
          merged[lastIndex] = joined;
          continue;
        }
      }

      merged.push(chunk);
    }

    return merged;
  }

  function splitText(text, options = {}) {
    const maxChars = Number(options.maxChars || 140);
    const maxSentences = Number(options.maxSentences || 2);

    const source = String(text || "").replace(/\s+/g, " ").trim();
    if (!source) {
      return [];
    }

    const sentences = segmentSentences(source);
    if (!sentences.length) {
      return [source];
    }

    if (sentences.length <= maxSentences && source.length <= maxChars) {
      return [source];
    }

    const chunks = chunkSentences(sentences, maxChars, maxSentences);
    return mergeEmojiTailChunks(chunks, maxChars);
  }

  function isPlainParagraph(node) {
    if (!node || !(node instanceof HTMLElement)) {
      return false;
    }

    const tag = node.tagName.toLowerCase();
    if (tag !== "p" && tag !== "div") {
      return false;
    }

    const text = (node.textContent || "").trim();
    if (!text) {
      return false;
    }

    const banned = node.querySelector(
      "a,strong,em,b,i,code,pre,table,ul,ol,blockquote,img,video,svg,button,details,summary,kbd,mark,sup,sub,math,mjx-container"
    );
    if (banned) {
      return false;
    }

    const nonBreakChildren = Array.from(node.children).filter(
      (child) => child.tagName.toLowerCase() !== "br"
    );

    return nonBreakChildren.length === 0;
  }

  window.HSRSplitter = {
    segmentSentences,
    splitText,
    isPlainParagraph
  };
})();


(() => {
  const PRESET_STICKER_PACKS = {
    "march7th-stelle": Array.from({ length: 16 }, (_, index) => `sticker_${index + 1}.png`),
    "acheron-stelle": ["sticker_193.png", "sticker_194.png", "sticker_195.png", "sticker_196.png"],
    "castorice-stelle": [
      "sticker_330.png",
      "sticker_336.png",
      "sticker_337.png",
      "sticker_338.png",
      "sticker_339.png",
      "sticker_340.png",
      "sticker_425.png"
    ]
  };

  const DEFAULT_STICKERS = PRESET_STICKER_PACKS["march7th-stelle"].slice();
  const DEFAULT_STICKER_SET = new Set(
    Object.values(PRESET_STICKER_PACKS)
      .flat()
      .map((name) => name.toLowerCase())
  );

  function normalizeStickerPack(input, fallbackPack = DEFAULT_STICKERS) {
    const fallback =
      Array.isArray(fallbackPack) && fallbackPack.length ? fallbackPack.slice() : DEFAULT_STICKERS.slice();

    if (!Array.isArray(input) || !input.length) {
      return fallback;
    }

    const sanitized = input
      .map((value) => String(value || "").trim())
      .filter((value) => DEFAULT_STICKER_SET.has(value.toLowerCase()));

    return sanitized.length ? sanitized : fallback;
  }

  function shouldInjectSticker(params) {
    const safe = params && typeof params === "object" ? params : {};
    const enabled = Boolean(safe.enabled);
    const rate = Number(safe.rate || 0);
    const cooldown = Number(safe.cooldown || 0);
    const currentTurn = Number(safe.currentTurn || 0);
    const lastTurn = Number(safe.lastTurn || -9999);

    if (!enabled) {
      return false;
    }
    if (currentTurn - lastTurn <= cooldown) {
      return false;
    }
    return Math.random() < rate;
  }

  function pickSticker(stickerPack) {
    const pool = normalizeStickerPack(stickerPack);
    const index = Math.floor(Math.random() * pool.length);
    return pool[index];
  }

  function stickerRuntimeUrl(fileName) {
    return chrome.runtime.getURL("assets/stickers/" + fileName);
  }

  window.HSRStickers = {
    PRESET_STICKER_PACKS,
    DEFAULT_STICKERS,
    normalizeStickerPack,
    shouldInjectSticker,
    pickSticker,
    stickerRuntimeUrl
  };
})();


(() => {
  if (!window.HSRSelectors || !window.HSRSplitter || !window.HSRStickers) {
    return;
  }

  document.documentElement.classList.add("hsr-booting");

  const CONFIG_KEY = "hsrConfig";
  const RENDER_VERSION = "hsr-render-v10-streaming-final-only";
  const STREAM_STABLE_MS = 1400;
  const STREAM_FALLBACK_FINALIZE_MS = 12000;
  const FIXED_HEADER_ID = "hsr-fixed-header";
  const DEFAULT_HEADER_TITLE = "오공열차";
  const DEFAULT_HEADER_SUBTITLE = "인간개조의 용광로";
  const LEGACY_HEADER_TITLES = new Set(["오공열차"]);
  const LEGACY_HEADER_SUBTITLES = new Set(["인간개조의 용광로", "인간개조의 용광로"]);
  const LEGACY_USER_NAMES = new Set(["Stelle", "stelle"]);
  const DEFAULT_ACTOR_PRESET = "march7th-stelle";
  const PRESET_STICKER_PACKS = window.HSRStickers.PRESET_STICKER_PACKS || {};
  const ACTOR_PRESETS = {
    "march7th-stelle": {
      assistantName: "March.7th",
      assistantIcon: "assets/icons/March_7th.png",
      userIcon: "assets/icons/stelle.png",
      stickerPack: PRESET_STICKER_PACKS["march7th-stelle"]
    },
    "acheron-stelle": {
      assistantName: "아케론",
      assistantIcon: "assets/icons/Acheron.png",
      userIcon: "assets/icons/stelle.png",
      stickerPack: PRESET_STICKER_PACKS["acheron-stelle"]
    },
    "castorice-stelle": {
      assistantName: "카스토리스",
      assistantIcon: "assets/icons/Castorice.png",
      userIcon: "assets/icons/stelle.png",
      stickerPack: PRESET_STICKER_PACKS["castorice-stelle"]
    },
    "asta-stelle": {
      assistantName: "아스타",
      assistantIcon: "assets/icons/asta.png",
      userIcon: "assets/icons/stelle.png",
      stickerPack: window.HSRStickers.DEFAULT_STICKERS.slice(0, 8)
    }
  };
  const DEFAULT_CONFIG = {
    enabled: true,
    scope: "conversation-only",
    domains: "chatgpt+chat_openai",
    fidelity: "screenshot-high",
    splitMode: "sentence-length-hybrid",
    splitMaxChars: 180,
    splitMaxSentences: 2,
    stickerPack: (ACTOR_PRESETS[DEFAULT_ACTOR_PRESET].stickerPack || window.HSRStickers.DEFAULT_STICKERS).slice(),
    actorPreset: DEFAULT_ACTOR_PRESET,
    userName: "오공이",
    headerTitle: DEFAULT_HEADER_TITLE,
    headerSubtitle: DEFAULT_HEADER_SUBTITLE
  };

  const state = {
    config: { ...DEFAULT_CONFIG },
    observer: null,
    processTimer: null,
    assistantTurnCounter: 0,
    liveAssistantFinalizedCount: 0,
    turnMeta: new WeakMap(),
    revealTimers: new WeakMap(),
    streamHiddenRoots: new WeakMap(),
    streamMeta: new WeakMap()
  };

  function normalizeActorPreset(value) {
    const preset = String(value || "").trim();
    if (preset === "random") {
      const pool = Object.keys(ACTOR_PRESETS);
      return pool[Math.floor(Math.random() * pool.length)] || DEFAULT_ACTOR_PRESET;
    }
    if (Object.prototype.hasOwnProperty.call(ACTOR_PRESETS, preset)) {
      return preset;
    }
    return DEFAULT_ACTOR_PRESET;
  }

  function getPresetStickerPack(actorPreset) {
    const preset = ACTOR_PRESETS[normalizeActorPreset(actorPreset)];
    const pack = preset && Array.isArray(preset.stickerPack) ? preset.stickerPack : null;
    if (pack && pack.length) {
      return pack.slice();
    }
    return window.HSRStickers.DEFAULT_STICKERS.slice();
  }

  function mergeConfig(raw) {
    const source = raw && typeof raw === "object" ? raw : {};
    const merged = { ...DEFAULT_CONFIG, ...source };

    merged.enabled = Boolean(merged.enabled);
    merged.scope = "conversation-only";
    merged.domains = "chatgpt+chat_openai";
    merged.fidelity = "screenshot-high";
    merged.splitMode = "sentence-length-hybrid";
    merged.splitMaxChars = clampNumber(merged.splitMaxChars, 160, 320, 180);
    merged.splitMaxSentences = 2;
    merged.actorPreset = normalizeActorPreset(merged.actorPreset);
    merged.stickerPack = window.HSRStickers.normalizeStickerPack(
      merged.stickerPack,
      getPresetStickerPack(merged.actorPreset)
    );
    merged.userName = String(merged.userName || "").trim().slice(0, 24) || "오공이";
    merged.headerTitle =
      String(merged.headerTitle || "").trim().slice(0, 24) || DEFAULT_HEADER_TITLE;
    merged.headerSubtitle =
      String(merged.headerSubtitle || "").trim().slice(0, 36) || DEFAULT_HEADER_SUBTITLE;

    if (LEGACY_USER_NAMES.has(merged.userName)) {
      merged.userName = "오공이";
    }
    if (LEGACY_HEADER_TITLES.has(merged.headerTitle)) {
      merged.headerTitle = DEFAULT_HEADER_TITLE;
    }
    if (LEGACY_HEADER_SUBTITLES.has(merged.headerSubtitle)) {
      merged.headerSubtitle = DEFAULT_HEADER_SUBTITLE;
    }

    return merged;
  }

  function needsPersist(raw, merged) {
    if (!raw || typeof raw !== "object") {
      return true;
    }
    return Object.keys(merged).some((key) => {
      return JSON.stringify(raw[key]) !== JSON.stringify(merged[key]);
    });
  }

  function clampNumber(value, min, max, fallback) {
    const number = Number(value);
    if (Number.isNaN(number)) {
      return fallback;
    }
    return Math.min(max, Math.max(min, number));
  }

  function getConfigFromStorage() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(CONFIG_KEY, (result) => {
        resolve(result[CONFIG_KEY] || null);
      });
    });
  }

  function setConfigToStorage(config) {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ [CONFIG_KEY]: config }, resolve);
    });
  }

  function hashString(input) {
    let hash = 5381;
    for (let i = 0; i < input.length; i += 1) {
      hash = (hash * 33) ^ input.charCodeAt(i);
    }
    return (hash >>> 0).toString(16);
  }

  function computeContentHash(contentRoot) {
    const parts = [];
    const walker = document.createTreeWalker(contentRoot, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.parentElement) {
          return NodeFilter.FILTER_REJECT;
        }
        if (
          node.parentElement.closest(
            ".hsr-role-meta, .hsr-random-sticker, .hsr-split-shell"
          )
        ) {
          return NodeFilter.FILTER_REJECT;
        }
        const value = String(node.nodeValue || "").trim();
        if (!value) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    while (walker.nextNode()) {
      parts.push(String(walker.currentNode.nodeValue || "").trim());
    }

    const text = parts.join(" ").replace(/\s+/g, " ").trim();
    const mediaCount = contentRoot.querySelectorAll("img,pre,table").length;
    return hashString(`${RENDER_VERSION}|${text}|${mediaCount}`);
  }

  function resolveActors() {
    const preset = ACTOR_PRESETS[normalizeActorPreset(state.config.actorPreset)];
    const userName = String(state.config.userName || "").trim().slice(0, 24) || "오공이";
    return {
      assistantName: preset.assistantName,
      assistantIcon: chrome.runtime.getURL(preset.assistantIcon),
      userName,
      userIcon: chrome.runtime.getURL(preset.userIcon)
    };
  }

  function ensureFixedHeader() {
    let header = document.getElementById(FIXED_HEADER_ID);
    if (!header) {
      header = document.createElement("section");
      header.id = FIXED_HEADER_ID;
      header.className = "hsr-fixed-header";
      header.setAttribute("aria-hidden", "true");

      const title = document.createElement("h1");
      title.className = "hsr-fixed-header-title";

      const subtitle = document.createElement("p");
      subtitle.className = "hsr-fixed-header-subtitle";

      header.appendChild(title);
      header.appendChild(subtitle);
      document.body.appendChild(header);
    }

    if (header.parentElement !== document.body) {
      document.body.appendChild(header);
    }

    const titleEl = header.querySelector(".hsr-fixed-header-title");
    const subtitleEl = header.querySelector(".hsr-fixed-header-subtitle");
    if (titleEl) {
      titleEl.textContent = state.config.headerTitle;
    }
    if (subtitleEl) {
      subtitleEl.textContent = state.config.headerSubtitle;
    }
  }

  function removeFixedHeader() {
    const header = document.getElementById(FIXED_HEADER_ID);
    if (header) {
      header.remove();
    }
  }

  function ensureRoleMeta(turnNode, role, contentRoot) {
    let meta = turnNode.querySelector(":scope > .hsr-role-meta");

    if (!meta) {
      meta = document.createElement("div");
      meta.className = "hsr-role-meta";

      const avatar = document.createElement("img");
      avatar.className = "hsr-role-avatar";
      avatar.alt = "";

      const name = document.createElement("span");
      name.className = "hsr-role-name";

      meta.appendChild(avatar);
      meta.appendChild(name);
      turnNode.prepend(meta);
    }

    const actors = resolveActors();
    const avatarEl = meta.querySelector(".hsr-role-avatar");
    const nameEl = meta.querySelector(".hsr-role-name");

    if (role === "assistant") {
      avatarEl.src = actors.assistantIcon;
      nameEl.textContent = actors.assistantName;
    } else {
      avatarEl.src = actors.userIcon;
      nameEl.textContent = actors.userName;
    }

    meta.dataset.role = role;
  }

  function ensureBlockWrap(block, kind) {
    if (!block || !block.parentElement) {
      return null;
    }

    let wrapper = block.parentElement;

    if (!wrapper.classList.contains("hsr-block-wrap")) {
      wrapper = document.createElement("div");
      wrapper.className = "hsr-block-wrap";
      block.before(wrapper);
      wrapper.appendChild(block);
    }

    wrapper.classList.add(`hsr-block-${kind}`);
    return wrapper;
  }

  function hasVisibleText(value) {
    return Boolean(String(value || "").replace(/[\s\u200b\u200c\u200d\u2060\ufeff]/g, ""));
  }

  function isSkippableEmptyBlock(block, kind) {
    if (!block || !(block instanceof HTMLElement)) {
      return true;
    }

    // Divider blocks tend to collapse into tiny empty bubbles in the HSR shell.
    if (kind === "hr") {
      return true;
    }

    const text = block.innerText || block.textContent || "";
    if (hasVisibleText(text)) {
      return false;
    }

    const hasRichContent = Boolean(
      block.querySelector(
        "img,video,picture,svg,pre,table,ul,ol,blockquote,math,mjx-container,iframe,button,a[href],input,textarea"
      )
    );

    return !hasRichContent;
  }

  function isLikelyImageSourceLink(linkNode) {
    if (!linkNode || !(linkNode instanceof HTMLAnchorElement)) {
      return false;
    }

    const text = String(linkNode.textContent || "").replace(/\s+/g, " ").trim();
    const href = String(linkNode.getAttribute("href") || "").trim();
    if (!href) {
      return false;
    }

    const lower = `${text} ${href}`.toLowerCase();
    if (
      /(unsplash|pexels|pixabay|wikimedia|wikipedia|fandom|tvtropes|stockphoto|imagecarousel|source)/.test(
        lower
      )
    ) {
      return true;
    }

    const compact = text.replace(/\s+/g, "");
    if (compact && compact.length <= 24 && !compact.includes("/") && !compact.includes("@")) {
      return true;
    }

    return false;
  }

  function pruneEmptyBubbles(contentRoot) {
    if (!contentRoot || !(contentRoot instanceof HTMLElement)) {
      return;
    }

    const wrappers = Array.from(contentRoot.querySelectorAll(":scope > .hsr-block-wrap"));
    for (const wrapper of wrappers) {
      if (!(wrapper instanceof HTMLElement)) {
        continue;
      }

      const block = wrapper.firstElementChild;
      if (!(block instanceof HTMLElement)) {
        wrapper.remove();
        continue;
      }

      const kindClass = Array.from(wrapper.classList).find((cls) => cls.startsWith("hsr-block-")) || "";
      const kind = kindClass.replace("hsr-block-", "");

      if (isSkippableEmptyBlock(block, kind)) {
        wrapper.remove();
      }
    }

    const shells = Array.from(contentRoot.querySelectorAll(":scope > .hsr-split-shell"));
    for (const shell of shells) {
      if (!(shell instanceof HTMLElement)) {
        continue;
      }

      const bubbles = Array.from(shell.querySelectorAll(":scope > .hsr-sentence-bubble"));
      for (const bubble of bubbles) {
        if (!hasVisibleText(bubble.textContent || "")) {
          bubble.remove();
        }
      }

      if (!shell.querySelector(":scope > .hsr-sentence-bubble")) {
        shell.remove();
      }
    }
  }

  function upsertSplitShell(block) {
    const text = String(block.textContent || "").replace(/\s+/g, " ").trim();
    const chunks = window.HSRSplitter.splitText(text, {
      maxChars: state.config.splitMaxChars,
      maxSentences: state.config.splitMaxSentences
    });

    const hasShell =
      block.nextElementSibling &&
      block.nextElementSibling.classList &&
      block.nextElementSibling.classList.contains("hsr-split-shell");

    let shell = hasShell ? block.nextElementSibling : null;

    if (chunks.length <= 1) {
      if (shell) {
        shell.remove();
      }
      block.classList.remove("hsr-original-paragraph");
      return;
    }

    if (!shell) {
      shell = document.createElement("div");
      shell.className = "hsr-split-shell";
      block.after(shell);
    }

    shell.textContent = "";

    for (const chunk of chunks) {
      const p = document.createElement("p");
      p.className = "hsr-sentence-bubble";
      p.textContent = chunk;
      shell.appendChild(p);
    }

    block.classList.add("hsr-original-paragraph");
  }

  function setAssistantStreamingState(turnNode, contentRoot, streaming) {
    if (!turnNode || !contentRoot) {
      return;
    }

    turnNode.classList.toggle("hsr-streaming", Boolean(streaming));

    let overlay = turnNode.querySelector(":scope > .hsr-stream-overlay");

    if (streaming) {
      for (const child of Array.from(turnNode.children)) {
        if (!(child instanceof HTMLElement)) {
          continue;
        }
        if (
          child.classList.contains("hsr-role-meta") ||
          child.classList.contains("hsr-stream-overlay")
        ) {
          continue;
        }
        if (!child.hasAttribute("data-hsr-stream-original-display")) {
          child.setAttribute("data-hsr-stream-original-display", child.style.display || "");
        }
        child.setAttribute("data-hsr-stream-hidden", "1");
        child.style.display = "none";
      }

      if (!contentRoot.hasAttribute("data-hsr-original-display")) {
        contentRoot.setAttribute("data-hsr-original-display", contentRoot.style.display || "");
      }
      contentRoot.style.display = "none";

      if (!overlay) {
        overlay = document.createElement("div");
        overlay.className = "hsr-stream-overlay";
        const metaNode = turnNode.querySelector(":scope > .hsr-role-meta");
        if (metaNode && metaNode.nextSibling) {
          turnNode.insertBefore(overlay, metaNode.nextSibling);
        } else {
          turnNode.appendChild(overlay);
        }
      }

      if (!overlay.querySelector(":scope > .hsr-typing-shell")) {
        overlay.appendChild(createDotLoader("hsr-typing-shell", "hsr-typing-dot"));
      }

      state.streamHiddenRoots.set(turnNode, contentRoot);
      return;
    }

    for (const child of Array.from(turnNode.children)) {
      if (!(child instanceof HTMLElement)) {
        continue;
      }
      if (child.getAttribute("data-hsr-stream-hidden") !== "1") {
        continue;
      }
      const original = child.getAttribute("data-hsr-stream-original-display");
      child.style.display = original || "";
      child.removeAttribute("data-hsr-stream-hidden");
      child.removeAttribute("data-hsr-stream-original-display");
    }

    const originalDisplay = contentRoot.getAttribute("data-hsr-original-display");
    contentRoot.style.display = originalDisplay || "";
    contentRoot.removeAttribute("data-hsr-original-display");

    if (overlay) {
      overlay.remove();
    }
    contentRoot.querySelectorAll(".hsr-typing-shell").forEach((node) => node.remove());
    contentRoot.querySelectorAll(".hsr-seq-loader").forEach((node) => node.remove());
    state.streamHiddenRoots.delete(turnNode);
  }

  function hasAssistantFinalActions(turnNode) {
    if (!turnNode || !(turnNode instanceof HTMLElement)) {
      return false;
    }

    const selectors = [
      '[data-testid*="copy-turn"]',
      '[data-testid*="conversation-turn-feedback"]',
      '[data-testid*="message-actions"]',
      'button[aria-label*="Copy"]',
      'button[aria-label*="복사"]',
      'button[aria-label*="Good response"]',
      'button[aria-label*="Bad response"]',
      'button[aria-label*="좋아요"]',
      'button[aria-label*="싫어요"]'
    ];

    return selectors.some((selector) => Boolean(turnNode.querySelector(selector)));
  }

  function createDotLoader(shellClass, dotClass) {
    const shell = document.createElement("div");
    shell.className = shellClass;
    shell.setAttribute("aria-hidden", "true");

    for (let i = 0; i < 3; i += 1) {
      const dot = document.createElement("span");
      dot.className = dotClass;
      shell.appendChild(dot);
    }

    return shell;
  }

  function collectVisibleAssistantBubbleNodes(contentRoot) {
    if (!contentRoot || !(contentRoot instanceof HTMLElement)) {
      return [];
    }

    const nodes = [];
    const children = Array.from(contentRoot.children);

    for (const child of children) {
      if (!(child instanceof HTMLElement)) {
        continue;
      }
      if (
        child.classList.contains("hsr-role-meta") ||
        child.classList.contains("hsr-random-sticker") ||
        child.classList.contains("hsr-stream-overlay")
      ) {
        continue;
      }

      if (child.classList.contains("hsr-split-shell")) {
        const bubbles = Array.from(child.querySelectorAll(":scope > .hsr-sentence-bubble"));
        for (const bubble of bubbles) {
          if (bubble instanceof HTMLElement && hasVisibleText(bubble.textContent || "")) {
            nodes.push(bubble);
          }
        }
        continue;
      }

      if (child.classList.contains("hsr-block-wrap")) {
        if (child.classList.contains("hsr-block-hr")) {
          continue;
        }

        const inner = child.firstElementChild;
        if (inner instanceof HTMLElement && inner.classList.contains("hsr-original-paragraph")) {
          continue;
        }

        nodes.push(child);
        continue;
      }

      if (hasVisibleText(child.textContent || "") || child.querySelector("img,pre,table,ul,ol,blockquote")) {
        nodes.push(child);
      }
    }

    return nodes;
  }

  function startFinalCascadeAnimation(contentRoot, processedHash) {
    if (!contentRoot || !(contentRoot instanceof HTMLElement)) {
      return 0;
    }
    if (!processedHash) {
      return 0;
    }
    if (contentRoot.dataset.hsrFinalAnimHash === processedHash) {
      return 0;
    }

    const targets = collectVisibleAssistantBubbleNodes(contentRoot);
    if (!targets.length) {
      contentRoot.dataset.hsrFinalAnimHash = processedHash;
      return 0;
    }

    const step = 30;
    const duration = 20;

    clearShellTimers(contentRoot);

    for (const node of targets) {
      node.classList.remove("hsr-final-enter");
      node.classList.add("hsr-final-seq-hidden");
    }

    let lastDelay = 0;
    for (let i = 0; i < targets.length; i += 1) {
      const node = targets[i];
      const showDelay = i * step;
      lastDelay = showDelay;
      queueShellTimer(
        contentRoot,
        () => {
          node.classList.remove("hsr-final-seq-hidden");
          node.classList.remove("hsr-final-enter");
          // Force class re-apply.
          void node.offsetWidth;
          node.classList.add("hsr-final-enter");
        },
        showDelay
      );
    }

    contentRoot.dataset.hsrFinalAnimHash = processedHash;
    return lastDelay + duration;
  }

  function extractStreamingText(contentRoot) {
    if (!contentRoot || !(contentRoot instanceof HTMLElement)) {
      return "";
    }

    const parts = [];
    const walker = document.createTreeWalker(contentRoot, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.parentElement) {
          return NodeFilter.FILTER_REJECT;
        }

        if (
          node.parentElement.closest(
            ".hsr-role-meta, .hsr-random-sticker, .hsr-split-shell, pre, code, table"
          )
        ) {
          return NodeFilter.FILTER_REJECT;
        }

        const value = String(node.nodeValue || "").trim();
        if (!value) {
          return NodeFilter.FILTER_REJECT;
        }

        return NodeFilter.FILTER_ACCEPT;
      }
    });

    while (walker.nextNode()) {
      parts.push(String(walker.currentNode.nodeValue || "").trim());
    }

    return parts.join(" ").replace(/\s+/g, " ").trim();
  }

  function isSentenceTerminalText(text) {
    return /[.!?…。！？]["')\]}'"`]*\s*$/.test(String(text || ""));
  }

  function getStreamingVisibleChunks(text) {
    const source = String(text || "").replace(/\s+/g, " ").trim();
    if (!source) {
      return [];
    }

    const chunks = window.HSRSplitter.splitText(source, {
      maxChars: state.config.splitMaxChars,
      maxSentences: state.config.splitMaxSentences
    });

    if (!chunks.length) {
      return [];
    }

    if (isSentenceTerminalText(source)) {
      return chunks;
    }

    if (chunks.length === 1) {
      return source.length >= state.config.splitMaxChars ? chunks : [];
    }

    const minChunkChars = Math.max(90, Math.floor(state.config.splitMaxChars * 0.72));
    const visible = chunks.slice(0, -1);

    while (visible.length > 0 && visible[visible.length - 1].length < minChunkChars) {
      visible.pop();
    }

    return visible;
  }

  function updateStreamingOverlayPreview(turnNode, contentRoot) {
    if (!turnNode || !contentRoot) {
      return;
    }

    const overlay = turnNode.querySelector(":scope > .hsr-stream-overlay");
    if (!overlay) {
      return;
    }

    let loader = overlay.querySelector(":scope > .hsr-typing-shell");
    if (!loader) {
      loader = createDotLoader("hsr-typing-shell", "hsr-typing-dot");
      overlay.appendChild(loader);
    }

    let preview = overlay.querySelector(":scope > .hsr-stream-preview");
    if (!preview) {
      preview = document.createElement("div");
      preview.className = "hsr-stream-preview";
      overlay.insertBefore(preview, loader);
    }

    const text = extractStreamingText(contentRoot);
    const chunks = getStreamingVisibleChunks(text).filter((chunk) => hasVisibleText(chunk));

    const rendered = Array.from(preview.querySelectorAll(":scope > .hsr-sentence-bubble"));

    const common = Math.min(rendered.length, chunks.length);
    for (let i = 0; i < common; i += 1) {
      if (rendered[i].textContent !== chunks[i]) {
        rendered[i].textContent = chunks[i];
      }
    }

    if (rendered.length > chunks.length) {
      for (let i = rendered.length - 1; i >= chunks.length; i -= 1) {
        rendered[i].remove();
      }
    } else if (chunks.length > rendered.length) {
      for (let i = rendered.length; i < chunks.length; i += 1) {
        const bubble = document.createElement("p");
        bubble.className = "hsr-sentence-bubble hsr-stream-bubble hsr-seq-visible";
        bubble.textContent = chunks[i];
        preview.appendChild(bubble);
      }
    }

    if (chunks.length > 0) {
      turnNode.dataset.hsrStreamPreviewUsed = "1";
    }
  }

  function getShellTimerList(shell) {
    const list = state.revealTimers.get(shell) || [];
    state.revealTimers.set(shell, list);
    return list;
  }

  function queueShellTimer(shell, callback, delay) {
    const timer = window.setTimeout(callback, delay);
    const list = getShellTimerList(shell);
    list.push(timer);
    return timer;
  }

  function clearShellTimers(shell) {
    const list = state.revealTimers.get(shell);
    if (!list || !list.length) {
      return;
    }
    for (const timer of list) {
      clearTimeout(timer);
    }
    state.revealTimers.set(shell, []);
  }

  function revealSplitShellSequential(shell, processedHash, startDelay = 0) {
    if (!shell || !(shell instanceof HTMLElement)) {
      return 0;
    }

    if (shell.dataset.hsrRevealHash === processedHash) {
      return 0;
    }

    const bubbles = Array.from(
      shell.querySelectorAll(":scope > .hsr-sentence-bubble")
    ).filter((node) => node instanceof HTMLElement);

    if (!bubbles.length) {
      shell.dataset.hsrRevealHash = processedHash;
      return 0;
    }

    clearShellTimers(shell);
    shell.querySelectorAll(":scope > .hsr-seq-loader").forEach((node) => node.remove());

    const runId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    shell.dataset.hsrRevealRun = runId;

    for (const bubble of bubbles) {
      bubble.classList.remove("hsr-seq-visible");
      bubble.classList.add("hsr-seq-hidden");
    }

    const loader = createDotLoader("hsr-seq-loader", "hsr-seq-dot");
    shell.appendChild(loader);

    let index = 0;

    const revealNext = () => {
      if (shell.dataset.hsrRevealRun !== runId) {
        return;
      }

      if (index >= bubbles.length) {
        loader.remove();
        shell.dataset.hsrRevealHash = processedHash;
        clearShellTimers(shell);
        return;
      }

      queueShellTimer(
        shell,
        () => {
          if (shell.dataset.hsrRevealRun !== runId) {
            return;
          }

          const bubble = bubbles[index];
          bubble.classList.remove("hsr-seq-hidden");
          bubble.classList.add("hsr-seq-visible");
          index += 1;

          if (index >= bubbles.length) {
            queueShellTimer(
              shell,
              () => {
                if (shell.dataset.hsrRevealRun !== runId) {
                  return;
                }
                loader.remove();
                shell.dataset.hsrRevealHash = processedHash;
                clearShellTimers(shell);
              },
              90
            );
            return;
          }

          queueShellTimer(shell, revealNext, 140);
        },
        320
      );
    };

    if (startDelay > 0) {
      queueShellTimer(shell, revealNext, startDelay);
    } else {
      revealNext();
    }

    return bubbles.length * 320 + (bubbles.length - 1) * 140 + 90;
  }

  function startAssistantSequentialReveal(contentRoot, processedHash) {
    if (!contentRoot || !(contentRoot instanceof HTMLElement)) {
      return 0;
    }

    const shells = Array.from(contentRoot.querySelectorAll(".hsr-split-shell")).filter(
      (node) => node instanceof HTMLElement
    );

    if (!shells.length) {
      return 0;
    }

    let queueOffset = 0;
    for (const shell of shells) {
      const duration = revealSplitShellSequential(shell, processedHash, queueOffset);
      if (duration > 0) {
        queueOffset += duration + 120;
      }
    }

    return queueOffset > 0 ? queueOffset - 120 : 0;
  }

  function decorateBlocks(contentRoot, role, streaming) {
    const blocks = window.HSRSelectors.getRenderableBlocks(contentRoot);

    for (const block of blocks) {
      if (!(block instanceof HTMLElement)) {
        continue;
      }
      if (
        block.classList.contains("hsr-image-group") ||
        block.classList.contains("hsr-role-meta") ||
        block.classList.contains("hsr-random-sticker") ||
        block.classList.contains("hsr-typing-shell") ||
        block.classList.contains("hsr-seq-loader")
      ) {
        continue;
      }

      const kind = window.HSRSelectors.detectBlockKind(block);
      if (isSkippableEmptyBlock(block, kind)) {
        const existingWrapper =
          block.parentElement &&
          block.parentElement.classList &&
          block.parentElement.classList.contains("hsr-block-wrap")
            ? block.parentElement
            : null;

        if (existingWrapper) {
          existingWrapper.remove();
        } else {
          block.remove();
        }
        continue;
      }

      block.classList.add("hsr-kind", `hsr-kind-${kind}`);
      ensureBlockWrap(block, kind);

      const canSplit =
        role === "assistant" &&
        !streaming &&
        kind === "paragraph" &&
        window.HSRSelectors.isParagraphCandidate(block) &&
        window.HSRSplitter.isPlainParagraph(block) &&
        !window.HSRSelectors.hasInlineFormatting(block);

      if (canSplit) {
        upsertSplitShell(block);
      } else {
        block.classList.remove("hsr-original-paragraph");
        const next = block.nextElementSibling;
        if (next && next.classList && next.classList.contains("hsr-split-shell")) {
          next.remove();
        }
      }
    }

    const hasImageContent = Boolean(
      contentRoot.querySelector(".hsr-block-image, .hsr-image-group, img")
    );

    contentRoot.querySelectorAll("a").forEach((node) => {
      node.classList.add("hsr-link");
      if (role === "assistant" && hasImageContent && isLikelyImageSourceLink(node)) {
        node.classList.add("hsr-hide-source-link");
      } else {
        node.classList.remove("hsr-hide-source-link");
      }
    });
    contentRoot.querySelectorAll("pre").forEach((node) => node.classList.add("hsr-code-pre"));
    contentRoot.querySelectorAll("table").forEach((node) => node.classList.add("hsr-table"));
    contentRoot.querySelectorAll("blockquote").forEach((node) => node.classList.add("hsr-quote"));

    contentRoot.querySelectorAll("code").forEach((node) => {
      if (node.closest("pre")) {
        node.classList.add("hsr-code-block");
      } else {
        node.classList.add("hsr-inline-code");
      }
    });

    pruneEmptyBubbles(contentRoot);
    contentRoot.querySelectorAll("img").forEach((node) => node.classList.add("hsr-image"));
    normalizeImageGroups(contentRoot);
  }

  function normalizeImageGroups(contentRoot) {
    if (!contentRoot || !(contentRoot instanceof HTMLElement)) {
      return;
    }

    // Clean up legacy wrapper shape: .hsr-block-wrap > .hsr-image-group
    const legacyWrappedGroups = Array.from(contentRoot.children).filter((node) => {
      if (!(node instanceof HTMLElement)) {
        return false;
      }
      if (!node.classList.contains("hsr-block-wrap")) {
        return false;
      }
      const first = node.firstElementChild;
      return first instanceof HTMLElement && first.classList.contains("hsr-image-group");
    });

    for (const wrapper of legacyWrappedGroups) {
      const group = wrapper.firstElementChild;
      if (group) {
        wrapper.before(group);
      }
      wrapper.remove();
    }

    // Unwrap previous groups first so reprocessing stays idempotent.
    const existingGroups = Array.from(contentRoot.children).filter(
      (node) => node instanceof HTMLElement && node.classList.contains("hsr-image-group")
    );
    for (const group of existingGroups) {
      while (group.firstChild) {
        group.before(group.firstChild);
      }
      group.remove();
    }

    const children = Array.from(contentRoot.children).filter(
      (node) =>
        node instanceof HTMLElement &&
        !node.classList.contains("hsr-role-meta") &&
        !node.classList.contains("hsr-random-sticker")
    );

    let run = [];

    const flushRun = () => {
      if (run.length < 2) {
        run = [];
        return;
      }

      const group = document.createElement("div");
      group.className = "hsr-image-group";

      const first = run[0];
      first.before(group);
      for (const node of run) {
        group.appendChild(node);
      }
      run = [];
    };

    for (const node of children) {
      const isImageWrap =
        node.classList.contains("hsr-block-wrap") &&
        node.classList.contains("hsr-block-image");

      if (isImageWrap) {
        run.push(node);
        continue;
      }

      flushRun();
    }

    flushRun();
  }

  function getOrCreateAssistantMeta(turnNode, initialPass) {
    let meta = state.turnMeta.get(turnNode);
    if (!meta) {
      meta = {
        responseIndex: state.assistantTurnCounter + 1,
        finalized: Boolean(initialPass)
      };
      state.assistantTurnCounter += 1;
      state.turnMeta.set(turnNode, meta);
    }
    return meta;
  }

  function maybeInjectSticker(turnNode, contentRoot) {
    if (turnNode.dataset.hsrStickerInjected === "1") {
      return;
    }

    state.liveAssistantFinalizedCount += 1;
    const shouldInject = state.liveAssistantFinalizedCount % 2 === 1;

    if (!shouldInject) {
      return;
    }

    const stickerFile = window.HSRStickers.pickSticker(state.config.stickerPack);
    const stickerUrl = window.HSRStickers.stickerRuntimeUrl(stickerFile);

    const shell = document.createElement("div");
    shell.className = "hsr-random-sticker";

    const image = document.createElement("img");
    image.className = "hsr-sticker-img";
    image.src = stickerUrl;
    image.alt = "HSR sticker";
    image.loading = "lazy";
    image.addEventListener("error", () => {
      shell.remove();
      turnNode.dataset.hsrStickerInjected = "0";
      turnNode.dataset.hsrStickerFile = "";
    });

    const host =
      contentRoot.matches("p,span,code,strong,em")
        ? contentRoot.parentElement || contentRoot
        : contentRoot;

    shell.appendChild(image);
    host.appendChild(shell);

    turnNode.dataset.hsrStickerInjected = "1";
    turnNode.dataset.hsrStickerFile = stickerFile;
  }

  function processTurn(turnNode, initialPass, activeAssistantTurn = null) {
    const role = window.HSRSelectors.getRole(turnNode);
    if (role !== "assistant" && role !== "user") {
      return;
    }

    turnNode.classList.add("hsr-turn");
    turnNode.classList.toggle("hsr-assistant", role === "assistant");
    turnNode.classList.toggle("hsr-user", role === "user");

    const pinnedHiddenRoot = state.streamHiddenRoots.get(turnNode);
    const rawContentRoot =
      pinnedHiddenRoot && pinnedHiddenRoot.isConnected
        ? pinnedHiddenRoot
        : window.HSRSelectors.getPrimaryContentRoot(turnNode, role);
    if (!rawContentRoot || !(rawContentRoot instanceof HTMLElement)) {
      return;
    }

    const contentRoot =
      rawContentRoot.matches("p,span,code,strong,em")
        ? rawContentRoot.parentElement || rawContentRoot
        : rawContentRoot;

    contentRoot.classList.add("hsr-message-container");
    ensureRoleMeta(turnNode, role, contentRoot);

    if (role !== "assistant") {
      const hash = computeContentHash(contentRoot);
      if (turnNode.dataset.hsrProcessedHash !== hash) {
        decorateBlocks(contentRoot, role, false);
        turnNode.dataset.hsrProcessedHash = hash;
      }
      turnNode.classList.remove("hsr-pending");
      turnNode.dataset.hsrPainted = "1";
      return;
    }

    const now = Date.now();
    const currentHash = computeContentHash(contentRoot);

    let streamMeta = state.streamMeta.get(turnNode);
    if (!streamMeta) {
      streamMeta = {
        lastHash: currentHash,
        stableSince: now
      };
      state.streamMeta.set(turnNode, streamMeta);
    } else if (streamMeta.lastHash !== currentHash) {
      streamMeta.lastHash = currentHash;
      streamMeta.stableSince = now;
    }

    const stableFor = now - streamMeta.stableSince;
    const wasStreaming = turnNode.dataset.hsrWasStreaming === "1";
    const turnIsActiveAssistant = activeAssistantTurn ? activeAssistantTurn === turnNode : true;
    const detectedStreaming =
      turnIsActiveAssistant && window.HSRSelectors.isStreaming(turnNode);
    const hasFinalActions = hasAssistantFinalActions(turnNode);
    const hasProcessedHash = Boolean(turnNode.dataset.hsrProcessedHash);
    const streamStartTs = Number(turnNode.dataset.hsrStreamStartTs || 0);
    const streamAgeMs = streamStartTs > 0 ? now - streamStartTs : 0;

    // Hard lock while streaming: do not reveal partial token output.
    let streaming = detectedStreaming;

    if (!streaming) {
      const fallbackFinalize =
        wasStreaming &&
        streamAgeMs >= STREAM_FALLBACK_FINALIZE_MS &&
        stableFor >= STREAM_STABLE_MS * 2;

      if (turnIsActiveAssistant && (wasStreaming || (!initialPass && !hasProcessedHash))) {
        // Keep loader until explicit completion signal + stable quiet period,
        // or a long safety timeout to avoid infinite loading on DOM changes.
        if (!fallbackFinalize) {
          if (!hasFinalActions || stableFor < STREAM_STABLE_MS) {
            streaming = true;
          }
        }
      }
    }

    if (streaming && !streamStartTs) {
      turnNode.dataset.hsrStreamStartTs = String(now);
    }

    setAssistantStreamingState(turnNode, contentRoot, streaming);
    turnNode.classList.remove("hsr-pending");
    turnNode.dataset.hsrPainted = "1";

    const assistantMeta = getOrCreateAssistantMeta(turnNode, initialPass);

    if (streaming) {
      turnNode.dataset.hsrWasStreaming = "1";
      assistantMeta.finalized = false;
      return;
    }

    const streamEnded = wasStreaming;
    turnNode.dataset.hsrWasStreaming = "0";
    turnNode.removeAttribute("data-hsr-stream-start-ts");

    const hash = currentHash;
    if (turnNode.dataset.hsrProcessedHash !== hash || streamEnded) {
      decorateBlocks(contentRoot, role, false);
      turnNode.dataset.hsrProcessedHash = hash;
    }

    if (initialPass) {
      assistantMeta.finalized = true;
      return;
    }

    if (!assistantMeta.finalized) {
      assistantMeta.finalized = true;

      // Animate only when this assistant turn just finished live streaming.
      if (streamEnded) {
        const animDelay = startFinalCascadeAnimation(contentRoot, hash);
        if (animDelay > 0) {
          window.setTimeout(() => {
            maybeInjectSticker(turnNode, contentRoot);
          }, animDelay + 40);
        } else {
          maybeInjectSticker(turnNode, contentRoot);
        }
      } else {
        maybeInjectSticker(turnNode, contentRoot);
      }
    }
  }

  function applyEnabledState() {
    document.documentElement.classList.toggle("hsr-enabled", state.config.enabled);

    const main = document.querySelector("main");
    if (main) {
      main.classList.toggle("hsr-conversation-root", state.config.enabled);
    }

    if (state.config.enabled) {
      ensureFixedHeader();
    } else {
      removeFixedHeader();
    }

    if (!state.config.enabled) {
      document.documentElement.classList.remove("hsr-booting");
      document.querySelectorAll("[data-hsr-original-display]").forEach((node) => {
        if (!(node instanceof HTMLElement)) {
          return;
        }
        const originalDisplay = node.getAttribute("data-hsr-original-display");
        node.style.display = originalDisplay || "";
        node.removeAttribute("data-hsr-original-display");
      });
      document
        .querySelectorAll("[data-hsr-stream-hidden=\"1\"]")
        .forEach((node) => {
          if (!(node instanceof HTMLElement)) {
            return;
          }
          const originalDisplay = node.getAttribute("data-hsr-stream-original-display");
          node.style.display = originalDisplay || "";
          node.removeAttribute("data-hsr-stream-hidden");
          node.removeAttribute("data-hsr-stream-original-display");
        });
      document.querySelectorAll(".hsr-stream-overlay,.hsr-typing-shell,.hsr-seq-loader").forEach((node) => {
        node.remove();
      });
      document.querySelectorAll(".hsr-final-enter,.hsr-final-seq-hidden").forEach((node) => {
        if (!(node instanceof HTMLElement)) {
          return;
        }
        node.classList.remove("hsr-final-enter");
        node.classList.remove("hsr-final-seq-hidden");
      });
      document.querySelectorAll("[data-hsr-stream-preview-used]").forEach((node) => {
        node.removeAttribute("data-hsr-stream-preview-used");
      });
      document.querySelectorAll("[data-hsr-final-anim-hash]").forEach((node) => {
        node.removeAttribute("data-hsr-final-anim-hash");
      });
      document.querySelectorAll(".hsr-pending").forEach((node) => {
        node.classList.remove("hsr-pending");
      });
      document.querySelectorAll("[data-hsr-painted]").forEach((node) => {
        node.removeAttribute("data-hsr-painted");
      });
      state.streamHiddenRoots = new WeakMap();
      state.streamMeta = new WeakMap();
      state.revealTimers = new WeakMap();
    }
  }

  function markAssistantTurnPending(turnNode) {
    if (!turnNode || !(turnNode instanceof HTMLElement)) {
      return;
    }
    if (turnNode.dataset.hsrPainted === "1") {
      return;
    }
    if (window.HSRSelectors.getRole(turnNode) !== "assistant") {
      return;
    }

    turnNode.classList.add("hsr-turn", "hsr-assistant", "hsr-pending");
  }

  function markPendingFromMutationNode(node) {
    if (!(node instanceof Element)) {
      return;
    }

    if (node.matches('[data-message-author-role="assistant"]')) {
      const fallbackTurn =
        node.closest('article[data-testid^="conversation-turn-"]') ||
        node.closest('[data-testid*="conversation-turn"]') ||
        node.closest("article") ||
        node.closest(".group.w-full") ||
        node;
      markAssistantTurnPending(fallbackTurn);
    }

    const turns = window.HSRSelectors.findTurnNodes(node);
    for (const turn of turns) {
      markAssistantTurnPending(turn);
    }
  }

  function resolveActiveAssistantTurn(turns) {
    if (!Array.isArray(turns) || !turns.length) {
      return null;
    }

    const assistants = turns.filter((turn) => window.HSRSelectors.getRole(turn) === "assistant");
    if (!assistants.length) {
      return null;
    }

    const localStreamingSelectors = [
      '[data-is-streaming="true"]',
      ".result-streaming",
      '[data-testid*="stop-button"]',
      'button[aria-label*="Stop"]',
      'button[aria-label*="중지"]'
    ];

    for (let i = assistants.length - 1; i >= 0; i -= 1) {
      const turn = assistants[i];
      if (!turn || !(turn instanceof HTMLElement)) {
        continue;
      }

      if (turn.dataset.hsrWasStreaming === "1") {
        return turn;
      }

      if (!turn.dataset.hsrProcessedHash) {
        return turn;
      }

      if (
        localStreamingSelectors.some(
          (selector) => turn.matches(selector) || Boolean(turn.querySelector(selector))
        )
      ) {
        return turn;
      }
    }

    return assistants[assistants.length - 1];
  }

  function processAllTurns(initialPass = false) {
    applyEnabledState();

    if (!state.config.enabled) {
      return;
    }

    const turns = window.HSRSelectors.findTurnNodes(document);
    const activeAssistantTurn = resolveActiveAssistantTurn(turns);

    for (const turn of turns) {
      try {
        processTurn(turn, initialPass, activeAssistantTurn);
      } catch (error) {
        // Keep processing other turns even if one node shape is unexpected.
      }
    }
  }

  function scheduleProcess() {
    if (state.processTimer) {
      clearTimeout(state.processTimer);
    }

    state.processTimer = window.setTimeout(() => {
      processAllTurns(false);
    }, 30);
  }

  function startObserver() {
    if (state.observer) {
      state.observer.disconnect();
    }

    state.observer = new MutationObserver((mutations) => {
      if (!state.config.enabled) {
        return;
      }

      let hasAssistantAdded = false;

      for (const mutation of mutations) {
        if (mutation.type === "childList" && mutation.addedNodes && mutation.addedNodes.length) {
          for (const node of mutation.addedNodes) {
            markPendingFromMutationNode(node);
            if (
              node instanceof Element &&
              (node.matches('[data-message-author-role="assistant"]') ||
                node.querySelector('[data-message-author-role="assistant"]'))
            ) {
              hasAssistantAdded = true;
            }
          }
        }

        if (mutation.type === "childList" || mutation.type === "characterData") {
          scheduleProcess();
        }
      }

      if (hasAssistantAdded) {
        processAllTurns(false);
      }
    });

    state.observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  async function initializeConfig() {
    const stored = await getConfigFromStorage();
    const merged = mergeConfig(stored);
    state.config = merged;

    if (needsPersist(stored, merged)) {
      await setConfigToStorage(merged);
    }
  }

  function bindStorageEvents() {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName !== "sync" || !changes[CONFIG_KEY]) {
        return;
      }

      state.config = mergeConfig(changes[CONFIG_KEY].newValue);
      applyEnabledState();

      if (state.config.enabled) {
        scheduleProcess();
      }
    });
  }

  async function initialize() {
    await initializeConfig();
    processAllTurns(true);
    document.documentElement.classList.remove("hsr-booting");
    startObserver();
    bindStorageEvents();
  }

  initialize();
})();


  console.log('[HSRGUI Monolith] loaded');
})();



(() => {
  'use strict';

  function addPatchStyle(css) {
    try {
      const style = document.createElement('style');
      style.setAttribute('data-hsr-patch', '0.5.0');
      style.textContent = css;
      document.documentElement.appendChild(style);
    } catch {}
  }

  const patchCss = `
    :root {
      --hsr-avatar-size: 42px !important;
      --hsr-avatar-offset: 54px !important;
      --hsr-bubble-max: 76% !important;
      --hsr-strip-max: 1060px !important;
      --hsr-lane-pad: 14px !important;
      --hsr-strip-gap: 10px !important;
      --hsr-header-height: 72px !important;
      --hsr-header-pad-x: 18px !important;
      --hsr-header-offset-x: 16px !important;
    }

    html.hsr-enabled body {
      background:
        linear-gradient(180deg, rgba(232,238,244,0.96) 0%, rgba(221,228,234,0.96) 100%) !important;
    }

    html.hsr-enabled #hsr-fixed-header {
      backdrop-filter: blur(8px) !important;
      -webkit-backdrop-filter: blur(8px) !important;
      box-shadow: 0 2px 12px rgba(0,0,0,0.06) !important;
    }

    html.hsr-enabled .hsr-assistant .hsr-message-container > *,
    html.hsr-enabled .hsr-user .hsr-message-container > * {
      transition: transform .18s ease, opacity .18s ease, box-shadow .18s ease !important;
      animation: hsr-bubble-in .22s ease-out both;
    }

    html.hsr-enabled .hsr-assistant .hsr-message-container > *:hover,
    html.hsr-enabled .hsr-user .hsr-message-container > *:hover {
      transform: translateY(-1px);
    }

    html.hsr-enabled .hsr-random-sticker .hsr-sticker-img,
    html.hsr-enabled .hsr-sticker-img {
      max-width: 170px !important;
      width: min(170px, 46vw) !important;
      height: auto !important;
      filter: drop-shadow(0 3px 6px rgba(0,0,0,.08));
    }

    html.hsr-enabled aside[class*="sidebar"],
    html.hsr-enabled nav[aria-label*="Chat history"],
    html.hsr-enabled [data-testid="history-and-skills"] {
      max-width: 220px !important;
    }

    html.hsr-enabled form,
    html.hsr-enabled .composer-parent,
    html.hsr-enabled [data-testid="composer"] {
      box-shadow: 0 6px 18px rgba(0,0,0,.05) !important;
    }

    @media (max-width: 768px) {
      :root {
        --hsr-avatar-size: 38px !important;
        --hsr-avatar-offset: 48px !important;
        --hsr-bubble-max: 84% !important;
        --hsr-lane-pad: 10px !important;
        --hsr-strip-gap: 8px !important;
        --hsr-header-height: 64px !important;
        --hsr-header-pad-x: 14px !important;
        --hsr-header-offset-x: 12px !important;
      }

      html.hsr-enabled #hsr-fixed-header h1,
      html.hsr-enabled #hsr-fixed-header .hsr-header-title {
        font-size: 18px !important;
        line-height: 1.1 !important;
      }

      html.hsr-enabled #hsr-fixed-header p,
      html.hsr-enabled #hsr-fixed-header .hsr-header-subtitle {
        font-size: 11px !important;
        opacity: .82 !important;
      }

      html.hsr-enabled .hsr-assistant-name,
      html.hsr-enabled .hsr-user-name {
        font-size: 12px !important;
      }

      html.hsr-enabled .hsr-random-sticker .hsr-sticker-img,
      html.hsr-enabled .hsr-sticker-img {
        max-width: 138px !important;
        width: min(138px, 44vw) !important;
      }

      html.hsr-enabled aside,
      html.hsr-enabled [data-testid="history-and-skills"] {
        max-width: 82px !important;
      }
    }

    @keyframes hsr-bubble-in {
      from { opacity: .0; transform: translateY(6px) scale(.985); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
  `;

  function applyPatchConfig() {
    try {
      const key = 'hsrConfig';
      const raw = localStorage.getItem(key);
      const cfg = raw ? JSON.parse(raw) : {};
      let changed = false;

      if (!cfg.__patch050) {
        cfg.__patch050 = true;
        changed = true;
      }
      if (!cfg.actorPreset) {
        cfg.actorPreset = 'march7th-stelle';
        changed = true;
      }
      if (typeof cfg.userName !== 'string' || !cfg.userName.trim()) {
        cfg.userName = '오공이';
        changed = true;
      }
      if (!cfg.headerTitle) {
        cfg.headerTitle = '오공열차';
        changed = true;
      }
      if (!cfg.headerSubtitle) {
        cfg.headerSubtitle = '인간개조의 용광로';
        changed = true;
      }

      if (changed) {
        localStorage.setItem(key, JSON.stringify(cfg));
      }
    } catch {}
  }

  applyPatchConfig();
  addPatchStyle(patchCss);
})();


(() => {
  'use strict';

  function addPatchStyle(css) {
    try {
      const style = document.createElement('style');
      style.setAttribute('data-hsr-patch', '0.5.1');
      style.textContent = css;
      document.documentElement.appendChild(style);
    } catch {}
  }

  const patchCss = `
    /* 0.5.1: native top bar visibility bug workaround
       The stock ChatGPT top header remains mounted above HSRGUI on some mobile/desktop layouts.
       Instead of forcing invisible icons back, hide the native top header and keep HSR fixed header only. */
    html.hsr-enabled header:not(#hsr-fixed-header):not(.hsr-fixed-header) {
      opacity: 0 !important;
      pointer-events: none !important;
    }

    html.hsr-enabled [data-testid="conversation-header"],
    html.hsr-enabled [data-testid="page-header"] {
      opacity: 0 !important;
      pointer-events: none !important;
    }

    html.hsr-enabled div[class*="sticky"][class*="top-0"]:has(button):not(#hsr-fixed-header):not(.hsr-fixed-header) {
      opacity: 0 !important;
      pointer-events: none !important;
      box-shadow: none !important;
      background: transparent !important;
      border: 0 !important;
    }

    /* Safety: keep our custom header visible and clickable */
    html.hsr-enabled #hsr-fixed-header,
    html.hsr-enabled .hsr-fixed-header {
      opacity: 1 !important;
      visibility: visible !important;
      pointer-events: auto !important;
      z-index: 9999 !important;
    }

    /* Slight top spacing tune after hiding native header */
    @media (max-width: 768px) {
      :root {
        --hsr-header-height: 60px !important;
      }
    }
  `;

  addPatchStyle(patchCss);
})();
