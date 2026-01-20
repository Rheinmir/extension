/**
 * FB Video Downloader - Content Script v8
 * Use Reel ID from URL to find correct video
 */

(function () {
  function isExtensionValid() {
    try {
      return !!(chrome.runtime && chrome.runtime.id);
    } catch (e) {
      return false;
    }
  }

  function safeSendMessage(message) {
    if (!isExtensionValid()) return;
    try {
      chrome.runtime.sendMessage(message).catch(() => {});
    } catch (e) {}
  }

  if (window.__fbVideoDownloaderInjected) return;
  window.__fbVideoDownloaderInjected = true;

  // Inject page script
  if (isExtensionValid()) {
    try {
      const script = document.createElement("script");
      script.src = chrome.runtime.getURL("injected.js");
      script.onload = function () {
        this.remove();
      };
      (document.head || document.documentElement).appendChild(script);
    } catch (e) {}
  }

  // Message from injected script
  window.addEventListener("message", (event) => {
    if (event.source !== window || !isExtensionValid()) return;
    if (event.data.type === "FB_VIDEO_FOUND") {
      safeSendMessage({ action: "addVideo", videoInfo: event.data.videoInfo });
    }
  });

  if (isExtensionValid()) {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (!isExtensionValid()) return;

      if (message.action === "getCurrentVideo") {
        // Get Reel ID from URL
        const reelId = getReelIdFromUrl();
        console.log("[FB Downloader] Looking for Reel ID:", reelId);

        // Find video URL for this specific Reel
        const videoUrl = findVideoByReelId(reelId);

        if (videoUrl) {
          console.log(
            "[FB Downloader] Found video for Reel:",
            videoUrl.substring(0, 60),
          );
          sendResponse({
            videoUrl: videoUrl,
            type: "reel",
            quality: "HD",
            hasAudio: true,
            reelId: reelId,
          });
        } else {
          // Fallback - get any video
          const fallback = findAnyVideoUrl();
          sendResponse(
            fallback
              ? {
                  videoUrl: fallback,
                  type: location.href.includes("/reel") ? "reel" : "video",
                  quality: "HD",
                  hasAudio: true,
                }
              : null,
          );
        }
        return true;
      }

      if (message.action === "scanVideos") {
        scanAllVideos();
        sendResponse({ scanned: true });
        return true;
      }
    });
  }

  /**
   * Get Reel ID from current URL
   */
  function getReelIdFromUrl() {
    const match = location.href.match(/\/reel\/(\d+)/);
    return match ? match[1] : null;
  }

  /**
   * Find video URL by matching Reel ID in page source
   */
  function findVideoByReelId(reelId) {
    if (!reelId) return null;

    const html = document.documentElement.innerHTML;

    // Pattern 1: Look for video URL near the reel ID
    // Facebook often has: "id":"REEL_ID"..."playable_url":"VIDEO_URL"
    const patterns = [
      // ID followed by video URL
      new RegExp(
        `"${reelId}"[^}]{0,2000}"browser_native_hd_url"\\s*:\\s*"([^"]+\\.mp4[^"]*)"`,
        "i",
      ),
      new RegExp(
        `"${reelId}"[^}]{0,2000}"browser_native_sd_url"\\s*:\\s*"([^"]+\\.mp4[^"]*)"`,
        "i",
      ),
      new RegExp(
        `"${reelId}"[^}]{0,2000}"playable_url_quality_hd"\\s*:\\s*"([^"]+\\.mp4[^"]*)"`,
        "i",
      ),
      new RegExp(
        `"${reelId}"[^}]{0,2000}"playable_url"\\s*:\\s*"([^"]+\\.mp4[^"]*)"`,
        "i",
      ),
      new RegExp(
        `"${reelId}"[^}]{0,2000}"hd_src"\\s*:\\s*"([^"]+\\.mp4[^"]*)"`,
        "i",
      ),
      new RegExp(
        `"${reelId}"[^}]{0,2000}"sd_src"\\s*:\\s*"([^"]+\\.mp4[^"]*)"`,
        "i",
      ),
      // Video URL followed by ID
      new RegExp(
        `"browser_native_hd_url"\\s*:\\s*"([^"]+\\.mp4[^"]*)"[^}]{0,2000}"${reelId}"`,
        "i",
      ),
      new RegExp(
        `"playable_url"\\s*:\\s*"([^"]+\\.mp4[^"]*)"[^}]{0,2000}"${reelId}"`,
        "i",
      ),
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) {
        const url = cleanUrl(match[1]);
        if (url) {
          console.log("[FB Downloader] Matched by Reel ID pattern");
          return url;
        }
      }
    }

    // Pattern 2: Find all video objects and look for matching ID
    // Look for video_id or post_id matching reel ID
    const videoIdPattern = new RegExp(
      `"(?:video_id|post_id|id)"\\s*:\\s*"?${reelId}"?[^}]*"(?:browser_native_hd_url|playable_url|hd_src)"\\s*:\\s*"([^"]+)"`,
      "gi",
    );
    const match = html.match(videoIdPattern);
    if (match) {
      for (const m of match) {
        const urlMatch = m.match(/"([^"]+\.mp4[^"]*)"/);
        if (urlMatch) {
          const url = cleanUrl(urlMatch[1]);
          if (url) return url;
        }
      }
    }

    return null;
  }

  /**
   * Fallback: find any video URL
   */
  function findAnyVideoUrl() {
    const html = document.documentElement.innerHTML;

    const patterns = [
      /"browser_native_hd_url"\s*:\s*"([^"]+\.mp4[^"]*)"/i,
      /"playable_url_quality_hd"\s*:\s*"([^"]+\.mp4[^"]*)"/i,
      /"hd_src"\s*:\s*"([^"]+\.mp4[^"]*)"/i,
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) {
        return cleanUrl(match[1]);
      }
    }
    return null;
  }

  function cleanUrl(url) {
    if (!url) return null;
    url = url
      .replace(/\\u002F/g, "/")
      .replace(/\\u003A/g, ":")
      .replace(/\\u0025/g, "%")
      .replace(/\\u0026/g, "&")
      .replace(/\\\//g, "/");
    try {
      url = decodeURIComponent(url);
    } catch (e) {}
    return url.includes("fbcdn") && url.includes(".mp4") ? url : null;
  }

  function scanAllVideos() {
    const html = document.documentElement.innerHTML;
    const pattern = /"(https?:[^"]*fbcdn[^"]*\.mp4[^"]*)"/gi;
    const found = new Set();

    let match;
    while ((match = pattern.exec(html)) !== null) {
      const url = cleanUrl(match[1]);
      if (url && !url.includes("bytestart") && !found.has(url)) {
        found.add(url);
        safeSendMessage({
          action: "addVideo",
          videoInfo: {
            url,
            type: location.href.includes("/reel") ? "reel" : "video",
            quality: url.includes("_hd") ? "HD" : "SD",
            hasAudio: true,
          },
        });
      }
    }
  }

  // Initial scan
  setTimeout(() => {
    if (isExtensionValid()) scanAllVideos();
  }, 2000);
})();
