import { Wrench, Download, Cpu, Globe, Video } from "lucide-react";

// Extension Database - mapped from extension-db folder
export const EXTENSIONS = [
  {
    id: "aio-menu",
    name: "DevPower Toolkit",
    description:
      "All-in-one developer toolkit built on Manifest V3. Features include Color Picker, WhatFont, CSS Viewer, Page Ruler, Tech Stack Detector, QR Generator, Screenshot tool, Timestamp Converter, Link Checker, and more.",
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
      "Multi-platform video downloader built on Manifest V3. Enables users to download videos and Reels from Facebook, YouTube, and X (Twitter). Uses advanced extraction methods for high-quality downloads.",
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
