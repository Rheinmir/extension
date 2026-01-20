/**
 * FB Video Downloader - Background v6
 * Uses Facebook Graph API + Cookies (like Easy Download)
 */

let cUser = null;
let xs = null;
let accessToken = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getVideoByGraphApi") {
    getVideoByGraphApi(message.videoId)
      .then((result) => sendResponse(result))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true;
  }

  if (message.action === "downloadUrl") {
    downloadVideo(message.url)
      .then((result) => sendResponse(result))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true;
  }

  if (message.action === "videoFound") {
    // Directly open the video URL for download
    if (message.url) {
      downloadVideo(message.url)
        .then((result) => sendResponse(result))
        .catch((err) => sendResponse({ success: false, error: err.message }));
    } else if (message.videoId) {
      getVideoByGraphApi(message.videoId)
        .then((result) => sendResponse(result))
        .catch((err) => sendResponse({ success: false, error: err.message }));
    }
    return true;
  }
});

/**
 * Get cookies from Facebook
 */
async function getCookies() {
  try {
    const cUserCookie = await chrome.cookies.get({
      url: "https://www.facebook.com",
      name: "c_user",
    });
    const xsCookie = await chrome.cookies.get({
      url: "https://www.facebook.com",
      name: "xs",
    });

    cUser = cUserCookie?.value || null;
    xs = xsCookie?.value || null;

    return !!(cUser && xs);
  } catch (e) {
    console.error("[FB Downloader] Cookie error:", e);
    return false;
  }
}

/**
 * Get Facebook access token using cookies
 */
async function getAccessToken() {
  if (accessToken) return accessToken;

  const hasCookies = await getCookies();
  if (!hasCookies) {
    throw new Error("Cần đăng nhập Facebook");
  }

  try {
    const response = await fetch(
      "https://business.facebook.com/business_locations",
      {
        method: "GET",
        headers: {
          "Content-Type": "text/html",
          Cookie: `c_user=${cUser}; xs=${xs}`,
        },
        credentials: "include",
      },
    );

    const text = await response.text();

    // Find access token in response (starts with "EAAG")
    const tokenMatch = text.match(/EAAG[^"]+/);
    if (tokenMatch) {
      accessToken = tokenMatch[0];
      console.log("[FB Downloader] Got access token");
      return accessToken;
    }

    // Alternative: try to find access_token in the page
    const altMatch = text.match(/"accessToken":"([^"]+)"/);
    if (altMatch) {
      accessToken = altMatch[1];
      return accessToken;
    }

    throw new Error("Không thể lấy access token");
  } catch (e) {
    console.error("[FB Downloader] Token error:", e);
    throw e;
  }
}

/**
 * Get video source URL using Facebook Graph API
 */
async function getVideoByGraphApi(videoId) {
  if (!videoId) {
    return { success: false, error: "Không có Video ID" };
  }

  console.log("[FB Downloader] Getting video by ID:", videoId);

  try {
    const token = await getAccessToken();

    const apiUrl = `https://graph.facebook.com/v13.0/${videoId}?fields=source&access_token=${token}`;

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (data.source) {
      console.log("[FB Downloader] Got video source from Graph API");
      return { success: true, url: data.source };
    } else if (data.error) {
      console.error("[FB Downloader] Graph API error:", data.error);
      return { success: false, error: data.error.message };
    }

    return { success: false, error: "Video source not found" };
  } catch (e) {
    console.error("[FB Downloader] Graph API error:", e);
    return { success: false, error: e.message };
  }
}

/**
 * Download video
 */
async function downloadVideo(url) {
  if (!url) {
    return { success: false, error: "No URL" };
  }

  try {
    const timestamp = new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/[:-]/g, "");
    const filename = `fb_video_${timestamp}.mp4`;

    const downloadId = await chrome.downloads.download({
      url: url,
      filename: filename,
      saveAs: true,
    });

    return downloadId
      ? { success: true }
      : { success: false, error: "Download failed" };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

console.log("[FB Downloader] Background v6 - Graph API mode");
