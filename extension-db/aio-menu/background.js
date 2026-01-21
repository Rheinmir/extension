/**
 * DevPower Toolkit
 * Background Script
 * Handles Alarms and Notifications for Health Reminders
 */

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "water-reminder") {
    showNotification(
      "drink-water",
      "💧 Hydration Check",
      "Time to drink a glass of water! Stay hydrated.",
    );
  } else if (alarm.name === "posture-reminder") {
    showNotification(
      "check-posture",
      "🧘 Posture Check",
      "Straighten your back and relax your shoulders.",
    );
  } else if (alarm.name === "vision-reminder") {
    showNotification(
      "rest-eyes",
      "👀 20-20-20 Rule",
      "Look at something 20 feet away for 20 seconds.",
    );
  }
});

function showNotification(id, title, message) {
  chrome.notifications.create(id, {
    type: "basic",
    iconUrl: "icon.png",
    title: title,
    message: message,
    priority: 2,
  });
}

// Screenshot Capture Helper
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "captureTab") {
    chrome.tabs.captureVisibleTab(null, { format: "png" }, (dataUrl) => {
      sendResponse(dataUrl);
    });
    return true; // Keep channel open
  }
});
