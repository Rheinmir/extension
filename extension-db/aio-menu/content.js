/**
 * DevPower Toolkit v3.0
 * Content Script - Page interaction features
 */

// ==========================================
// Tech Stack Detector
// ==========================================
function detectTechStack() {
  const technologies = [];

  // Check for common JavaScript libraries/frameworks
  if (
    window.React ||
    document.querySelector("[data-reactroot], [data-reactid]")
  ) {
    technologies.push("React");
  }
  if (window.Vue || document.querySelector("[vue-app], [data-v-]")) {
    technologies.push("Vue.js");
  }
  if (window.jQuery || window.$) {
    technologies.push("jQuery");
  }
  if (
    window.angular ||
    document.querySelector("[ng-app], [ng-controller], [ng-model]")
  ) {
    technologies.push("Angular");
  }
  if (window.Backbone) {
    technologies.push("Backbone.js");
  }
  if (window.Ember) {
    technologies.push("Ember.js");
  }
  if (window.Svelte || document.querySelector("[class*='svelte-']")) {
    technologies.push("Svelte");
  }
  if (window.Alpine || document.querySelector("[x-data]")) {
    technologies.push("Alpine.js");
  }
  if (window.htmx || document.querySelector("[hx-get], [hx-post]")) {
    technologies.push("htmx");
  }

  // CSS Frameworks
  if (
    document.querySelector(
      'link[href*="bootstrap"], .btn-primary.btn-secondary',
    )
  ) {
    technologies.push("Bootstrap");
  }
  if (
    document.querySelector('link[href*="tailwind"], [class*="tw-"]') ||
    document.querySelector('[class*="flex"][class*="items-center"]')
  ) {
    technologies.push("Tailwind CSS");
  }
  if (document.querySelector('link[href*="bulma"]')) {
    technologies.push("Bulma");
  }

  // Meta generator tag
  const generator = document.querySelector('meta[name="generator"]');
  if (generator) {
    technologies.push(generator.content);
  }

  // CMS Detection
  if (
    document.querySelector('meta[name="generator"][content*="WordPress"]') ||
    document.querySelector('link[href*="wp-content"]')
  ) {
    technologies.push("WordPress");
  }
  if (
    window.Shopify ||
    document.querySelector('meta[name="shopify-checkout-api-token"]')
  ) {
    technologies.push("Shopify");
  }

  return [...new Set(technologies)];
}

// ==========================================
// WhatFont Feature
// ==========================================
let whatFontActive = false;
let fontTooltip = null;
let fontExitBtn = null;

function activateWhatFont() {
  if (whatFontActive) return;
  whatFontActive = true;

  // Create tooltip
  fontTooltip = document.createElement("div");
  fontTooltip.id = "devpower-font-tooltip";
  fontTooltip.style.cssText = `
    position: fixed;
    z-index: 2147483647;
    background: rgba(0, 0, 0, 0.85);
    color: white;
    padding: 8px 12px;
    border-radius: 8px;
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
    font-size: 12px;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.15s;
    max-width: 300px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    backdrop-filter: blur(10px);
  `;
  document.body.appendChild(fontTooltip);

  // Create floating exit button
  fontExitBtn = document.createElement("div");
  fontExitBtn.id = "devpower-font-exit";
  fontExitBtn.innerHTML = `
    <span style="font-size: 16px;">🔤</span>
    <span><strong>WhatFont Active</strong> - Hover to detect • Click to copy</span>
    <button id="devpower-font-exit-btn">✕ Exit</button>
  `;
  fontExitBtn.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 2147483647;
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 10px 16px;
    border-radius: 12px;
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 10px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.4);
    backdrop-filter: blur(20px);
    animation: devpower-slide-up 0.3s ease;
  `;
  document.body.appendChild(fontExitBtn);

  // Add animation keyframes
  if (!document.getElementById("devpower-animations")) {
    const style = document.createElement("style");
    style.id = "devpower-animations";
    style.textContent = `
      @keyframes devpower-slide-up {
        from { opacity: 0; transform: translateX(-50%) translateY(20px); }
        to { opacity: 1; transform: translateX(-50%) translateY(0); }
      }
    `;
    document.head.appendChild(style);
  }

  // Style the exit button
  const exitBtn = fontExitBtn.querySelector("#devpower-font-exit-btn");
  exitBtn.style.cssText = `
    background: #FF3B30;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    margin-left: 8px;
  `;
  exitBtn.addEventListener("click", deactivateWhatFont);

  document.addEventListener("mouseover", handleFontHover);
  document.addEventListener("mouseout", handleFontOut);
  document.addEventListener("click", handleFontClick, true);
  document.addEventListener("keydown", handleFontEscape);
}

function handleFontHover(e) {
  if (!whatFontActive || e.target === fontTooltip) return;

  const computed = window.getComputedStyle(e.target);
  const fontFamily = computed.fontFamily
    .split(",")[0]
    .replace(/['"]/g, "")
    .trim();
  const fontSize = computed.fontSize;
  const fontWeight = computed.fontWeight;
  const lineHeight = computed.lineHeight;
  const color = computed.color;

  fontTooltip.innerHTML = `
    <div style="font-size: 14px; font-weight: 600; margin-bottom: 6px;">${fontFamily}</div>
    <div style="display: grid; grid-template-columns: auto auto; gap: 4px 12px; font-size: 11px; opacity: 0.9;">
      <span>Size:</span><span>${fontSize}</span>
      <span>Weight:</span><span>${fontWeight}</span>
      <span>Line Height:</span><span>${lineHeight}</span>
      <span>Color:</span><span style="display:flex;align-items:center;gap:4px;"><span style="width:10px;height:10px;background:${color};border-radius:2px;border:1px solid rgba(255,255,255,0.3);"></span>${rgbToHex(color)}</span>
    </div>
  `;

  fontTooltip.style.opacity = "1";

  // Position tooltip
  const x = Math.min(
    e.clientX + 15,
    window.innerWidth - fontTooltip.offsetWidth - 10,
  );
  const y = Math.min(
    e.clientY + 15,
    window.innerHeight - fontTooltip.offsetHeight - 10,
  );
  fontTooltip.style.left = x + "px";
  fontTooltip.style.top = y + "px";

  // Highlight element
  e.target.style.outline = "2px solid #007AFF";
  e.target.style.outlineOffset = "2px";
}

function handleFontOut(e) {
  if (!whatFontActive) return;
  fontTooltip.style.opacity = "0";
  e.target.style.outline = "";
  e.target.style.outlineOffset = "";
}

function handleFontClick(e) {
  if (!whatFontActive) return;
  e.preventDefault();
  e.stopPropagation();

  // Copy font info to clipboard
  const computed = window.getComputedStyle(e.target);
  const fontFamily = computed.fontFamily
    .split(",")[0]
    .replace(/['"]/g, "")
    .trim();
  navigator.clipboard.writeText(fontFamily);

  deactivateWhatFont();
}

function handleFontEscape(e) {
  if (e.key === "Escape" && whatFontActive) {
    deactivateWhatFont();
  }
}

function deactivateWhatFont() {
  whatFontActive = false;
  document.removeEventListener("mouseover", handleFontHover);
  document.removeEventListener("mouseout", handleFontOut);
  document.removeEventListener("click", handleFontClick, true);
  document.removeEventListener("keydown", handleFontEscape);
  fontTooltip?.remove();
  fontExitBtn?.remove();

  // Remove any remaining outlines
  document.querySelectorAll("*").forEach((el) => {
    el.style.outline = "";
    el.style.outlineOffset = "";
  });
}

// ==========================================
// Page Ruler Feature
// ==========================================
let rulerActive = false;
let rulerOverlay = null;
let rulerBox = null;
let rulerExitBtn = null;
let startX, startY;

function activatePageRuler() {
  if (rulerActive) return;
  rulerActive = true;

  // Create overlay
  rulerOverlay = document.createElement("div");
  rulerOverlay.id = "devpower-ruler-overlay";
  rulerOverlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 2147483646;
    cursor: crosshair;
    background: transparent;
  `;
  document.body.appendChild(rulerOverlay);

  // Create measurement box
  rulerBox = document.createElement("div");
  rulerBox.id = "devpower-ruler-box";
  rulerBox.style.cssText = `
    position: fixed;
    border: 2px dashed #007AFF;
    background: rgba(0, 122, 255, 0.1);
    z-index: 2147483647;
    pointer-events: none;
    display: none;
  `;
  document.body.appendChild(rulerBox);

  // Create size label
  const sizeLabel = document.createElement("div");
  sizeLabel.id = "devpower-ruler-label";
  sizeLabel.style.cssText = `
    position: absolute;
    bottom: -28px;
    left: 50%;
    transform: translateX(-50%);
    background: #007AFF;
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-family: "SF Mono", Monaco, monospace;
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
  `;
  rulerBox.appendChild(sizeLabel);

  // Create floating exit button
  rulerExitBtn = document.createElement("div");
  rulerExitBtn.id = "devpower-ruler-exit";
  rulerExitBtn.innerHTML = `
    <span style="font-size: 16px;">📏</span>
    <span><strong>Page Ruler Active</strong> - Click and drag to measure</span>
    <button id="devpower-ruler-exit-btn">✕ Exit</button>
  `;
  rulerExitBtn.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 2147483647;
    background: rgba(0, 122, 255, 0.95);
    color: white;
    padding: 10px 16px;
    border-radius: 12px;
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 10px;
    box-shadow: 0 4px 20px rgba(0,122,255,0.4);
    backdrop-filter: blur(20px);
    animation: devpower-slide-up 0.3s ease;
  `;
  document.body.appendChild(rulerExitBtn);

  // Add animation keyframes if not exists
  if (!document.getElementById("devpower-animations")) {
    const style = document.createElement("style");
    style.id = "devpower-animations";
    style.textContent = `
      @keyframes devpower-slide-up {
        from { opacity: 0; transform: translateX(-50%) translateY(20px); }
        to { opacity: 1; transform: translateX(-50%) translateY(0); }
      }
    `;
    document.head.appendChild(style);
  }

  // Style the exit button
  const exitBtn = rulerExitBtn.querySelector("#devpower-ruler-exit-btn");
  exitBtn.style.cssText = `
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: 1px solid rgba(255,255,255,0.3);
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    margin-left: 8px;
  `;
  exitBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    deactivatePageRuler();
  });

  rulerOverlay.addEventListener("mousedown", startMeasure);
  document.addEventListener("keydown", handleRulerEscape);
}

function startMeasure(e) {
  startX = e.clientX;
  startY = e.clientY;

  rulerBox.style.display = "block";
  rulerBox.style.left = startX + "px";
  rulerBox.style.top = startY + "px";
  rulerBox.style.width = "0";
  rulerBox.style.height = "0";

  document.addEventListener("mousemove", updateMeasure);
  document.addEventListener("mouseup", endMeasure);
}

function updateMeasure(e) {
  const width = Math.abs(e.clientX - startX);
  const height = Math.abs(e.clientY - startY);
  const left = Math.min(e.clientX, startX);
  const top = Math.min(e.clientY, startY);

  rulerBox.style.left = left + "px";
  rulerBox.style.top = top + "px";
  rulerBox.style.width = width + "px";
  rulerBox.style.height = height + "px";

  const label = rulerBox.querySelector("#devpower-ruler-label");
  label.textContent = `${width} × ${height} px`;
}

function endMeasure(e) {
  document.removeEventListener("mousemove", updateMeasure);
  document.removeEventListener("mouseup", endMeasure);

  const width = Math.abs(e.clientX - startX);
  const height = Math.abs(e.clientY - startY);

  // Copy measurement to clipboard
  navigator.clipboard.writeText(`${width} × ${height} px`);

  // Flash effect
  rulerBox.style.background = "rgba(0, 122, 255, 0.3)";
  setTimeout(() => {
    rulerBox.style.background = "rgba(0, 122, 255, 0.1)";
  }, 200);
}

function handleRulerEscape(e) {
  if (e.key === "Escape" && rulerActive) {
    deactivatePageRuler();
  }
}

function deactivatePageRuler() {
  rulerActive = false;
  document.removeEventListener("keydown", handleRulerEscape);
  rulerOverlay?.remove();
  rulerBox?.remove();
  rulerExitBtn?.remove();
}

// ==========================================
// Fake Filler Feature
// ==========================================
function fillForms() {
  const fakeData = {
    firstName: [
      "John",
      "Jane",
      "Mike",
      "Sarah",
      "David",
      "Emily",
      "Alex",
      "Lisa",
    ],
    lastName: [
      "Smith",
      "Johnson",
      "Williams",
      "Brown",
      "Jones",
      "Davis",
      "Miller",
      "Wilson",
    ],
    email: () => `test${Math.floor(Math.random() * 10000)}@example.com`,
    phone: () => `+1${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
    address: ["123 Main St", "456 Oak Ave", "789 Pine Rd", "321 Elm Blvd"],
    city: ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix"],
    zip: () => String(Math.floor(Math.random() * 90000 + 10000)),
    company: ["Acme Inc", "Tech Corp", "Global Ltd", "Digital LLC"],
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    number: () => Math.floor(Math.random() * 1000),
    date: () => {
      const d = new Date();
      d.setDate(d.getDate() + Math.floor(Math.random() * 365));
      return d.toISOString().split("T")[0];
    },
  };

  const random = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const getValue = (key) =>
    typeof fakeData[key] === "function"
      ? fakeData[key]()
      : random(fakeData[key]);

  let filledCount = 0;
  const inputs = document.querySelectorAll("input, textarea, select");

  inputs.forEach((input) => {
    if (input.disabled || input.readOnly || !input.offsetParent) return;

    const type = input.type?.toLowerCase() || "text";
    const name = (
      input.name ||
      input.id ||
      input.placeholder ||
      ""
    ).toLowerCase();

    try {
      switch (type) {
        case "email":
          input.value = getValue("email");
          filledCount++;
          break;
        case "tel":
          input.value = getValue("phone");
          filledCount++;
          break;
        case "number":
          input.value = getValue("number");
          filledCount++;
          break;
        case "date":
          input.value = getValue("date");
          filledCount++;
          break;
        case "checkbox":
        case "radio":
          input.checked = Math.random() > 0.5;
          filledCount++;
          break;
        case "text":
        case "search":
          if (name.includes("first") || name.includes("fname")) {
            input.value = getValue("firstName");
          } else if (name.includes("last") || name.includes("lname")) {
            input.value = getValue("lastName");
          } else if (name.includes("email") || name.includes("mail")) {
            input.value = getValue("email");
          } else if (name.includes("phone") || name.includes("tel")) {
            input.value = getValue("phone");
          } else if (name.includes("city")) {
            input.value = getValue("city");
          } else if (name.includes("zip") || name.includes("postal")) {
            input.value = getValue("zip");
          } else if (name.includes("address") || name.includes("street")) {
            input.value = getValue("address");
          } else if (name.includes("company") || name.includes("org")) {
            input.value = getValue("company");
          } else if (name.includes("name")) {
            input.value = `${getValue("firstName")} ${getValue("lastName")}`;
          } else {
            input.value = "Test Input";
          }
          filledCount++;
          break;
        case "password":
          input.value = "Password123!";
          filledCount++;
          break;
        case "url":
          input.value = "https://example.com";
          filledCount++;
          break;
        default:
          break;
      }

      // Handle textareas
      if (input.tagName === "TEXTAREA") {
        input.value = fakeData.text;
        filledCount++;
      }

      // Handle selects
      if (input.tagName === "SELECT" && input.options.length > 1) {
        const randomIndex =
          Math.floor(Math.random() * (input.options.length - 1)) + 1;
        input.selectedIndex = randomIndex;
        filledCount++;
      }

      // Trigger change event
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
    } catch (e) {
      console.log("DevPower: Error filling field", e);
    }
  });

  return filledCount;
}

// ==========================================
// Helper Functions
// ==========================================
function rgbToHex(rgb) {
  if (rgb.startsWith("#")) return rgb;
  const match = rgb.match(/\d+/g);
  if (!match || match.length < 3) return rgb;
  const hex = match
    .slice(0, 3)
    .map((x) => {
      const hex = parseInt(x).toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    })
    .join("");
  return "#" + hex.toUpperCase();
}

// ==========================================
// CSS Viewer Feature
// ==========================================
let cssViewerActive = false;
let cssTooltip = null;
let cssExitBtn = null;

function activateCSSViewer() {
  if (cssViewerActive) return;
  cssViewerActive = true;

  // Create tooltip
  cssTooltip = document.createElement("div");
  cssTooltip.id = "devpower-css-tooltip";
  cssTooltip.style.cssText = `
    position: fixed;
    z-index: 2147483647;
    background: rgba(30, 30, 30, 0.95);
    color: white;
    padding: 12px 16px;
    border-radius: 10px;
    font-family: "SF Mono", Monaco, monospace;
    font-size: 11px;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.15s;
    max-width: 320px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    backdrop-filter: blur(20px);
  `;
  document.body.appendChild(cssTooltip);

  // Create exit button
  cssExitBtn = document.createElement("div");
  cssExitBtn.id = "devpower-css-exit";
  cssExitBtn.innerHTML = `
    <span style="font-size: 16px;">{}</span>
    <span><strong>CSS Viewer Active</strong> - Hover to inspect styles</span>
    <button id="devpower-css-exit-btn">✕ Exit</button>
  `;
  cssExitBtn.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 2147483647;
    background: rgba(175, 82, 222, 0.95);
    color: white;
    padding: 10px 16px;
    border-radius: 12px;
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 10px;
    box-shadow: 0 4px 20px rgba(175,82,222,0.4);
    backdrop-filter: blur(20px);
    animation: devpower-slide-up 0.3s ease;
  `;
  document.body.appendChild(cssExitBtn);

  const exitBtn = cssExitBtn.querySelector("#devpower-css-exit-btn");
  exitBtn.style.cssText = `
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: 1px solid rgba(255,255,255,0.3);
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    margin-left: 8px;
  `;
  exitBtn.addEventListener("click", deactivateCSSViewer);

  document.addEventListener("mouseover", handleCSSHover);
  document.addEventListener("mouseout", handleCSSOut);
  document.addEventListener("keydown", handleCSSEscape);
}

function handleCSSHover(e) {
  if (
    !cssViewerActive ||
    e.target === cssTooltip ||
    cssExitBtn?.contains(e.target)
  )
    return;

  const computed = window.getComputedStyle(e.target);

  const props = [
    { name: "display", value: computed.display },
    { name: "position", value: computed.position },
    { name: "width × height", value: `${computed.width} × ${computed.height}` },
    { name: "margin", value: computed.margin },
    { name: "padding", value: computed.padding },
    {
      name: "font",
      value: `${computed.fontSize} ${computed.fontFamily.split(",")[0]}`,
    },
    { name: "color", value: rgbToHex(computed.color) },
    { name: "background", value: rgbToHex(computed.backgroundColor) },
    {
      name: "border",
      value:
        computed.border !== "0px none rgb(0, 0, 0)" ? computed.border : "none",
    },
  ];

  let html = `<div style="margin-bottom: 8px; color: #5AC8FA; font-weight: 600;">${e.target.tagName.toLowerCase()}${e.target.className ? "." + e.target.className.split(" ")[0] : ""}</div>`;
  props.forEach((p) => {
    if (p.value && p.value !== "none" && p.value !== "0px") {
      html += `<div style="display: flex; justify-content: space-between; padding: 3px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
        <span style="color: #aeaeb2;">${p.name}</span>
        <span style="color: #34C759; margin-left: 12px;">${p.value}</span>
      </div>`;
    }
  });

  cssTooltip.innerHTML = html;
  cssTooltip.style.opacity = "1";

  const x = Math.min(
    e.clientX + 15,
    window.innerWidth - cssTooltip.offsetWidth - 10,
  );
  const y = Math.min(
    e.clientY + 15,
    window.innerHeight - cssTooltip.offsetHeight - 10,
  );
  cssTooltip.style.left = x + "px";
  cssTooltip.style.top = y + "px";

  e.target.style.outline = "2px solid #AF52DE";
  e.target.style.outlineOffset = "2px";
}

function handleCSSOut(e) {
  if (!cssViewerActive) return;
  cssTooltip.style.opacity = "0";
  e.target.style.outline = "";
  e.target.style.outlineOffset = "";
}

function handleCSSEscape(e) {
  if (e.key === "Escape" && cssViewerActive) {
    deactivateCSSViewer();
  }
}

function deactivateCSSViewer() {
  cssViewerActive = false;
  document.removeEventListener("mouseover", handleCSSHover);
  document.removeEventListener("mouseout", handleCSSOut);
  document.removeEventListener("keydown", handleCSSEscape);
  cssTooltip?.remove();
  cssExitBtn?.remove();

  document.querySelectorAll("*").forEach((el) => {
    el.style.outline = "";
    el.style.outlineOffset = "";
  });
}

// ==========================================
// Link Checker Feature
// ==========================================
async function checkLinks() {
  const links = document.querySelectorAll("a[href]");
  const uniqueUrls = new Set();

  links.forEach((link) => {
    const href = link.href;
    if (
      href &&
      !href.startsWith("javascript:") &&
      !href.startsWith("mailto:") &&
      !href.startsWith("tel:")
    ) {
      uniqueUrls.add(href);
    }
  });

  const urlArray = Array.from(uniqueUrls);
  const total = urlArray.length;
  const brokenUrls = [];
  let checked = 0;

  // Check links in parallel with a limit
  const checkUrl = async (url) => {
    try {
      const response = await fetch(url, { method: "HEAD", mode: "no-cors" });
      // In no-cors mode we can't check status, so this is limited
      // For same-origin requests, we can do better
      checked++;
    } catch (e) {
      brokenUrls.push(url);
      checked++;
    }
  };

  // Process in batches of 5
  for (let i = 0; i < urlArray.length; i += 5) {
    const batch = urlArray.slice(i, i + 5);
    await Promise.all(batch.map(checkUrl));
  }

  return {
    total: total,
    ok: total - brokenUrls.length,
    broken: brokenUrls.length,
    brokenUrls: brokenUrls,
  };
}

// ==========================================
// Screenshot & Editor Feature
// ==========================================
let screenshotActive = false;
let screenOverlay = null;
let screenBox = null;
let screenToolbar = null;
let screenCanvas = null;
let screenCtx = null;
let startSX, startSY;
let isDrawing = false;
let currentTool = "box"; // cursor, box, arrow, pen
let editorMode = false; // false = selecting region, true = editing

function activateRegionCapture() {
  console.log("[DevPower] Region Capture activated!");
  if (screenshotActive) return;
  screenshotActive = true;
  editorMode = false;
  currentTool = "box";

  // Create overlay for selection
  screenOverlay = document.createElement("div");
  screenOverlay.id = "devpower-screen-overlay";
  screenOverlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 2147483645;
    cursor: crosshair;
    background: rgba(0, 0, 0, 0.3);
  `;
  document.body.appendChild(screenOverlay);

  // Region box
  screenBox = document.createElement("div");
  screenBox.id = "devpower-screen-box";
  screenBox.style.cssText = `
    position: fixed;
    border: 2px dashed #fff;
    box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
    z-index: 2147483646;
    display: none;
    pointer-events: none;
  `;
  document.body.appendChild(screenBox);

  screenOverlay.addEventListener("mousedown", startSelection);
  document.addEventListener("keydown", handleScreenEscape);
}

function startSelection(e) {
  startSX = e.clientX;
  startSY = e.clientY;
  screenBox.style.display = "block";

  const updateSelection = (ev) => {
    const width = Math.abs(ev.clientX - startSX);
    const height = Math.abs(ev.clientY - startSY);
    const left = Math.min(ev.clientX, startSX);
    const top = Math.min(ev.clientY, startSY);

    screenBox.style.left = left + "px";
    screenBox.style.top = top + "px";
    screenBox.style.width = width + "px";
    screenBox.style.height = height + "px";
  };

  const endSelection = (ev) => {
    document.removeEventListener("mousemove", updateSelection);
    document.removeEventListener("mouseup", endSelection);

    const width = Math.abs(ev.clientX - startSX);
    const height = Math.abs(ev.clientY - startSY);

    // If selection is too small, cancel
    if (width < 50 || height < 50) {
      screenBox.style.display = "none";
      return;
    }

    // Capture the region
    initEditor(
      Math.min(ev.clientX, startSX),
      Math.min(ev.clientY, startSY),
      width,
      height,
    );
  };

  document.addEventListener("mousemove", updateSelection);
  document.addEventListener("mouseup", endSelection);
}

function initEditor(x, y, w, h) {
  editorMode = true;
  screenOverlay.remove(); // Remove selection overlay

  // Create Canvas Editor
  screenCanvas = document.createElement("canvas");
  screenCanvas.width = w;
  screenCanvas.height = h;
  screenCanvas.style.cssText = `
    position: fixed;
    left: ${x}px;
    top: ${y}px;
    z-index: 2147483647;
    box-shadow: 0 0 20px rgba(0,0,0,0.5);
    cursor: crosshair;
  `;
  document.body.appendChild(screenCanvas);
  screenCtx = screenCanvas.getContext("2d");

  // Capture existing content under region (not perfect but good for simple bg)
  // Ideally we use chrome.tabs.captureVisibleTab in popup, but here we just leave transparent
  // or we can white-fill. For now transparent so user sees content.
  // Actually, to draw ON the screenshot, we need the screenshot image.
  // Since we can't easily get full screenshot in content script without messaging background,
  // we will just treat this canvas as an overlay annotation layer.
  // User sees the page behind it. When saving, we might need a trick.
  // TRICK: We will tell popup to Capture Visible Tab, then crop it.
  // But popup is closed. Background script is needed for capture.

  // For "Fast Edit", we'll just allow drawing on top, then screen capture the whole thing?
  // No, that captures the UI too.

  // Better approach for V1: Just transparent canvas for drawing.
  // Final save: We send coordinates and annotation commands to background/popup to merge?
  // Too complex.

  // Simplest "Lightshot" clone approach:
  // 1. Freeze page (user can't scroll).
  // 2. We already selected region.
  // 3. Keep drawing on canvas showing page behind.
  // 4. When "Save", we hide toolbar -> message background to capture visible tab -> crop to region.

  // Create Toolbar
  screenToolbar = document.createElement("div");
  screenToolbar.innerHTML = `
    <div style="display:flex; gap:8px;">
      <button id="dp-tool-pen" title="Pen">✏️</button>
      <button id="dp-tool-box" title="Box">⬜</button>
      <button id="dp-tool-arrow" title="Arrow">↗️</button>
      <button id="dp-tool-text" title="Text">T</button>
    </div>
    <div style="width:1px; background:#555; margin:0 4px;"></div>
    <div style="display:flex; gap:8px;">
      <button id="dp-action-close" title="Cancel">❌</button>
      <button id="dp-action-save" title="Save" style="background:#34C759; border-color:#34C759;">💾</button>
    </div>
  `;
  screenToolbar.style.cssText = `
    position: fixed;
    left: ${x}px;
    top: ${y + h + 10}px;
    background: #222;
    padding: 8px;
    border-radius: 8px;
    display: flex;
    z-index: 2147483647;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  `;

  // Adjust toolbar position if off screen
  if (y + h + 60 > window.innerHeight) {
    screenToolbar.style.top = y - 50 + "px";
  }

  // Style buttons
  const buttons = screenToolbar.querySelectorAll("button");
  buttons.forEach((btn) => {
    btn.style.cssText += `
      background: #333; color: white; border: 1px solid #444; 
      padding: 6px 10px; border-radius: 4px; cursor: pointer; font-size: 16px;
    `;
    btn.addEventListener("mouseover", () => (btn.style.background = "#444"));
    btn.addEventListener("mouseout", () => {
      if (btn.id !== "dp-action-save") btn.style.background = "#333";
    });
  });

  document.body.appendChild(screenToolbar);

  // Tool Logic
  screenToolbar.querySelector("#dp-tool-pen").onclick = () =>
    (currentTool = "pen");
  screenToolbar.querySelector("#dp-tool-box").onclick = () =>
    (currentTool = "box");
  screenToolbar.querySelector("#dp-tool-arrow").onclick = () =>
    (currentTool = "arrow");
  screenToolbar.querySelector("#dp-tool-text").onclick = () =>
    (currentTool = "text");

  screenToolbar.querySelector("#dp-action-close").onclick = closeScreenshot;
  screenToolbar.querySelector("#dp-action-save").onclick = () =>
    saveScreenshot(x, y, w, h);

  // Drawing Logic
  let isPaint = false;
  let lastX, lastY;

  screenCanvas.addEventListener("mousedown", (e) => {
    // Text tool: show input box
    if (currentTool === "text") {
      showTextInput(e.offsetX, e.offsetY, x, y);
      return;
    }

    isPaint = true;
    lastX = e.offsetX;
    lastY = e.offsetY;
    screenCtx.beginPath();
    screenCtx.strokeStyle = "#FF3B30"; // Red
    screenCtx.lineWidth = 3;
    screenCtx.lineCap = "round";
    screenCtx.lineJoin = "round";
  });

  screenCanvas.addEventListener("mousemove", (e) => {
    if (!isPaint) return;

    if (currentTool === "pen") {
      screenCtx.lineTo(e.offsetX, e.offsetY);
      screenCtx.stroke();
    }
    // For box/arrow we need to clear and redraw (layering needed ideally, but simple for now)
    // Simpler: Just draw immediately for pen. For Box/Arrow, wait for mouseup?
    // Correct way is temp canvas or redraw. Let's do simple Pen only for "Fast Edit" v1.
    // Wait, user asked for "Fast Edit" -> Box and Arrow are crucial.
    // Let's implement Box on MouseUp (simple drag to draw box).
  });

  screenCanvas.addEventListener("mouseup", (e) => {
    if (!isPaint) return;
    isPaint = false;

    const endX = e.offsetX;
    const endY = e.offsetY;

    screenCtx.strokeStyle = "#FF3B30";
    screenCtx.lineWidth = 3;

    if (currentTool === "box") {
      screenCtx.strokeRect(
        Math.min(lastX, endX),
        Math.min(lastY, endY),
        Math.abs(endX - lastX),
        Math.abs(endY - lastY),
      );
    } else if (currentTool === "arrow") {
      drawArrow(screenCtx, lastX, lastY, endX, endY);
    }
  });
}

function drawArrow(ctx, fromx, fromy, tox, toy) {
  const headlen = 15;
  const dx = tox - fromx;
  const dy = toy - fromy;
  const angle = Math.atan2(dy, dx);
  ctx.beginPath();
  ctx.moveTo(fromx, fromy);
  ctx.lineTo(tox, toy);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(
    tox - headlen * Math.cos(angle - Math.PI / 6),
    toy - headlen * Math.sin(angle - Math.PI / 6),
  );
  ctx.lineTo(tox, toy);
  ctx.lineTo(
    tox - headlen * Math.cos(angle + Math.PI / 6),
    toy - headlen * Math.sin(angle + Math.PI / 6),
  );
  ctx.stroke();
}

// Text Input for Screenshot Editor
function showTextInput(canvasX, canvasY, regionX, regionY) {
  // Inject Roboto font if not already
  if (!document.getElementById("devpower-roboto-font")) {
    const link = document.createElement("link");
    link.id = "devpower-roboto-font";
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap";
    document.head.appendChild(link);
  }

  // Create input element
  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Type text...";
  input.style.cssText = `
    position: fixed;
    left: ${regionX + canvasX}px;
    top: ${regionY + canvasY}px;
    z-index: 2147483648;
    font-family: 'Roboto', sans-serif;
    font-size: 18px;
    font-weight: 700;
    color: #FF3B30;
    background: rgba(255,255,255,0.9);
    border: 2px solid #FF3B30;
    border-radius: 4px;
    padding: 4px 8px;
    min-width: 150px;
    outline: none;
  `;
  document.body.appendChild(input);
  input.focus();

  const commitText = () => {
    const text = input.value.trim();
    if (text && screenCtx) {
      screenCtx.font = "bold 18px 'Roboto', sans-serif";
      screenCtx.fillStyle = "#FF3B30";
      screenCtx.fillText(text, canvasX, canvasY + 18); // +18 for baseline
    }
    input.remove();
  };

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      commitText();
    } else if (e.key === "Escape") {
      input.remove();
    }
  });

  input.addEventListener("blur", commitText);
}

function saveScreenshot(x, y, w, h) {
  // Hide UI
  screenToolbar.style.display = "none";
  screenBox.style.display = "none"; // Hide dashed box

  // We need to capture the visible tab including our canvas
  // We can't do that from content script easily without `html2canvas` (heavy).
  // Native Chrome API `captureVisibleTab` only captures the web content, NOT the overlays injected by content script?
  // actually `captureVisibleTab` DOES capture everything rendered in the tab including content scripts.

  // So:
  // 1. Wait a moment for UI to hide.
  // 2. Send message to background to capture.
  // 3. Background sends back dataURL.
  // 4. We crop it using a temporary canvas.
  // 5. Download.

  setTimeout(() => {
    chrome.runtime.sendMessage({ action: "captureTab" }, (dataUrl) => {
      if (!dataUrl) {
        alert("Capture failed");
        closeScreenshot();
        return;
      }

      const img = new Image();
      img.onload = () => {
        const cropCanvas = document.createElement("canvas");
        cropCanvas.width = w;
        cropCanvas.height = h;
        const cropCtx = cropCanvas.getContext("2d");

        // Handle High DPI (Retina)
        // captureVisibleTab returns image in physical pixels.
        // window.devicePixelRatio might be needed.
        const dpr = window.devicePixelRatio || 1;
        // x, y, w, h are CSS pixels. Source image is likely scale * CSS pixels.

        cropCtx.drawImage(img, x * dpr, y * dpr, w * dpr, h * dpr, 0, 0, w, h);

        const link = document.createElement("a");
        link.download = `screenshot-${Date.now()}.png`;
        link.href = cropCanvas.toDataURL();
        link.click();

        closeScreenshot();
      };
      img.src = dataUrl;
    });
  }, 100);
}

function closeScreenshot() {
  screenshotActive = false;
  screenBox?.remove();
  screenOverlay?.remove();
  screenCanvas?.remove();
  screenToolbar?.remove();
  document.removeEventListener("keydown", handleScreenEscape);
}

function handleScreenEscape(e) {
  if (e.key === "Escape" && screenshotActive) {
    closeScreenshot();
  }
}

// ==========================================
// Media Scanner
// ==========================================
function scanPageMedia() {
  const media = [];

  // Images
  document.querySelectorAll("img").forEach((img) => {
    if (
      img.src &&
      img.src.startsWith("http") &&
      img.width > 50 &&
      img.height > 50
    ) {
      media.push({ type: "image", src: img.src });
    }
  });

  // Videos
  document.querySelectorAll("video").forEach((vid) => {
    if (vid.src && vid.src.startsWith("http")) {
      media.push({ type: "video", src: vid.src });
    }
    // Check sources
    vid.querySelectorAll("source").forEach((src) => {
      if (src.src && src.src.startsWith("http")) {
        media.push({ type: "video", src: src.src });
      }
    });
  });

  // Unique only
  const unique = Array.from(new Set(media.map((a) => a.src))).map((src) => {
    const type = media.find((a) => a.src === src).type;
    return { type, src };
  });

  return unique;
}

// ==========================================
// Message Listener
// ==========================================
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case "ping":
      sendResponse({ status: "pong" });
      break;
    case "scanTech":
      sendResponse({ technologies: detectTechStack() });
      break;
    case "whatFont":
      activateWhatFont();
      sendResponse({ status: "active" });
      break;
    case "pageRuler":
      activatePageRuler();
      sendResponse({ status: "active" });
      break;
    case "fakeFill":
      sendResponse({ count: fillForms() });
      break;
    case "cssViewer":
      activateCSSViewer();
      sendResponse({ status: "active" });
      break;

    // New Actions
    case "startRegionCapture":
      activateRegionCapture();
      sendResponse({ status: "active" });
      break;
    case "scanMedia":
      sendResponse({ media: scanPageMedia() });
      break;

    case "checkLinks":
      checkLinks().then((result) => sendResponse(result));
      return true;
    default:
      sendResponse({ status: "unknown action" });
      break;
  }
  return true;
});

// ==========================================
// FB Invisible Text Config Sync
// ==========================================
if (
  window.location.hostname.includes("facebook.com") ||
  window.location.hostname.includes("messenger.com")
) {
  function syncFbInvisibleSettings() {
    if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.local.get(["fbInvisibleIdx"], (result) => {
        const enabled = result.fbInvisibleIdx !== false; // Default true
        window.postMessage({ type: "FB_INVISIBLE_CONFIG", enabled }, "*");
      });
    }
  }

  // Initial sync
  syncFbInvisibleSettings();

  // Listen for changes
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === "local" && changes.fbInvisibleIdx) {
      syncFbInvisibleSettings();
    }
  });
}
