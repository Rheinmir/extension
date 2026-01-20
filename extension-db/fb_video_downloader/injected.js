/**
 * FB Video Downloader - Injected Script v5
 * Track the currently PLAYING video
 */

(function () {
  if (window.__fbVideoInterceptorLoaded) return;
  window.__fbVideoInterceptorLoaded = true;

  // Track the most recently played video
  let currentPlayingVideoUrl = null;
  let lastVideoUrls = [];

  function cleanUrl(url) {
    if (!url) return null;
    return url
      .replace(/\\u002F/g, "/")
      .replace(/\\u003A/g, ":")
      .replace(/\\u0025/g, "%")
      .replace(/\\u0026/g, "&")
      .replace(/\\\//g, "/");
  }

  function isValidVideoUrl(url) {
    if (!url || url.startsWith("blob:")) return false;
    if (!url.includes("fbcdn.net")) return false;
    return url.includes(".mp4");
  }

  function reportVideo(url, isPlaying = false) {
    url = cleanUrl(url);
    if (!isValidVideoUrl(url)) return;

    try {
      url = decodeURIComponent(url);
    } catch (e) {}

    // Skip duplicates
    if (lastVideoUrls.includes(url)) return;
    lastVideoUrls.push(url);

    // Mark as current if it's being played
    if (isPlaying) {
      currentPlayingVideoUrl = url;
    }

    window.postMessage(
      {
        type: "FB_VIDEO_FOUND",
        videoInfo: {
          url,
          type: location.href.includes("/reel") ? "reel" : "video",
          quality: "HD",
          hasAudio: true,
        },
      },
      "*",
    );
  }

  // Listen for request to get current video
  window.addEventListener("message", (event) => {
    if (event.source !== window) return;
    if (event.data.type === "GET_CURRENT_VIDEO") {
      // Send the most recently played/found video
      const url =
        currentPlayingVideoUrl || lastVideoUrls[lastVideoUrls.length - 1];
      window.postMessage({ type: "FB_CURRENT_VIDEO_URL", url }, "*");
    }
  });

  // Search for videos in data
  function searchForVideoUrls(data, isFromVideoElement = false) {
    if (!data) return;

    const text = typeof data === "string" ? data : JSON.stringify(data);

    const patterns = [
      /"browser_native_hd_url"\s*:\s*"([^"]+\.mp4[^"]*)"/gi,
      /"browser_native_sd_url"\s*:\s*"([^"]+\.mp4[^"]*)"/gi,
      /"hd_src"\s*:\s*"([^"]+\.mp4[^"]*)"/gi,
      /"sd_src"\s*:\s*"([^"]+\.mp4[^"]*)"/gi,
      /"playable_url_quality_hd"\s*:\s*"([^"]+\.mp4[^"]*)"/gi,
      /"playable_url"\s*:\s*"([^"]+\.mp4[^"]*)"/gi,
    ];

    patterns.forEach((pattern) => {
      let match;
      pattern.lastIndex = 0;
      while ((match = pattern.exec(text)) !== null) {
        reportVideo(match[1], isFromVideoElement);
      }
    });
  }

  // Monitor video elements for play events
  function monitorVideoElements() {
    const videos = document.querySelectorAll("video");
    videos.forEach((video) => {
      if (video.__fbDownloaderMonitored) return;
      video.__fbDownloaderMonitored = true;

      video.addEventListener("play", () => {
        // When a video starts playing, search for its URL
        // The URL loaded around this time is likely the current video
        const html = document.documentElement.innerHTML;
        searchForVideoUrls(html, true);
      });
    });
  }

  // Observe for new video elements
  const observer = new MutationObserver(() => {
    monitorVideoElements();
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // Intercept XHR
  const originalXHRSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.send = function () {
    this.addEventListener("load", function () {
      try {
        if (this.responseText?.includes(".mp4")) {
          searchForVideoUrls(this.responseText);
        }
      } catch (e) {}
    });
    return originalXHRSend.apply(this, arguments);
  };

  // Intercept fetch
  const originalFetch = window.fetch;
  window.fetch = async function (input, init) {
    const response = await originalFetch.apply(this, arguments);
    try {
      const clone = response.clone();
      clone
        .text()
        .then((text) => {
          if (text.includes(".mp4")) searchForVideoUrls(text);
        })
        .catch(() => {});
    } catch (e) {}
    return response;
  };

  // Initial setup
  monitorVideoElements();

  // Initial scan
  setTimeout(() => {
    const html = document.documentElement.innerHTML;
    if (html.includes(".mp4")) searchForVideoUrls(html);
  }, 2000);
})();
