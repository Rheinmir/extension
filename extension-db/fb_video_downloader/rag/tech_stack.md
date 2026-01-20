# Tech Stack

## Core Technologies

| Category | Technology | Version/Notes |
|----------|------------|---------------|
| **Platform** | Chrome Extension | Manifest V3 |
| **Languages** | JavaScript (ES6+), HTML5, CSS3 | Vanilla, no frameworks |
| **APIs** | Chrome Extensions API | scripting, downloads, cookies, tabs |
| **External** | Facebook Graph API | v13.0 |
| **Design** | Custom CSS | Macism (macOS-inspired) design system |

## Chrome APIs Used

| API | Purpose |
|-----|---------|
| `chrome.scripting` | Execute video_extractor.js in MAIN world |
| `chrome.downloads` | Download video files |
| `chrome.cookies` | Get Facebook auth cookies (c_user, xs) |
| `chrome.tabs` | Query active tab URL |
| `chrome.runtime` | Popup ↔ Background messaging |

## Facebook APIs

| API | Purpose |
|-----|---------|
| Graph API `/v13.0/{video_id}` | Get video source URL |
| business.facebook.com | Extract access token |

## Design System - Macism

### Colors (CSS Variables)
```css
--accent: #1877f2          /* Facebook Blue */
--accent-hover: #0d5bbd
--success: #34C759         /* Green - success states */
--danger: #FF3B30          /* Red - errors */
--bg-glass: rgba(255,255,255,0.72)  /* Glassmorphism */
```

### Typography
```css
font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif;
```

### Effects
```css
backdrop-filter: blur(20px);
transition: all 0.2s cubic-bezier(0.25, 0.1, 0.25, 1);
```

## File Structure

| File | Purpose |
|------|---------|
| `popup.html` | UI structure with status, button, result |
| `popup.js` | Download button logic, result display |
| `style.css` | Macism design system |
| `background.js` | Graph API, cookies, downloads |
| `content.js` | Page scanning, URL pattern matching |
| `video_extractor.js` | React Fiber video extraction |
| `manifest.json` | Extension config (MV3) |
