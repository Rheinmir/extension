# Workflows

## Development

### Building & Running
Chrome extensions don't require a build step. Simply load the unpacked extension.

**Load Extension**:
1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `fb_video_downloader` folder

### Testing
- **Popup Logic**: Click extension icon on any Facebook page
- **Content Script**: Navigate to Facebook video/reel and open DevTools console
- **Logs**:
  - Popup logs: Right-click popup → Inspect → Console
  - Content script logs: Inspect Facebook page → Console
  - Background logs: `chrome://extensions/` → Service worker → Inspect

### Debug Flow
1. Open Facebook video/reel page
2. Open DevTools console (look for `[FB Downloader]` logs)
3. Click extension icon
4. Check popup DevTools for errors

## Deployment
1. Bump version in `manifest.json`
2. Zip the extension folder (exclude `.git`, `rag/`)
3. Upload to Chrome Web Store Developer Dashboard

## Common Issues

| Issue | Solution |
|-------|----------|
| "Cần đăng nhập Facebook" | User needs to log in to Facebook |
| "Không thể lấy access token" | business.facebook.com blocked or token expired |
| "Không tìm thấy video" | Page not fully loaded; try reload |
