import { useState, useEffect, useCallback } from "react";
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

  const startDownload = useCallback((id) => {
    const extension = getExtensionById(id);
    if (!extension) {
      setDownloadError("Extension not found");
      return;
    }

    setDownloadingId(id);
    setDownloadError(null);

    // Simulate small delay for UX
    setTimeout(() => {
      // Create a temporary link to trigger download
      const link = document.createElement("a");
      link.href = `/extensions/${id}.zip`;
      link.download = `${extension.name.replace(/\s+/g, "_")}_v${extension.version}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadingId(null);
    }, 1000);
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
