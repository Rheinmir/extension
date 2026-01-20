import { Wrench, Download, Cpu, Globe, Video } from "lucide-react";

// Extension Database - mapped from extension-db folder
export const EXTENSIONS = [
  {
    id: "aio-menu",
    name: "DevPower Toolkit",
    description:
      "Chrome Extension built on Manifest V3. Provides a comprehensive suite of developer utilities directly in the browser popup and interacts with web pages via content scripts.",
    icon: "Wrench",
    iconColor: "text-purple-500",
    version: "3.1",
    author: "@waiter-team",
    size: "1.2 MB",
    folderPath: "extension-db/aio-menu",
  },
  {
    id: "fb_video_downloader",
    name: "FB Video Downloader",
    description:
      "Chrome Extension built on Manifest V3 that enables users to download videos and Reels from Facebook. Uses React Fiber inspection and Facebook Graph API to extract video URLs.",
    icon: "Video",
    iconColor: "text-blue-500",
    version: "4.0",
    author: "@waiter-team",
    size: "96 KB",
    folderPath: "extension-db/fb_video_downloader",
  },
];

// Icon mapping for dynamic rendering
export const IconMap = {
  Wrench,
  Download,
  Cpu,
  Globe,
  Video,
};

export const getIcon = (iconName, className = "w-12 h-12") => {
  const Icon = IconMap[iconName];
  return Icon ? <Icon className={className} /> : null;
};

// Get extension by ID
export const getExtensionById = (id) => {
  return EXTENSIONS.find((ext) => ext.id === id);
};

// Get download path for extension
export const getExtensionDownloadPath = (id) => {
  const ext = getExtensionById(id);
  return ext ? ext.folderPath : null;
};
