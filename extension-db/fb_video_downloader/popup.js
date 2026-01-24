/**
 * FB & YT Video Downloader - Popup v10
 * Supports Facebook (Graph API) and YouTube (Cobalt API)
 */

document.addEventListener("DOMContentLoaded", async () => {
  // === UI Elements ===
  const tabs = document.querySelectorAll(".tab-btn");
  const contents = document.querySelectorAll(".tab-content");

  // Facebook Elements
  const fbExtractBtn = document.getElementById("extract-btn");
  const fbUrlDisplay = document.getElementById("url-display");
  const fbResultDiv = document.getElementById("result");

  // YouTube Elements
  const ytDownloadBtn = document.getElementById("yt-download-btn");
  const ytInput = document.getElementById("yt-input");
  const ytResultDiv = document.getElementById("yt-result");
  const ytStatusText = document.getElementById("yt-status-text");

  // === State ===
  let currentTab = "facebook";

  // === INIT ===
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const currentUrl = tab?.url || "";

  // Auto-switch tab based on URL
  if (currentUrl.includes("youtube.com") || currentUrl.includes("youtu.be")) {
    switchTab("youtube");
    ytInput.value = currentUrl;
    ytStatusText.innerHTML = `<span style="color:#4CAF50">✓</span> Đã phát hiện link YouTube`;
  } else {
    // Default to FB check
    checkFacebookStatus(currentUrl);
  }

  // === Tab Handling ===
  tabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      switchTab(btn.dataset.tab);
    });
  });

  function switchTab(tabName) {
    currentTab = tabName;

    // Update buttons
    tabs.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.tab === tabName);
    });

    // Update content
    contents.forEach((content) => {
      content.classList.toggle("active", content.id === `tab-${tabName}`);
    });
  }

  // === Facebook Logic ===
  function checkFacebookStatus(url) {
    if (!url.includes("facebook.com")) {
      fbUrlDisplay.innerHTML = "⚠️ Mở trang Facebook để tải video";
      fbExtractBtn.disabled = true;
      return;
    }

    const isReel = url.includes("/reel");
    const isVideo = url.includes("/videos") || url.includes("/watch");

    if (isReel || isVideo) {
      fbUrlDisplay.innerHTML = `<span style="color:#4CAF50">✓</span> ${isReel ? "Reel" : "Video"} đã sẵn sàng`;
      fbExtractBtn.disabled = false;
    } else {
      fbUrlDisplay.innerHTML = `Trang hiện tại<br><small style="color:#888">${url.substring(0, 50)}...</small>`;
    }
  }

  fbExtractBtn.addEventListener("click", async () => {
    fbExtractBtn.disabled = true;
    fbExtractBtn.innerHTML = '<div class="spinner"></div> Đang tìm video...';
    fbResultDiv.innerHTML = "";

    try {
      // Inject video extractor script
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["video_extractor.js"],
        world: "MAIN",
      });

      await new Promise((r) => setTimeout(r, 500));

      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const data = document.head.getAttribute("fb-video-data");
          return data ? JSON.parse(data) : null;
        },
      });

      const videoData = results[0]?.result;

      if (videoData?.url) {
        showSuccess(fbResultDiv, "Tìm thấy video!");
        await downloadVideo(videoData.url);
      } else if (videoData?.videoId) {
        showProgress(fbResultDiv, "Đang lấy video từ Graph API...");
        const response = await chrome.runtime.sendMessage({
          action: "getVideoByGraphApi",
          videoId: videoData.videoId,
        });

        if (response?.success && response.url) {
          showSuccess(fbResultDiv, "Đã lấy được video!");
          await downloadVideo(response.url);
        } else {
          showError(
            fbResultDiv,
            response?.error || "Không thể lấy video từ API",
          );
        }
      } else {
        showError(fbResultDiv, "Không tìm thấy video trên trang này");
      }
    } catch (error) {
      console.error(error);
      showError(fbResultDiv, error.message);
    }

    fbExtractBtn.disabled = false;
    fbExtractBtn.innerHTML = "<span>📥</span> Tải Video FB";
  });

  // === YouTube Logic ===
  ytDownloadBtn.addEventListener("click", async () => {
    const url = ytInput.value.trim();
    if (!url) {
      showError(ytResultDiv, "Vui lòng nhập link video");
      return;
    }

    ytDownloadBtn.disabled = true;
    ytDownloadBtn.innerHTML = '<div class="spinner"></div> Đang xử lý...';
    ytResultDiv.innerHTML = "";

    try {
      showProgress(ytResultDiv, "Đang lấy link tải...");

      // Use Cobalt API
      const response = await fetch("https://co.wuk.sh/api/json", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: url,
          filenamePattern: "basic",
        }),
      });

      const data = await response.json();

      if (data.status === "error") {
        throw new Error(data.text || "Không thể lấy link tải");
      }

      if (data.url) {
        showSuccess(ytResultDiv, "Đã lấy được link!");
        await downloadVideo(data.url);
      } else if (data.picker) {
        // Handle picker case if needed, but for simplicity just take audio? No, usually picker is for multiple streams.
        // Let's try to get the first one or error out for this simple version
        showError(ytResultDiv, "API trả về nhiều định dạng, vui lòng thử lại.");
      }
    } catch (error) {
      console.error(error);
      showError(ytResultDiv, "Lỗi: " + error.message);
    }

    ytDownloadBtn.disabled = false;
    ytDownloadBtn.innerHTML = "<span>⬇️</span> Tải Video YouTube";
  });

  // === Common Helpers ===
  async function downloadVideo(url) {
    // Determine which result div to use based on active tab
    const targetDiv = currentTab === "facebook" ? fbResultDiv : ytResultDiv;
    showProgress(targetDiv, "Đang tải xuống...");

    const response = await chrome.runtime.sendMessage({
      action: "downloadUrl",
      url: url,
    });

    if (response?.success) {
      showSuccess(targetDiv, "✓ Đã bắt đầu tải!");
    } else {
      showError(targetDiv, response?.error || "Lỗi tải video");
    }
  }

  function showSuccess(div, msg) {
    div.innerHTML = `<div class="result success">✓ ${msg}</div>`;
  }

  function showProgress(div, msg) {
    div.innerHTML = `<div class="result progress"><div class="spinner"></div> ${msg}</div>`;
  }

  function showError(div, msg) {
    div.innerHTML = `<div class="result error">❌ ${msg}</div>`;
  }
});
