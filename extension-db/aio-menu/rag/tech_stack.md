# Tech Stack

## Core Technologies

| Category | Technology | Version/Notes |
|----------|------------|---------------|
| **Platform** | Chrome Extension | Manifest V3 |
| **Languages** | JavaScript (ES6+), HTML5, CSS3 | Vanilla, no frameworks |
| **APIs** | Chrome Extensions API | tabs, storage, windows, contentSettings |
| **Design** | Custom CSS | Macism (macOS-inspired) design system |

## Chrome APIs Used

| API | Purpose |
|-----|---------|
| `chrome.tabs` | Query active tab, create new tabs, reload |
| `chrome.storage.sync` | Persist todo list across sessions |
| `chrome.windows` | Resize browser window (Window Resizer) |
| `chrome.contentSettings.javascript` | Toggle JS for sites |
| `chrome.runtime.sendMessage` | Popup ↔ Content Script communication |
| `chrome.scripting` | Execute scripts in page context |

## Web APIs Used

| API | Purpose |
|-----|---------|
| `EyeDropper` | Color picking from screen |
| `navigator.clipboard` | Copy to clipboard |
| `URL` | URL parsing |
| `btoa`/`atob` | Base64 encoding/decoding |
| `getComputedStyle` | WhatFont - read font properties |

## Design System - Macism

### Colors (CSS Variables)
```css
--accent: #007AFF          /* Blue - primary actions */
--success: #34C759         /* Green - success states */
--danger: #FF3B30          /* Red - destructive actions */
--warning: #FF9500         /* Orange - warnings */
--bg-glass: rgba(255,255,255,0.72)  /* Glassmorphism */
--text-primary: #1d1d1f
--text-secondary: #6e6e73
```

### Typography
```css
font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif;
```

### Effects
```css
/* Glassmorphism */
backdrop-filter: blur(20px);
-webkit-backdrop-filter: blur(20px);

/* Spring Animation */
transition: all 0.2s cubic-bezier(0.25, 0.1, 0.25, 1);

/* Bounce Animation */
transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
```

## File Structure

| File | Size | Purpose |
|------|------|---------|
| `popup.html` | ~6KB | UI structure with 4 tabs |
| `popup.js` | ~9KB | All popup feature logic |
| `style.css` | ~12KB | Macism design system |
| `content.js` | ~10KB | Page interaction features |
| `manifest.json` | ~0.7KB | Extension configuration |
