/**
 * Offscreen Recording Script
 * Handles MediaRecorder logic in the background
 */

let recorder = null;
let dataChunks = [];

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "startRecording") {
    startRecording(message.streamId, message.data)
      .then(() => sendResponse({ success: true }))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true;
  } else if (message.action === "stopRecording") {
    stopRecording()
      .then((url) => sendResponse({ success: true, url: url }))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true;
  }
});

async function startRecording(streamId, data) {
  if (recorder?.state === "recording") {
    throw new Error("Already recording");
  }

  const media = await navigator.mediaDevices.getUserMedia({
    audio: {
      mandatory: {
        chromeMediaSource: "tab",
        chromeMediaSourceId: streamId,
      },
    },
    video: {
      mandatory: {
        chromeMediaSource: "tab",
        chromeMediaSourceId: streamId,
      },
    },
  });

  // Continue playing audio to the user while recording
  const audioCtx = new AudioContext();
  const source = audioCtx.createMediaStreamSource(media);
  source.connect(audioCtx.destination);

  // Prefer H.264 (mp4) if available for better compatibility, else WebM
  const mimeTypes = [
    "video/webm;codecs=h264",
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
  ];

  let options = null;
  for (const type of mimeTypes) {
    if (MediaRecorder.isTypeSupported(type)) {
      options = { mimeType: type };
      break;
    }
  }

  recorder = new MediaRecorder(media, options);
  dataChunks = [];

  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) {
      dataChunks.push(e.data);
    }
  };

  recorder.onstop = () => {
    media.getTracks().forEach((t) => t.stop());
    audioCtx.close();
  };

  recorder.start(1000); // chunk every second
}

async function stopRecording() {
  return new Promise((resolve, reject) => {
    if (!recorder || recorder.state === "inactive") {
      resolve(null);
      return;
    }

    recorder.onstop = () => {
      const blob = new Blob(dataChunks, { type: "video/webm" });

      // Convert blob to data URL so we can pass it to background/popup
      // Note: Large files might crash this. For production, efficient blob handling is needed.
      // But for simple extension use, FileReader is easiest to shuttle back.
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result);
      };
      reader.onerror = () => reject(new Error("Failed to read blob"));
      reader.readAsDataURL(blob);

      // Cleanup
      recorder = null;
      dataChunks = [];
    };

    recorder.stop();
  });
}
