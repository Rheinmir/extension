import { useState, useEffect, useCallback } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { getExtensionById } from "../data/extensions";

/**
 * Custom hook for managing localStorage state
 */
export const useLocalStorage = (key, initialValue) => {
  const [value, setValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, value]);

  return [value, setValue];
};

/**
 * Custom hook for click outside detection
 */
export const useClickOutside = (ref, callback) => {
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [ref, callback]);
};

/**
 * Custom hook for extension download
 * Downloads the extension folder as a ZIP file
 */
export const useDownload = () => {
  const [downloadingId, setDownloadingId] = useState(null);
  const [downloadError, setDownloadError] = useState(null);

  const startDownload = useCallback(async (id) => {
    const extension = getExtensionById(id);
    if (!extension) {
      setDownloadError("Extension not found");
      return;
    }

    setDownloadingId(id);
    setDownloadError(null);

    try {
      // In a real app, this would fetch files from server
      // For now, we'll create a simulated download
      // The actual implementation would need a backend to serve the files

      // Simulate download delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Create download link for the folder
      // In production, this could be:
      // 1. A pre-zipped file on CDN
      // 2. Server-side ZIP generation
      // 3. Or direct folder download if supported

      const downloadUrl = `/api/download/${extension.id}`;

      // For demo, we'll show a message or trigger actual download
      console.log(
        `Downloading extension: ${extension.name} from ${extension.folderPath}`,
      );

      // Trigger download (in production this would be a real API call)
      // window.location.href = downloadUrl;

      alert(
        `Extension "${extension.name}" sẵn sàng tải!\n\nĐường dẫn: ${extension.folderPath}`,
      );
    } catch (error) {
      console.error("Download error:", error);
      setDownloadError(error.message);
    } finally {
      setDownloadingId(null);
    }
  }, []);

  return { downloadingId, downloadError, startDownload };
};

/**
 * Alternative: Direct folder path download helper
 * For use with Chrome extension or Electron app
 */
export const downloadExtensionFolder = async (extensionId) => {
  const extension = getExtensionById(extensionId);
  if (!extension) return null;

  return {
    name: extension.name,
    path: extension.folderPath,
    version: extension.version,
  };
};
