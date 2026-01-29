/**
 * FB & YT Video Downloader - Popup v10
 * Supports Facebook (Graph API), YouTube, and X (Cobalt API)
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
  const ytRecordBtn = document.getElementById("yt-record-btn"); // New
  const ytInput = document.getElementById("yt-input");
  const ytResultDiv = document.getElementById("yt-result");
  const ytStatusText = document.getElementById("yt-status-text");

  // Twitter Elements
  const twDownloadBtn = document.getElementById("tw-download-btn");
  const twRecordBtn = document.getElementById("tw-record-btn"); // New
  const twInput = document.getElementById("tw-input");
  const twResultDiv = document.getElementById("tw-result");
  const twStatusText = document.getElementById("tw-status-text");

  // === State ===
  let currentTab = "facebook";
  // const DEFAULT_API_URL = "https://api.cobalt.tools"; // Auth required now
  const DEFAULT_API_URL = "";
  let cobaltApiUrl = DEFAULT_API_URL;

  // === UI Elements for Settings ===
  const apiUrlInput = document.getElementById("api-url");
  const findServerBtn = document.getElementById("find-server-btn");

  // === INIT ===
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const currentUrl = tab?.url || "";

  // Load Saved API URL
  try {
    const storage = await chrome.storage.local.get("cobaltApiUrl");
    if (storage.cobaltApiUrl) {
      cobaltApiUrl = storage.cobaltApiUrl;
    }
    apiUrlInput.value = cobaltApiUrl;
  } catch (e) {
    console.error("Failed to load API URL", e);
  }

  // Auto-switch tab based on URL
  if (currentUrl.includes("youtube.com") || currentUrl.includes("youtu.be")) {
    switchTab("youtube");
    ytInput.value = currentUrl;
    ytStatusText.innerHTML = `<span style="color:#4CAF50">✓</span> Đã phát hiện link YouTube`;
  } else if (
    currentUrl.includes("twitter.com") ||
    currentUrl.includes("x.com")
  ) {
    switchTab("twitter");
    twInput.value = currentUrl;
    twStatusText.innerHTML = `<span style="color:#4CAF50">✓</span> Đã phát hiện link X/Twitter`;
  } else {
    // Default to FB check
    checkFacebookStatus(currentUrl);
  }

  // === Settings Handlers ===
  apiUrlInput.addEventListener("change", async () => {
    let url = apiUrlInput.value.trim();
    // Remove trailing slash
    if (url.endsWith("/")) url = url.slice(0, -1);

    if (url) {
      cobaltApiUrl = url;
      await chrome.storage.local.set({ cobaltApiUrl: url });
      // Visual feedback
      apiUrlInput.style.borderColor = "#4CAF50";
      setTimeout(() => (apiUrlInput.style.borderColor = "#ddd"), 1000);
    }
  });

  findServerBtn.addEventListener("click", (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: "https://cobalt.directory" });
  });

  // Check if already recording
  checkRecordingStatus();

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
  ytDownloadBtn.addEventListener("click", () =>
    handleCobaltDownload(ytInput, ytDownloadBtn, ytResultDiv, "YouTube"),
  );
  ytRecordBtn.addEventListener("click", () =>
    handleRecordStream(ytRecordBtn, ytResultDiv),
  );

  // === Twitter Logic ===
  twDownloadBtn.addEventListener("click", () =>
    handleCobaltDownload(twInput, twDownloadBtn, twResultDiv, "X/Twitter"),
  );
  twRecordBtn.addEventListener("click", () =>
    handleRecordStream(twRecordBtn, twResultDiv),
  );

  let isRecording = false;

  async function checkRecordingStatus() {
    try {
      const response = await chrome.runtime.sendMessage({
        action: "getRecordingStatus",
      });
      if (response && response.isRecording) {
        isRecording = true;
        // Update both buttons just in case, or check which tab is relevant
        const recordingMsg = `<span class="btn-icon-inner">⏹️</span> <span>Dừng quay (Đang ghi...)</span>`;
        const activeStyle = "margin-top: 10px; background: #333;";

        // We don't know exactly which tab started it easily without more state,
        // but we can just update all record buttons or the current one.
        // For simplicity, update both if they exist
        if (ytRecordBtn) {
          ytRecordBtn.innerHTML = recordingMsg;
          ytRecordBtn.style = activeStyle;
        }
        if (twRecordBtn) {
          twRecordBtn.innerHTML = recordingMsg;
          twRecordBtn.style = activeStyle;
        }
      }
    } catch (e) {
      console.error("Failed to check status", e);
    }
  }

  async function handleRecordStream(btn, resultDiv) {
    if (isRecording) {
      // Stop Recording
      btn.innerHTML =
        '<span class="btn-icon-inner">🎥</span> <span>Dừng quay & Lưu</span>';
      btn.style.background = "#e74c3c"; // Reset color

      showProgress(resultDiv, "Đang xử lý video...");

      try {
        const response = await chrome.runtime.sendMessage({
          action: "stopRecording",
        });
        if (response?.success) {
          showSuccess(resultDiv, "Đã lưu video!");
          isRecording = false;

          // Reset text
          const defaultHtml =
            '<span class="btn-icon-inner">🎥</span> <span>Quay màn hình (Stream)</span>';
          const defaultStyle = "margin-top: 10px; background: #e74c3c;";

          if (ytRecordBtn) {
            ytRecordBtn.innerHTML = defaultHtml;
            ytRecordBtn.style = defaultStyle;
          }
          if (twRecordBtn) {
            twRecordBtn.innerHTML = defaultHtml;
            twRecordBtn.style = defaultStyle;
          }
        } else {
          showError(resultDiv, response?.error || "Lỗi khi dừng quay");
        }
      } catch (e) {
        showError(resultDiv, e.message);
      }
    } else {
      // Start Recording
      showProgress(resultDiv, "Đang khởi tạo quay...");
      try {
        // Get current tab ID
        const [activeTab] = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });

        const response = await chrome.runtime.sendMessage({
          action: "startRecording",
          tabId: activeTab.id,
        });

        if (response?.success) {
          isRecording = true;
          btn.innerHTML =
            '<span class="btn-icon-inner">⏹️</span> <span>Dừng quay (Đang ghi...)</span>';
          btn.style.background = "#333"; // Active color
          showSuccess(resultDiv, "Đang quay! Phát video để ghi lại.");

          // Also update the other button if it exists to reflect global state
          const otherBtn = btn === ytRecordBtn ? twRecordBtn : ytRecordBtn;
          if (otherBtn) {
            otherBtn.innerHTML = btn.innerHTML;
            otherBtn.style.background = "#333";
          }
        } else {
          showError(resultDiv, response?.error || "Không thể bắt đầu quay");
        }
      } catch (e) {
        showError(resultDiv, e.message);
      }
    }
  }

  // === Cobalt API Handler (YouTube & X) ===
  async function handleCobaltDownload(inputEl, btnEl, resultDiv, platformName) {
    const url = inputEl.value.trim();
    if (!url) {
      showError(resultDiv, "Vui lòng nhập link video");
      return;
    }

    if (!cobaltApiUrl) {
      showError(resultDiv, "Vui lòng nhập Cobalt Server dưới footer!");
      return;
    }

    const originalBtnText = btnEl.innerHTML;
    btnEl.disabled = true;
    btnEl.innerHTML = '<div class="spinner"></div> Đang xử lý...';
    resultDiv.innerHTML = "";

    try {
      showProgress(resultDiv, "Đang lấy link tải...");

      // Determine correct endpoint
      let requestUrl = cobaltApiUrl;
      // If valid domain without path, use root. If user added path, use it.
      // v10 uses POST /
      // v7 uses POST /api/json

      // If the user did NOT specify /api/json, we assume v10 (root)
      // but we treat the input as the full base URL usually.

      const response = await fetch(requestUrl, {
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
        showSuccess(resultDiv, "Đã lấy được link!");
        await downloadVideo(data.url, resultDiv); // Pass resultDiv to downloadVideo helper
      } else if (data.picker) {
        showError(resultDiv, "API trả về nhiều định dạng, vui lòng thử lại.");
      } else if (data.status === "stream") {
        // v10 stream response
        if (data.url) {
          showSuccess(resultDiv, "Đã lấy được link!");
          await downloadVideo(data.url, resultDiv);
        } else {
          showError(
            resultDiv,
            "Lỗi: Server phản hồi stream nhưng không có URL",
          );
        }
      } else {
        // Fallback check
        if (data.url) {
          showSuccess(resultDiv, "Đã lấy được link!");
          await downloadVideo(data.url, resultDiv);
        } else {
          showError(resultDiv, "Phản hồi không xác định từ server");
        }
      }
    } catch (error) {
      console.error(error);
      showError(resultDiv, "Lỗi: " + error.message);
    }

    btnEl.disabled = false;
    btnEl.innerHTML = originalBtnText;
  }

  // === Common Helpers ===
  async function downloadVideo(url, specificResultDiv = null) {
    // Determine which result div to use based on active tab if not specified
    let targetDiv = specificResultDiv;
    if (!targetDiv) {
      if (currentTab === "facebook") targetDiv = fbResultDiv;
      else if (currentTab === "twitter") targetDiv = twResultDiv;
      else targetDiv = ytResultDiv;
    }

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
