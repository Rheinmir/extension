/**
 * FB Video Downloader - Video Extractor
 * Injected into page to read React Fiber props (like Easy Download)
 */

(function () {
  // Find video URL from React Fiber
  function findVideoFromReactFiber() {
    const videos = document.querySelectorAll("video");
    let videoUrl = null;

    for (let i = videos.length - 1; i >= 0; i--) {
      const video = videos[i];

      // Skip hidden/zero-height videos
      if (video.offsetHeight === 0) continue;

      // Find React Fiber key
      const keys = Object.keys(video);
      let fiberKey = "";
      for (let j = 0; j < keys.length; j++) {
        if (keys[j].indexOf("__reactFiber") !== -1) {
          fiberKey = keys[j].split("__reactFiber")[1];
          break;
        }
      }

      if (!fiberKey) continue;

      // Try different paths to find video URL in React props
      const paths = [
        // Path 1: Deep nested props
        () =>
          video.parentElement.parentElement.parentElement.parentElement[
            "__reactProps" + fiberKey
          ]?.children[0]?.props?.children?.props?.implementations[1]?.data
            ?.hdSrc,
        () =>
          video.parentElement.parentElement.parentElement.parentElement[
            "__reactProps" + fiberKey
          ]?.children[0]?.props?.children?.props?.implementations[1]?.data
            ?.sdSrc,
        () =>
          video.parentElement.parentElement.parentElement.parentElement[
            "__reactProps" + fiberKey
          ]?.children?.props?.children?.props?.implementations[1]?.data?.hdSrc,
        () =>
          video.parentElement.parentElement.parentElement.parentElement[
            "__reactProps" + fiberKey
          ]?.children?.props?.children?.props?.implementations[1]?.data?.sdSrc,
        // Path 2: Fiber return stateNode
        () =>
          video["__reactFiber" + fiberKey]?.return?.stateNode?.props?.videoData
            ?.$1?.hd_src,
        () =>
          video["__reactFiber" + fiberKey]?.return?.stateNode?.props?.videoData
            ?.$1?.sd_src,
        // Path 3: Direct video src patterns in props
        () => findVideoInObject(video["__reactFiber" + fiberKey], 0),
      ];

      for (const pathFn of paths) {
        try {
          const url = pathFn();
          if (url && (url.includes(".mp4") || url.includes("fbcdn"))) {
            videoUrl = url;
            break;
          }
        } catch (e) {}
      }

      if (videoUrl) break;
    }

    return videoUrl;
  }

  // Recursively find video URL in object
  function findVideoInObject(obj, depth) {
    if (depth > 10 || !obj) return null;

    if (typeof obj === "string") {
      if (
        (obj.includes("hd_src") ||
          obj.includes("sd_src") ||
          obj.includes(".mp4")) &&
        obj.includes("fbcdn")
      ) {
        return obj;
      }
      return null;
    }

    if (typeof obj !== "object") return null;

    // Check common keys
    const videoKeys = [
      "hdSrc",
      "sdSrc",
      "hd_src",
      "sd_src",
      "browser_native_hd_url",
      "browser_native_sd_url",
      "playable_url",
    ];
    for (const key of videoKeys) {
      if (
        obj[key] &&
        typeof obj[key] === "string" &&
        obj[key].includes("fbcdn")
      ) {
        return obj[key];
      }
    }

    // Skip large arrays
    if (Array.isArray(obj) && obj.length > 50) return null;

    // Recurse into children/props
    const keysToCheck = [
      "children",
      "props",
      "memoizedProps",
      "stateNode",
      "return",
      "videoData",
      "data",
      "implementations",
    ];
    for (const key of keysToCheck) {
      if (obj[key]) {
        const result = findVideoInObject(obj[key], depth + 1);
        if (result) return result;
      }
    }

    return null;
  }

  // Get Reel video ID from DOM
  function getReelVideoId() {
    // Method 1: data-video-id attribute
    const reelContainerClass = "k4urcfbm l9j0dhe7 datstx6m d6rk862h bp9cbjyn";
    const containers = document.getElementsByClassName(reelContainerClass);
    if (containers.length > 0) {
      const videoId = containers[0].getAttribute("data-video-id");
      if (videoId) return videoId;
    }

    // Method 2: Find in URL
    const match = location.href.match(/\/reel\/(\d+)/);
    if (match) return match[1];

    // Method 3: Look for video-id in any element
    const elementsWithVideoId = document.querySelectorAll("[data-video-id]");
    for (const el of elementsWithVideoId) {
      const id = el.getAttribute("data-video-id");
      if (id) return id;
    }

    return null;
  }

  // Main extraction
  function extractVideo() {
    const isReel = location.href.includes("/reel");
    const isStory = location.href.includes("/stories");

    // Try React Fiber first
    const videoUrl = findVideoFromReactFiber();
    if (videoUrl) {
      return { type: "url", url: videoUrl };
    }

    // For Reels, get video ID
    if (isReel) {
      const videoId = getReelVideoId();
      if (videoId) {
        return { type: "videoId", videoId: videoId };
      }
    }

    return null;
  }

  // Store result in document head for content script to read
  const result = extractVideo();
  document.head.setAttribute(
    "fb-video-data",
    JSON.stringify(result || { error: "not found" }),
  );
})();
