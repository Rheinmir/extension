# Business Logic

## Core Feature: Video Download

### Goal
Allow users to download Facebook videos and Reels with a single click.

### Supported Content
- Facebook Video posts (`/videos/`, `/watch/`)
- Facebook Reels (`/reel/{id}`)

## Video Extraction Methods

### Method 1: React Fiber (Primary)
Facebook uses React. Video source URLs are stored in React component props.

**Flow**:
1. Find `<video>` elements on page
2. Locate `__reactFiber{key}` property
3. Traverse props to find `hdSrc`, `sdSrc`, `browser_native_hd_url`
4. Priority: HD > SD

**Keys searched**:
- `implementations[1].data.hdSrc`
- `return.stateNode.props.videoData.$1.hd_src`
- `playable_url`, `browser_native_hd_url`

### Method 2: Graph API (Fallback)
Use Facebook's official API when React Fiber method fails.

**Flow**:
1. Extract video ID from URL or page
2. Get Facebook cookies (`c_user`, `xs`)
3. Fetch business.facebook.com to extract access token (EAAG...)
4. Call Graph API: `graph.facebook.com/v13.0/{id}?fields=source`
5. Return source URL

### Method 3: HTML Pattern Matching (Last Resort)
Scan page HTML for video URL patterns.

**Patterns matched**:
- `"browser_native_hd_url":"..."`
- `"playable_url_quality_hd":"..."`
- `"hd_src":"..."`

## URL Processing

### URL Cleanup
Facebook encodes URLs with escape sequences:
```javascript
url.replace(/\\u002F/g, "/")
   .replace(/\\u003A/g, ":")
   .replace(/\\u0025/g, "%")
```

### Validation
URL must contain:
- `fbcdn` (Facebook CDN)
- `.mp4` extension

## Download Process

1. Get video source URL
2. Generate filename: `fb_video_{timestamp}.mp4`
3. Use `chrome.downloads.download()` with `saveAs: true`
4. User selects save location

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| Cần đăng nhập Facebook | Missing cookies | Log in to Facebook |
| Không thể lấy access token | Token extraction failed | Refresh page, re-login |
| Không tìm thấy video | No video on page | Navigate to actual video page |

## UI/UX Design - Macism Style

### Design Principles
- **Glassmorphism**: Translucent backgrounds with backdrop blur
- **SF Pro Typography**: Apple system font stack
- **Smooth Animations**: Spring-based easing curves
- **Facebook Blue**: Primary accent color (#1877f2)
- **Clean Header**: Simple title with version badge (no traffic lights)
