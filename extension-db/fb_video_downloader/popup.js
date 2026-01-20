/**
 * FB Video Downloader - Popup v9
 * Simple one-click download
 */

document.addEventListener("DOMContentLoaded", async () => {
  const extractBtn = document.getElementById("extract-btn");
  const urlDisplay = document.getElementById("url-display");
  const resultDiv = document.getElementById("result");

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const currentUrl = tab?.url || "";

  if (!currentUrl.includes("facebook.com")) {
    urlDisplay.innerHTML = "⚠️ Mở trang Facebook để tải video";
    extractBtn.disabled = true;
    return;
  }

  // Display current URL
  const isReel = currentUrl.includes("/reel");
  const isVideo =
    currentUrl.includes("/videos") || currentUrl.includes("/watch");

  if (isReel || isVideo) {
    urlDisplay.innerHTML = `<span style="color:#4CAF50">✓</span> ${isReel ? "Reel" : "Video"} đã sẵn sàng`;
  } else {
    urlDisplay.innerHTML = `Trang hiện tại<br><small style="color:#888">${currentUrl.substring(0, 50)}...</small>`;
  }

  extractBtn.addEventListener("click", async () => {
    extractBtn.disabled = true;
    extractBtn.innerHTML = '<div class="spinner"></div> Đang tìm video...';
    resultDiv.innerHTML = "";

    try {
      // Inject video extractor script
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["video_extractor.js"],
        world: "MAIN", // Run in page context to access React
      });

      // Wait a bit then read result
      await new Promise((r) => setTimeout(r, 500));

      // Read result from page
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const data = document.head.getAttribute("fb-video-data");
          return data ? JSON.parse(data) : null;
        },
      });

      const videoData = results[0]?.result;

      if (videoData?.url) {
        // Direct URL found
        showSuccess("Tìm thấy video!");
        await downloadVideo(videoData.url);
      } else if (videoData?.videoId) {
        // Use Graph API to get video
        showProgress("Đang lấy video từ Graph API...");
        const response = await chrome.runtime.sendMessage({
          action: "getVideoByGraphApi",
          videoId: videoData.videoId,
        });

        if (response?.success && response.url) {
          showSuccess("Đã lấy được video!");
          await downloadVideo(response.url);
        } else {
          showError(response?.error || "Không thể lấy video từ API");
        }
      } else {
        showError("Không tìm thấy video trên trang này");
      }
    } catch (error) {
      console.error(error);
      showError(error.message);
    }

    extractBtn.disabled = false;
    extractBtn.innerHTML = "<span>📥</span> Tải Video";
  });

  async function downloadVideo(url) {
    showProgress("Đang tải...");

    const response = await chrome.runtime.sendMessage({
      action: "downloadUrl",
      url: url,
    });

    if (response?.success) {
      showSuccess("✓ Đã bắt đầu tải!");
    } else {
      showError(response?.error || "Lỗi tải video");
    }
  }

  function showSuccess(msg) {
    resultDiv.innerHTML = `<div class="result success">✓ ${msg}</div>`;
  }

  function showProgress(msg) {
    resultDiv.innerHTML = `<div class="result progress"><div class="spinner"></div> ${msg}</div>`;
  }

  function showError(msg) {
    resultDiv.innerHTML = `
      <div class="result error">
        ❌ ${msg}
        <div class="error-hints">
          Thử:<br>
          • Mở trực tiếp Reel/Video<br>
          • Đảm bảo đã đăng nhập Facebook<br>
          • Reload trang và thử lại
        </div>
      </div>
    `;
  }
});
