/**
 * DevPower Toolkit v3.0
 * Popup Script - All feature logic
 */

document.addEventListener("DOMContentLoaded", () => {
  // === Storage Check ===
  if (typeof chrome.storage === "undefined") {
    document.body.innerHTML = `
      <div style="padding: 20px; text-align: center;">
        <h3 style="color: #FF3B30;">Extension Reload Required</h3>
        <p>Storage permission missing. Please reload the extension.</p>
      </div>
    `;
    return;
  }

  // === Helper: Check if URL is valid for content scripts ===
  function isValidUrl(url) {
    if (!url) return false;
    // Cannot inject into these schemes
    const invalidSchemes = [
      "chrome://",
      "chrome-extension://",
      "edge://",
      "about:",
      "data:",
      "file://",
      "javascript:",
      "view-source:",
    ];
    return !invalidSchemes.some((scheme) => url.startsWith(scheme));
  }

  // === Helper: Ensure content script is injected ===
  async function ensureContentScript(tabId, tabUrl) {
    // First check if URL is valid
    if (!isValidUrl(tabUrl)) {
      return false;
    }

    try {
      // Try to ping the content script
      await chrome.tabs.sendMessage(tabId, { action: "ping" });
      return true;
    } catch (e) {
      // Content script not loaded, inject it
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tabId },
          files: ["content.js"],
        });
        // Wait a bit for script to initialize
        await new Promise((resolve) => setTimeout(resolve, 100));
        return true;
      } catch (injectError) {
        console.error("Cannot inject script:", injectError);
        return false;
      }
    }
  }

  // === Tab Navigation (Dock) ===
  const dockItems = document.querySelectorAll(".dock-item");
  const tabContents = document.querySelectorAll(".tab-content");

  dockItems.forEach((item) => {
    item.addEventListener("click", () => {
      const target = item.dataset.target;

      // Update dock items
      dockItems.forEach((d) => d.classList.remove("active"));
      item.classList.add("active");

      // Update content
      tabContents.forEach((c) => c.classList.remove("active"));
      document.getElementById(target).classList.add("active");
    });
  });

  // === Help Popup ===
  const helpBtn = document.getElementById("help-btn");
  const helpPopup = document.getElementById("help-popup");
  const closeHelp = document.getElementById("close-help");

  // Dynamic help content for each tab
  const helpContent = {
    settings: {
      title: "⚙️ Settings",
      items: [
        "<strong>Settings:</strong> Open Chrome browser settings",
        "<strong>Extensions:</strong> Manage Chrome extensions",
        "<strong>JavaScript:</strong> Toggle JS on/off for current site",
        "<strong>Clear Cache:</strong> Open site cache settings",
      ],
    },
    tools: {
      title: "🎨 Tools",
      items: [
        "<strong>Color Picker:</strong> Pick any color from screen (click to copy)",
        "<strong>WhatFont:</strong> Hover over text to detect fonts",
        "<strong>CSS Viewer:</strong> Inspect element styles on hover",
        "<strong>Page Ruler:</strong> Click and drag to measure elements",
        "<strong>Link Checker:</strong> Scan page for broken links",
        "<strong>Tech Stack:</strong> Detect frameworks and libraries",
      ],
    },
    develop: {
      title: "🛠️ Develop",
      items: [
        "<strong>Resizer:</strong> Quick viewport presets",
        "<strong>Timestamp:</strong> Convert Unix timestamps ⇄ dates",
        "<strong>QR Code:</strong> Generate QR for URL or text",
        "<strong>Base64:</strong> Encode/decode text",
        "<strong>URL Parser:</strong> Parse URL components",
        "<strong>JSON:</strong> Format and validate JSON",
      ],
    },
    "screenshot-tab": {
      title: "📷 Screenshot",
      items: [
        "<strong>Full Page:</strong> Capture visible viewport",
        "<strong>Region:</strong> Select area to capture",
      ],
    },
    media: {
      title: "📥 Media Grabber",
      items: [
        "<strong>Scan:</strong> Find all images and videos on page",
        "<strong>Save All:</strong> Download all media at once",
        "<strong>Save Selected:</strong> Download only checked items",
      ],
    },
    wellness: {
      title: "🧘 Wellness",
      items: [
        "<strong>Water:</strong> Reminder every 45 mins",
        "<strong>Posture:</strong> Reminder every 30 mins",
        "<strong>20-20-20:</strong> Eye rest every 20 mins",
      ],
    },
    todo: {
      title: "📋 Tasks",
      items: [
        "<strong>Add:</strong> Type and press Enter or click +",
        "<strong>Complete:</strong> Check the checkbox",
        "<strong>Delete:</strong> Hover and click ×",
        "Tasks sync across devices via Chrome",
      ],
    },
  };

  function updateHelpContent() {
    const activeTab = document.querySelector(".dock-item.active");
    const tabId = activeTab?.dataset.target || "settings";
    const content = helpContent[tabId] || helpContent.settings;

    const bubbleContent = helpPopup.querySelector(".bubble-content");
    bubbleContent.innerHTML = `
      <h4>${content.title}</h4>
      <ul>
        ${content.items.map((item) => `<li>${item}</li>`).join("")}
      </ul>
      <button class="btn-text" id="close-help">Got it!</button>
    `;

    // Re-attach close handler
    document.getElementById("close-help")?.addEventListener("click", () => {
      helpPopup.classList.add("hidden");
    });
  }

  helpBtn?.addEventListener("click", () => {
    updateHelpContent();
    helpPopup.classList.toggle("hidden");
  });

  closeHelp?.addEventListener("click", () => {
    helpPopup.classList.add("hidden");
  });

  // Close popup when clicking outside
  document.addEventListener("click", (e) => {
    if (!helpPopup?.contains(e.target) && e.target !== helpBtn) {
      helpPopup?.classList.add("hidden");
    }
  });

  // === SETTINGS TAB ===

  // Open Chrome Settings
  document.getElementById("open-settings")?.addEventListener("click", () => {
    chrome.tabs.create({ url: "chrome://settings" });
  });

  // Open Extensions
  document.getElementById("open-extensions")?.addEventListener("click", () => {
    chrome.tabs.create({ url: "chrome://extensions" });
  });

  // Clear Cache
  document
    .getElementById("clear-cache")
    ?.addEventListener("click", async () => {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (tab?.url) {
        const url = new URL(tab.url);
        chrome.tabs.create({
          url: `chrome://settings/content/siteDetails?site=${encodeURIComponent(url.origin)}`,
        });
      }
    });

  // JavaScript Toggle
  const jsToggle = document.getElementById("toggle-js");

  // Check current JS status
  async function checkJsStatus() {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tab?.url && chrome.contentSettings?.javascript) {
      try {
        chrome.contentSettings.javascript.get(
          { primaryUrl: tab.url },
          (details) => {
            if (details) {
              jsToggle.checked = details.setting === "allow";
            }
          },
        );
      } catch (e) {
        console.log("Cannot check JS status for this URL");
      }
    }
  }

  checkJsStatus();

  jsToggle?.addEventListener("change", async () => {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tab?.url && chrome.contentSettings?.javascript) {
      const newSetting = jsToggle.checked ? "allow" : "block";
      try {
        chrome.contentSettings.javascript.set(
          { primaryPattern: tab.url, setting: newSetting },
          () => chrome.tabs.reload(tab.id),
        );
      } catch (e) {
        console.error("Cannot toggle JS for this URL");
      }
    }
  });

  // === TOOLS TAB ===

  // Color Picker
  const pickBtn = document.getElementById("pick-color");
  const colorDisplay = document.getElementById("color-display");
  const colorText = colorDisplay?.querySelector(".color-text");

  if (!window.EyeDropper) {
    if (colorText) colorText.textContent = "EyeDropper not supported";
    if (pickBtn) pickBtn.disabled = true;
  } else {
    pickBtn?.addEventListener("click", async () => {
      try {
        const eyeDropper = new EyeDropper();
        const result = await eyeDropper.open();
        const hex = result.sRGBHex;

        colorDisplay.style.background = hex;
        colorText.textContent = hex;
        colorText.style.color = getContrastColor(hex);

        // Copy to clipboard
        await navigator.clipboard.writeText(hex);
      } catch (e) {
        colorText.textContent = "Cancelled";
      }
    });
  }

  // WhatFont
  const whatfontBtn = document.getElementById("whatfont-btn");
  const fontResult = document.getElementById("font-result");

  whatfontBtn?.addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (!tab?.id) return;

    // Check if it's a valid URL
    if (!isValidUrl(tab.url)) {
      fontResult.innerHTML = `<span class="placeholder" style="color: #FF3B30;">Cannot run on this page</span>`;
      return;
    }

    whatfontBtn.innerHTML = `<span class="icon">⏳</span> Loading...`;

    try {
      // Ensure content script is loaded
      const injected = await ensureContentScript(tab.id, tab.url);
      if (!injected) {
        throw new Error("Cannot inject script");
      }

      // Send message to activate WhatFont
      await chrome.tabs.sendMessage(tab.id, { action: "whatFont" });

      fontResult.innerHTML = `<span class="placeholder" style="color: #34C759;">✓ Active! Hover over text on the page, click to copy font name. Press ESC to exit.</span>`;
      whatfontBtn.innerHTML = `<span class="icon">✓</span> Active`;
      whatfontBtn.style.background = "#34C759";

      // Close popup after short delay so user can see message
      setTimeout(() => window.close(), 800);
    } catch (e) {
      console.error("WhatFont error:", e);
      fontResult.innerHTML = `<span class="placeholder" style="color: #FF3B30;">Error: Cannot access this page. Try refreshing.</span>`;
      whatfontBtn.innerHTML = `<span class="icon">Aa</span> Detect Fonts`;
    }
  });

  // Page Ruler
  const rulerBtn = document.getElementById("ruler-btn");
  const rulerInfo = document.getElementById("ruler-info");

  rulerBtn?.addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (!tab?.id) return;

    if (!isValidUrl(tab.url)) {
      rulerInfo.innerHTML = `<span class="placeholder" style="color: #FF3B30;">Cannot run on this page</span>`;
      return;
    }

    rulerBtn.innerHTML = `<span class="icon">⏳</span> Loading...`;

    try {
      const injected = await ensureContentScript(tab.id, tab.url);
      if (!injected) {
        throw new Error("Cannot inject script");
      }

      await chrome.tabs.sendMessage(tab.id, { action: "pageRuler" });

      rulerInfo.innerHTML = `<span class="placeholder" style="color: #34C759;">✓ Active! Click and drag to measure. Press ESC to exit.</span>`;
      rulerBtn.innerHTML = `<span class="icon">✓</span> Active`;
      rulerBtn.style.background = "#34C759";

      setTimeout(() => window.close(), 800);
    } catch (e) {
      console.error("Page Ruler error:", e);
      rulerInfo.innerHTML = `<span class="placeholder" style="color: #FF3B30;">Error: Cannot access this page. Try refreshing.</span>`;
      rulerBtn.innerHTML = `<span class="icon">📐</span> Start Measuring`;
    }
  });

  // Tech Stack Scanner
  document.getElementById("scan-tech")?.addEventListener("click", async () => {
    const techList = document.getElementById("tech-list");
    techList.innerHTML = '<span class="placeholder">Scanning...</span>';

    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (!tab?.id) return;

    if (!isValidUrl(tab.url)) {
      techList.innerHTML =
        '<span class="placeholder" style="color: #FF3B30;">Cannot scan this page</span>';
      return;
    }

    try {
      await ensureContentScript(tab.id, tab.url);
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: "scanTech",
      });
      techList.innerHTML = "";

      if (response?.technologies?.length > 0) {
        response.technologies.forEach((tech) => {
          const badge = document.createElement("span");
          badge.className = "badge";
          badge.textContent = tech;
          techList.appendChild(badge);
        });
      } else {
        techList.innerHTML =
          '<span class="placeholder">No frameworks detected</span>';
      }
    } catch (e) {
      console.error("Tech scan error:", e);
      techList.innerHTML =
        '<span class="placeholder" style="color: #FF3B30;">Error: Refresh the page</span>';
    }
  });

  // === DEVELOP TAB ===

  // Window Resizer
  document.querySelectorAll(".size-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const width = parseInt(btn.dataset.width);
      const height = parseInt(btn.dataset.height);

      try {
        const win = await chrome.windows.getCurrent();
        await chrome.windows.update(win.id, { width, height });

        // Visual feedback
        btn.style.borderColor = "#34C759";
        btn.style.background = "rgba(52, 199, 89, 0.1)";
        setTimeout(() => {
          btn.style.borderColor = "";
          btn.style.background = "";
        }, 1000);
      } catch (e) {
        console.error("Window resize error:", e);
      }
    });
  });

  // Base64 Encoder/Decoder
  const base64Input = document.getElementById("base64-input");
  const base64Output = document.getElementById("base64-output");

  document.getElementById("base64-encode")?.addEventListener("click", () => {
    try {
      const text = base64Input.value;
      if (!text) {
        base64Output.textContent = "Please enter text to encode";
        base64Output.className = "output-area";
        return;
      }
      const encoded = btoa(unescape(encodeURIComponent(text)));
      base64Output.textContent = encoded;
      base64Output.className = "output-area success";
      navigator.clipboard.writeText(encoded);
    } catch (e) {
      base64Output.textContent = "Error encoding: " + e.message;
      base64Output.className = "output-area error";
    }
  });

  document.getElementById("base64-decode")?.addEventListener("click", () => {
    try {
      const text = base64Input.value;
      if (!text) {
        base64Output.textContent = "Please enter Base64 to decode";
        base64Output.className = "output-area";
        return;
      }
      const decoded = decodeURIComponent(escape(atob(text)));
      base64Output.textContent = decoded;
      base64Output.className = "output-area success";
      navigator.clipboard.writeText(decoded);
    } catch (e) {
      base64Output.textContent = "Invalid Base64 string";
      base64Output.className = "output-area error";
    }
  });

  // URL Parser
  const urlInput = document.getElementById("url-input");
  const urlResult = document.getElementById("url-result");

  document.getElementById("parse-url")?.addEventListener("click", () => {
    try {
      const urlText = urlInput.value.trim();
      if (!urlText) {
        urlResult.innerHTML = `<div class="url-item" style="color: #FF9500;">Please enter a URL</div>`;
        urlResult.classList.add("show");
        return;
      }

      const url = new URL(urlText);

      let paramsHtml = "";
      url.searchParams.forEach((value, key) => {
        paramsHtml += `<div class="url-item"><span class="url-key">  ${escapeHtml(key)}</span><span class="url-value">${escapeHtml(value)}</span></div>`;
      });

      urlResult.innerHTML = `
        <div class="url-item"><span class="url-key">Protocol</span><span class="url-value">${escapeHtml(url.protocol)}</span></div>
        <div class="url-item"><span class="url-key">Host</span><span class="url-value">${escapeHtml(url.host)}</span></div>
        <div class="url-item"><span class="url-key">Pathname</span><span class="url-value">${escapeHtml(url.pathname) || "/"}</span></div>
        ${url.search ? `<div class="url-item"><span class="url-key">Params</span><span class="url-value">${escapeHtml(url.search)}</span></div>${paramsHtml}` : ""}
        ${url.hash ? `<div class="url-item"><span class="url-key">Hash</span><span class="url-value">${escapeHtml(url.hash)}</span></div>` : ""}
      `;
      urlResult.classList.add("show");
    } catch (e) {
      urlResult.innerHTML = `<div class="url-item" style="color: #FF3B30;">Invalid URL. Make sure it starts with http:// or https://</div>`;
      urlResult.classList.add("show");
    }
  });

  // Fake Filler
  const fakeFillBtn = document.getElementById("fake-fill-btn");

  fakeFillBtn?.addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (!tab?.id) return;

    if (!isValidUrl(tab.url)) {
      fakeFillBtn.innerHTML = `<span class="icon">❌</span> Cannot run here`;
      fakeFillBtn.style.background = "#FF3B30";
      setTimeout(() => {
        fakeFillBtn.innerHTML = `<span class="icon">✨</span> Fill All Forms`;
        fakeFillBtn.style.background = "";
      }, 2000);
      return;
    }

    fakeFillBtn.innerHTML = `<span class="icon">⏳</span> Filling...`;

    try {
      await ensureContentScript(tab.id, tab.url);
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: "fakeFill",
      });

      const count = response?.count || 0;
      fakeFillBtn.innerHTML = `<span class="icon">✓</span> Filled ${count} fields`;
      fakeFillBtn.style.background = "#34C759";

      setTimeout(() => {
        fakeFillBtn.innerHTML = `<span class="icon">✨</span> Fill All Forms`;
        fakeFillBtn.style.background = "";
      }, 2000);
    } catch (e) {
      console.error("Fake fill error:", e);
      fakeFillBtn.innerHTML = `<span class="icon">❌</span> Error`;
      fakeFillBtn.style.background = "#FF3B30";
      setTimeout(() => {
        fakeFillBtn.innerHTML = `<span class="icon">✨</span> Fill All Forms`;
        fakeFillBtn.style.background = "";
      }, 2000);
    }
  });

  // JSON Formatter
  const jsonInput = document.getElementById("json-input");
  const jsonOutput = document.getElementById("json-output");

  document.getElementById("format-json")?.addEventListener("click", () => {
    const text = jsonInput.value.trim();
    if (!text) {
      jsonOutput.textContent = "Please enter JSON to format";
      jsonOutput.className = "json-output show";
      return;
    }

    try {
      const parsed = JSON.parse(text);
      jsonOutput.textContent = JSON.stringify(parsed, null, 2);
      jsonOutput.className = "json-output show success";
    } catch (e) {
      jsonOutput.textContent = `Invalid JSON:\n${e.message}`;
      jsonOutput.className = "json-output show error";
    }
  });

  // === TO-DO LIST ===
  const todoList = document.getElementById("todo-list");
  const newTodoInput = document.getElementById("new-todo");
  const addTodoBtn = document.getElementById("add-todo");

  // Load todos
  chrome.storage.sync.get(["todos"], (result) => {
    const todos = result.todos || [];
    todos.forEach(addTodoElement);
  });

  // Add new todo
  addTodoBtn?.addEventListener("click", () => addNewTodo());
  newTodoInput?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") addNewTodo();
  });

  function addNewTodo() {
    const text = newTodoInput.value.trim();
    if (text) {
      const todo = { id: Date.now(), text, done: false };
      addTodoElement(todo);
      saveTodo(todo);
      newTodoInput.value = "";
    }
  }

  function addTodoElement(todo) {
    const li = document.createElement("li");
    li.className = `todo-item ${todo.done ? "done" : ""}`;
    li.dataset.id = todo.id;

    li.innerHTML = `
      <input type="checkbox" ${todo.done ? "checked" : ""}>
      <span class="todo-text">${escapeHtml(todo.text)}</span>
      <button class="delete-btn">×</button>
    `;

    // Toggle done
    li.querySelector("input").addEventListener("change", (e) => {
      todo.done = e.target.checked;
      li.classList.toggle("done", todo.done);
      updateTodo(todo);
    });

    // Delete
    li.querySelector(".delete-btn").addEventListener("click", () => {
      deleteTodo(todo.id);
      li.remove();
    });

    todoList.appendChild(li);
  }

  function saveTodo(todo) {
    chrome.storage.sync.get(["todos"], (result) => {
      const todos = result.todos || [];
      todos.push(todo);
      chrome.storage.sync.set({ todos });
    });
  }

  function updateTodo(updatedTodo) {
    chrome.storage.sync.get(["todos"], (result) => {
      let todos = result.todos || [];
      const index = todos.findIndex((t) => t.id === updatedTodo.id);
      if (index !== -1) {
        todos[index] = updatedTodo;
        chrome.storage.sync.set({ todos });
      }
    });
  }

  function deleteTodo(id) {
    chrome.storage.sync.get(["todos"], (result) => {
      let todos = result.todos || [];
      todos = todos.filter((t) => t.id !== id);
      chrome.storage.sync.set({ todos });
    });
  }

  // === HELPER FUNCTIONS ===

  function getContrastColor(hex) {
    const r = parseInt(hex.substr(1, 2), 16);
    const g = parseInt(hex.substr(3, 2), 16);
    const b = parseInt(hex.substr(5, 2), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? "#000000" : "#ffffff";
  }

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  // === NEW FEATURES ===

  // --- CSS Viewer ---
  const cssViewerBtn = document.getElementById("css-viewer-btn");
  const cssResult = document.getElementById("css-result");

  cssViewerBtn?.addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (!tab?.id) return;

    if (!isValidUrl(tab.url)) {
      cssResult.innerHTML = `<span class="placeholder" style="color: #FF3B30;">Cannot run on this page</span>`;
      return;
    }

    cssViewerBtn.innerHTML = `<span class="icon">⏳</span> Loading...`;

    try {
      await ensureContentScript(tab.id, tab.url);
      await chrome.tabs.sendMessage(tab.id, { action: "cssViewer" });

      cssResult.innerHTML = `<span class="placeholder" style="color: #34C759;">✓ Active! Hover over elements to inspect CSS. Press ESC to exit.</span>`;
      cssViewerBtn.innerHTML = `<span class="icon">✓</span> Active`;
      cssViewerBtn.style.background = "#34C759";

      setTimeout(() => window.close(), 800);
    } catch (e) {
      console.error("CSS Viewer error:", e);
      cssResult.innerHTML = `<span class="placeholder" style="color: #FF3B30;">Error: Refresh the page</span>`;
      cssViewerBtn.innerHTML = `<span class="icon">{}</span> Inspect Styles`;
    }
  });

  // --- Link Checker ---
  const linkCheckerBtn = document.getElementById("link-checker-btn");
  const linkResult = document.getElementById("link-result");

  linkCheckerBtn?.addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (!tab?.id) return;

    if (!isValidUrl(tab.url)) {
      linkResult.innerHTML = `<span class="placeholder" style="color: #FF3B30;">Cannot run on this page</span>`;
      return;
    }

    linkCheckerBtn.innerHTML = `<span class="icon">⏳</span> Checking...`;
    linkResult.innerHTML = `<span class="placeholder">Scanning links...</span>`;

    try {
      await ensureContentScript(tab.id, tab.url);
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: "checkLinks",
      });

      if (response) {
        const { total, ok, broken, brokenUrls } = response;
        let html = `
          <div class="link-stats">
            <span class="stat-total">Total: ${total}</span>
            <span class="stat-ok">✓ OK: ${ok}</span>
            <span class="stat-broken">✗ Broken: ${broken}</span>
          </div>
        `;

        if (brokenUrls && brokenUrls.length > 0) {
          brokenUrls.slice(0, 10).forEach((url) => {
            html += `<div class="broken-link">${escapeHtml(url)}</div>`;
          });
          if (brokenUrls.length > 10) {
            html += `<div class="placeholder" style="margin-top: 8px;">... and ${brokenUrls.length - 10} more</div>`;
          }
        }

        linkResult.innerHTML = html;
        linkCheckerBtn.innerHTML = `<span class="icon">✓</span> Done`;
        linkCheckerBtn.style.background = broken > 0 ? "#FF9500" : "#34C759";
      }
    } catch (e) {
      console.error("Link checker error:", e);
      linkResult.innerHTML = `<span class="placeholder" style="color: #FF3B30;">Error checking links</span>`;
      linkCheckerBtn.innerHTML = `<span class="icon">🔍</span> Check Links`;
    }

    setTimeout(() => {
      linkCheckerBtn.innerHTML = `<span class="icon">🔍</span> Check Links`;
      linkCheckerBtn.style.background = "";
    }, 3000);
  });

  // --- Timestamp Converter ---
  const timestampInput = document.getElementById("timestamp-input");
  const timestampOutput = document.getElementById("timestamp-output");

  document
    .getElementById("timestamp-to-date")
    ?.addEventListener("click", () => {
      const input = timestampInput.value.trim();
      if (!input) {
        timestampOutput.innerHTML = `<span class="placeholder">Enter a timestamp or date</span>`;
        return;
      }

      try {
        let date;
        // Check if it's a Unix timestamp (number)
        if (/^\d+$/.test(input)) {
          // Unix timestamp - check if seconds or milliseconds
          const num = parseInt(input);
          date = new Date(num < 10000000000 ? num * 1000 : num);
        } else {
          // Try to parse as date string
          date = new Date(input);
        }

        if (isNaN(date.getTime())) {
          throw new Error("Invalid date");
        }

        const unix = Math.floor(date.getTime() / 1000);
        const unixMs = date.getTime();

        timestampOutput.innerHTML = `
        <div class="timestamp-row"><span class="ts-label">Unix (s)</span><span class="ts-value">${unix}</span></div>
        <div class="timestamp-row"><span class="ts-label">Unix (ms)</span><span class="ts-value">${unixMs}</span></div>
        <div class="timestamp-row"><span class="ts-label">ISO 8601</span><span class="ts-value">${date.toISOString()}</span></div>
        <div class="timestamp-row"><span class="ts-label">Local</span><span class="ts-value">${date.toLocaleString()}</span></div>
        <div class="timestamp-row"><span class="ts-label">UTC</span><span class="ts-value">${date.toUTCString()}</span></div>
      `;
      } catch (e) {
        timestampOutput.innerHTML = `<span class="placeholder" style="color: #FF3B30;">Invalid timestamp or date format</span>`;
      }
    });

  document.getElementById("timestamp-now")?.addEventListener("click", () => {
    const now = new Date();
    const unix = Math.floor(now.getTime() / 1000);
    const unixMs = now.getTime();

    timestampInput.value = unix;
    timestampOutput.innerHTML = `
      <div class="timestamp-row"><span class="ts-label">Unix (s)</span><span class="ts-value">${unix}</span></div>
      <div class="timestamp-row"><span class="ts-label">Unix (ms)</span><span class="ts-value">${unixMs}</span></div>
      <div class="timestamp-row"><span class="ts-label">ISO 8601</span><span class="ts-value">${now.toISOString()}</span></div>
      <div class="timestamp-row"><span class="ts-label">Local</span><span class="ts-value">${now.toLocaleString()}</span></div>
      <div class="timestamp-row"><span class="ts-label">UTC</span><span class="ts-value">${now.toUTCString()}</span></div>
    `;

    navigator.clipboard.writeText(String(unix));
  });

  // New Screenshot Logic
  // Full Page
  document
    .getElementById("screenshot-full")
    ?.addEventListener("click", async () => {
      const btn = document.getElementById("screenshot-full");
      btn.innerHTML = `<span class="icon">⏳</span> Capturing...`;

      try {
        const dataUrl = await chrome.tabs.captureVisibleTab(null, {
          format: "png",
        });
        const link = document.createElement("a");
        link.download = `screenshot-full-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();

        btn.innerHTML = `<span class="icon">✓</span> Saved`;
        setTimeout(
          () => (btn.innerHTML = `<span class="icon">📸</span> Full Page`),
          1500,
        );
      } catch (e) {
        btn.innerHTML = `Error`;
      }
    });

  // Region & Edit
  document
    .getElementById("screenshot-region")
    ?.addEventListener("click", async () => {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (!tab?.id) return;

      // Inject check
      await ensureContentScript(tab.id, tab.url);

      chrome.tabs.sendMessage(tab.id, { action: "startRegionCapture" });
      window.close(); // Close popup so user can select region
    });

  // === MEDIA GRABBER ===
  let scannedMediaList = []; // Store scanned media for Save All feature

  // Helper function to update selected count
  function updateSelectedCount() {
    const checkboxes = document.querySelectorAll(".media-checkbox:checked");
    const countEl = document.getElementById("selected-count");
    const saveSelectedBtn = document.getElementById("save-selected-media-btn");
    const count = checkboxes.length;

    if (countEl) countEl.textContent = `${count} selected`;
    if (saveSelectedBtn) saveSelectedBtn.disabled = count === 0;
  }

  document
    .getElementById("scan-media-btn")
    ?.addEventListener("click", async () => {
      const list = document.getElementById("media-list");
      const saveAllBtn = document.getElementById("save-all-media-btn");
      const saveSelectedBtn = document.getElementById(
        "save-selected-media-btn",
      );
      const mediaControls = document.getElementById("media-controls");
      const selectAllCheckbox = document.getElementById("select-all-media");

      list.innerHTML = `<span class="placeholder">Scanning...</span>`;
      saveAllBtn.disabled = true;
      saveSelectedBtn.disabled = true;
      mediaControls.classList.add("hidden");
      if (selectAllCheckbox) selectAllCheckbox.checked = false;
      scannedMediaList = [];

      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (!tab?.id) return;

      await ensureContentScript(tab.id, tab.url);

      try {
        const response = await chrome.tabs.sendMessage(tab.id, {
          action: "scanMedia",
        });
        const media = response?.media || [];

        if (media.length === 0) {
          list.innerHTML = `<span class="placeholder">No media found.</span>`;
          saveAllBtn.disabled = true;
          mediaControls.classList.add("hidden");
          return;
        }

        // Store for Save All
        scannedMediaList = media;
        saveAllBtn.disabled = false;
        mediaControls.classList.remove("hidden");
        mediaControls.style.display = "flex";

        list.innerHTML = "";
        media.forEach((item, index) => {
          const div = document.createElement("div");
          div.className = "media-item";
          div.style.cssText = `
                    display: flex; align-items: center; padding: 8px; 
                    border-bottom: 1px solid rgba(255,255,255,0.1); gap: 10px;
                `;

          let preview = "";
          if (item.type === "image") {
            preview = `<img src="${item.src}" style="width:40px; height:40px; object-fit:cover; border-radius:4px;">`;
          } else {
            preview = `<span style="font-size:24px;">🎬</span>`;
          }

          div.innerHTML = `
                    <input type="checkbox" class="media-checkbox" data-index="${index}" style="cursor: pointer;">
                    ${preview}
                    <div style="flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:12px;">
                        ${item.src.split("/").pop() || "unnamed"}
                    </div>
                    <button class="btn-sm" id="dl-${index}" style="padding:4px 8px; font-size:12px;">⬇️</button>
                `;

          list.appendChild(div);

          // Checkbox change
          div
            .querySelector(".media-checkbox")
            .addEventListener("change", updateSelectedCount);

          // Download click
          div.querySelector(`#dl-${index}`).onclick = () => {
            chrome.downloads.download({ url: item.src });
          };
        });

        updateSelectedCount();
      } catch (e) {
        console.error(e);
        list.innerHTML = "Error scanning media.";
        saveAllBtn.disabled = true;
        mediaControls.classList.add("hidden");
      }
    });

  // Select All checkbox
  document
    .getElementById("select-all-media")
    ?.addEventListener("change", (e) => {
      const checkboxes = document.querySelectorAll(".media-checkbox");
      checkboxes.forEach((cb) => (cb.checked = e.target.checked));
      updateSelectedCount();
    });

  // Save All Media Button
  document
    .getElementById("save-all-media-btn")
    ?.addEventListener("click", async () => {
      const saveAllBtn = document.getElementById("save-all-media-btn");

      if (scannedMediaList.length === 0) {
        return;
      }

      saveAllBtn.innerHTML = `<span class="icon">⏳</span> Saving...`;
      saveAllBtn.disabled = true;

      // Create folder name based on current date/time
      const folderName = `media_${new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19)}`;

      let downloadCount = 0;
      const totalCount = scannedMediaList.length;

      for (const item of scannedMediaList) {
        try {
          // Extract filename from URL
          let filename =
            item.src.split("/").pop().split("?")[0] || `media_${downloadCount}`;

          // Add extension if missing
          if (!filename.includes(".")) {
            filename += item.type === "image" ? ".jpg" : ".mp4";
          }

          // Download to subfolder
          await chrome.downloads.download({
            url: item.src,
            filename: `${folderName}/${filename}`,
            conflictAction: "uniquify",
          });

          downloadCount++;
        } catch (e) {
          console.error("Download error:", e, item.src);
        }
      }

      saveAllBtn.innerHTML = `<span class="icon">✓</span> Saved ${downloadCount}/${totalCount}`;
      saveAllBtn.style.background = "#34C759";

      setTimeout(() => {
        saveAllBtn.innerHTML = `<span class="icon">💾</span> Save All`;
        saveAllBtn.style.background = "";
        saveAllBtn.disabled = false;
      }, 2000);
    });

  // Save Selected Media Button
  document
    .getElementById("save-selected-media-btn")
    ?.addEventListener("click", async () => {
      const saveSelectedBtn = document.getElementById(
        "save-selected-media-btn",
      );
      const selectedCheckboxes = document.querySelectorAll(
        ".media-checkbox:checked",
      );

      if (selectedCheckboxes.length === 0) {
        return;
      }

      saveSelectedBtn.innerHTML = `<span class="icon">⏳</span> Saving...`;
      saveSelectedBtn.disabled = true;

      // Create folder name based on current date/time
      const folderName = `media_${new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19)}`;

      let downloadCount = 0;
      const totalCount = selectedCheckboxes.length;

      for (const checkbox of selectedCheckboxes) {
        const index = parseInt(checkbox.dataset.index);
        const item = scannedMediaList[index];

        if (!item) continue;

        try {
          // Extract filename from URL
          let filename =
            item.src.split("/").pop().split("?")[0] || `media_${downloadCount}`;

          // Add extension if missing
          if (!filename.includes(".")) {
            filename += item.type === "image" ? ".jpg" : ".mp4";
          }

          // Download to subfolder
          await chrome.downloads.download({
            url: item.src,
            filename: `${folderName}/${filename}`,
            conflictAction: "uniquify",
          });

          downloadCount++;
        } catch (e) {
          console.error("Download error:", e, item.src);
        }
      }

      saveSelectedBtn.innerHTML = `<span class="icon">✓</span> Saved ${downloadCount}/${totalCount}`;
      saveSelectedBtn.style.background = "#34C759";

      setTimeout(() => {
        saveSelectedBtn.innerHTML = `<span class="icon">✅</span> Save Selected`;
        saveSelectedBtn.style.background = "";
        saveSelectedBtn.disabled = false;
        updateSelectedCount();
      }, 2000);
    });

  // === WELLNESS CENTER ===
  // Load saved states
  chrome.storage.sync.get(["water", "posture", "vision"], (res) => {
    if (res.water) document.getElementById("toggle-water").checked = true;
    if (res.posture) document.getElementById("toggle-posture").checked = true;
    if (res.vision) document.getElementById("toggle-vision").checked = true;
  });

  // Toggles
  const toggleAlarm = (name, minutes, isChecked) => {
    if (isChecked) {
      chrome.alarms.create(name, { periodInMinutes: minutes });
      chrome.storage.sync.set({ [name.split("-")[0]]: true }); // save state
    } else {
      chrome.alarms.clear(name);
      chrome.storage.sync.set({ [name.split("-")[0]]: false });
    }
  };

  document.getElementById("toggle-water")?.addEventListener("change", (e) => {
    toggleAlarm("water-reminder", 45, e.target.checked);
  });

  document.getElementById("toggle-posture")?.addEventListener("change", (e) => {
    toggleAlarm("posture-reminder", 30, e.target.checked);
  });

  document.getElementById("toggle-vision")?.addEventListener("change", (e) => {
    toggleAlarm("vision-reminder", 20, e.target.checked);
  });
});

// --- QR Code Generator Helper ---
function generateQRCode(text) {
  // Simple QR Code generation using canvas
  // Using a basic QR code algorithm or external library
  const size = 150;
  const canvas = document.createElement("canvas");
  const qrDisplay = document.getElementById("qr-display");

  // Use QR Server API (free, no API key needed)
  const encodedText = encodeURIComponent(text);
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedText}`;
  img.style.borderRadius = "8px";

  qrDisplay.innerHTML = `<span class="placeholder">Generating...</span>`;

  img.onload = () => {
    qrDisplay.innerHTML = "";
    qrDisplay.appendChild(img);

    // Add download button
    const downloadBtn = document.createElement("button");
    downloadBtn.textContent = "⬇ Save";
    downloadBtn.style.cssText = `
        margin-left: 12px;
        padding: 8px 16px;
        background: var(--accent);
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 12px;
        cursor: pointer;
      `;
    downloadBtn.onclick = () => {
      const link = document.createElement("a");
      try {
        // Re-fetch as blob to support download attribute properly if cross-origin issues overlap
        fetch(img.src)
          .then((res) => res.blob())
          .then((blob) => {
            const url = window.URL.createObjectURL(blob);
            link.href = url;
            link.download = `qrcode-${Date.now()}.png`;
            link.click();
          });
      } catch (e) {
        link.href = img.src;
        link.download = `qrcode-${Date.now()}.png`;
        link.click();
      }
    };
    qrDisplay.appendChild(downloadBtn);
  };
  img.onerror = () => {
    qrDisplay.innerHTML = `<span class="placeholder" style="color: #FF3B30;">Failed to generate QR</span>`;
  };
}
