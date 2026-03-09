// ==UserScript==
// @name         HSRGUI_Mobile.user
// @namespace    hsrgui.mobile
// @version      0.8.1
// @description  HSR themed UI for ChatGPT mobile stable 0.8.1
// @match        https://chatgpt.com/*
// @grant        GM_addStyle
// ==/UserScript==

(function () {
  "use strict";

  const STORAGE_KEY = "hsrgui_mobile_config_v081";

  const DEFAULT_CONFIG = {
    headerTitle: "오공열차",
    headerSubtitle: "인간개조의 용광로",
    assistantName: "March.7th",
    userName: "오공이",
    theme: "express",
    randomSticker: false,
    showHeaderBadge: true
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
      shadow: "0 4px 12px rgba(0,0,0,0.08)"
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
      shadow: "0 4px 14px rgba(0,0,0,0.24)"
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
      shadow: "0 4px 12px rgba(0,0,0,0.07)"
    }
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
  let theme = THEMES[CONFIG.theme] || THEMES.express;

  const CDN_BASE = "https://cdn.jsdelivr.net/gh/engineer-502/HSRGUI@main/chatgpt_hsr_extension/assets";

  const AVATAR = {
    assistant: `${CDN_BASE}/icons/March_7th.png`,
    user: `${CDN_BASE}/icons/stelle.png`
  };

  const STICKER_BANK = {
    happy: [
      `${CDN_BASE}/stickers/sticker_1.png`,
      `${CDN_BASE}/stickers/sticker_2.png`
    ],
    thinking: [
      `${CDN_BASE}/stickers/sticker_3.png`,
      `${CDN_BASE}/stickers/sticker_4.png`
    ],
    surprise: [
      `${CDN_BASE}/stickers/sticker_5.png`,
      `${CDN_BASE}/stickers/sticker_6.png`
    ],
    sad: [
      `${CDN_BASE}/stickers/sticker_7.png`,
      `${CDN_BASE}/stickers/sticker_8.png`
    ]
  };

  function pickFrom(arr, seed) {
    if (!arr || !arr.length) return "";
    return arr[seed % arr.length];
  }

  function buildCss() {
    theme = THEMES[CONFIG.theme] || THEMES.express;

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
        padding: 14px 18px 10px 18px;
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
        font-size: 20px;
        color: ${theme.headerTitle};
        line-height: 1.1;
        letter-spacing: -0.02em;
      }

      #hsr-subtitle {
        margin-top: 4px;
        font-size: 12px;
        color: ${theme.headerSub};
        line-height: 1.2;
      }

      #hsr-header-right {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
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

      #hsr-theme-switcher {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
        justify-content: flex-end;
      }

      .hsr-chip {
        border: none;
        border-radius: 999px;
        padding: 6px 10px;
        font-size: 11px;
        font-weight: 800;
        background: ${theme.chipBg};
        color: ${theme.chipText};
        box-shadow: 0 2px 8px rgba(0,0,0,0.07);
      }

      .hsr-chip.is-active {
        outline: 2px solid rgba(0,0,0,0.18);
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
        from {
          opacity: 0;
          transform: translateY(6px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .hsr-avatar-label {
        display: flex !important;
        align-items: center !important;
        gap: 10px !important;
        margin: 4px 0 8px 0 !important;
        font-weight: 800 !important;
        font-size: 14px !important;
        color: ${theme.headerTitle};
      }

      .hsr-avatar-label img {
        width: 42px;
        height: 42px;
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
        padding: 14px 16px !important;
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
        width: 110px;
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
        from {
          opacity: 0;
          transform: translateY(8px) scale(0.9);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
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
        #hsr-header {
          padding: 12px 16px 9px 16px;
        }

        #hsr-title {
          font-size: 18px;
        }

        #hsr-subtitle {
          font-size: 11px;
        }

        #hsr-badge {
          padding: 5px 9px;
        }

        #hsr-badge img {
          width: 24px;
          height: 24px;
        }

        #hsr-badge-text {
          font-size: 11px;
        }

        .hsr-chip {
          padding: 5px 8px;
          font-size: 10px;
        }

        .hsr-avatar-label img {
          width: 38px;
          height: 38px;
        }

        .hsr-sticker {
          width: 96px;
        }
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
        badgeImg.style.display = "none";
      };

      const badgeText = document.createElement("div");
      badgeText.id = "hsr-badge-text";

      badge.appendChild(badgeImg);
      badge.appendChild(badgeText);

      const switcher = document.createElement("div");
      switcher.id = "hsr-theme-switcher";

      ["express", "midnight", "silver"].forEach((name) => {
        const btn = document.createElement("button");
        btn.className = "hsr-chip";
        btn.type = "button";
        btn.dataset.theme = name;
        btn.textContent = name.toUpperCase();
        btn.addEventListener("click", () => {
          CONFIG.theme = name;
          saveConfig();
          applyCss();
          refreshHeader();
          processMessages(true);
        });
        switcher.appendChild(btn);
      });

      right.appendChild(badge);
      right.appendChild(switcher);

      header.appendChild(left);
      header.appendChild(right);

      document.body.prepend(header);
    }

    refreshHeader();
  }

  function refreshHeader() {
    const title = document.getElementById("hsr-title");
    const subtitle = document.getElementById("hsr-subtitle");
    const badge = document.getElementById("hsr-badge");
    const badgeImg = document.getElementById("hsr-badge-img");
    const badgeText = document.getElementById("hsr-badge-text");
    const chips = document.querySelectorAll(".hsr-chip");

    if (title) title.textContent = CONFIG.headerTitle;
    if (subtitle) subtitle.textContent = CONFIG.headerSubtitle;
    if (badge) badge.style.display = CONFIG.showHeaderBadge ? "flex" : "none";
    if (badgeImg) {
      badgeImg.style.display = "";
      badgeImg.src = AVATAR.assistant;
    }
    if (badgeText) badgeText.textContent = CONFIG.assistantName;

    chips.forEach((chip) => {
      chip.classList.toggle("is-active", chip.dataset.theme === CONFIG.theme);
    });
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
    const answer = normalizeText(answerText);
    const user = normalizeText(userText);
    const combined = `${user} ${answer}`;

    const scores = {
      happy: 0,
      thinking: 0,
      surprise: 0,
      sad: 0
    };

    const directCommandRules = [
      { mood: "happy", words: ["웃어봐", "웃어 봐", "웃어", "웃는 척", "기쁜 척", "행복한 척"] },
      { mood: "thinking", words: ["생각해봐", "생각해 봐", "생각해", "고민해봐", "생각하는 척", "분석해봐"] },
      { mood: "surprise", words: ["놀란척", "놀란 척", "놀라봐", "놀라 봐", "깜짝 놀란 척", "헉 해봐"] },
      { mood: "sad", words: ["슬픈척", "슬픈 척", "울어봐", "울어 봐", "슬퍼해봐", "슬퍼해 봐", "우울한 척"] }
    ];

    for (const rule of directCommandRules) {
      if (rule.words.some((w) => user.includes(w))) {
        scores[rule.mood] += 100;
      }
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

    if (topScore <= 0) {
      return CONFIG.randomSticker ? ["happy", "thinking", "surprise", "sad"][index % 4] : "thinking";
    }

    return topMood;
  }

  function stickerUrlFor(answerText, userText, index) {
    const mood = detectMood(answerText, userText, index);
    return pickFrom(STICKER_BANK[mood], index);
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
        img.style.display = "none";
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
      img.src = role === "user" ? AVATAR.user : AVATAR.assistant;
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

    const nextUrl = stickerUrlFor(answerText, userText, index);

    if (!forceRefresh && img.dataset.ready === "1" && img.dataset.srcApplied === nextUrl) return;

    img.classList.remove("hsr-hidden");
    img.src = nextUrl;
    img.dataset.ready = "1";
    img.dataset.srcApplied = nextUrl;

    img.onerror = () => {
      img.classList.add("hsr-hidden");
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
