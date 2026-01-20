import React, { useRef } from "react";
import { MoreHorizontal, Download, Info } from "lucide-react";
import { getIcon } from "../data/extensions";
import { useClickOutside } from "../hooks/useApp";

const ExtensionCard = ({
  extension,
  isMenuOpen,
  isDownloading,
  onMenuToggle,
  onDownload,
  onViewDetails,
}) => {
  const menuRef = useRef(null);

  useClickOutside(menuRef, () => {
    if (isMenuOpen) onMenuToggle(null);
  });

  return (
    <div className="relative group flex flex-col items-center">
      {/* App Icon Container */}
      <div className="relative">
        <div
          className="w-24 h-24 bg-white rounded-[1.8rem] shadow-sm flex items-center justify-center transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl cursor-default"
          onClick={() => onViewDetails(extension)}
        >
          <div className={extension.iconColor}>{getIcon(extension.icon)}</div>
        </div>

        {/* 3 Dots Action Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMenuToggle(isMenuOpen ? null : extension.id);
          }}
          className={`absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur shadow-md flex items-center justify-center transition-all ${
            isMenuOpen
              ? "opacity-100 scale-100"
              : "opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100"
          } hover:bg-black hover:text-white z-10`}
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>

        {/* Context Menu */}
        {isMenuOpen && (
          <div
            ref={menuRef}
            className="absolute top-8 left-1/2 -translate-x-1/2 mt-2 w-36 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 py-1.5 z-20 animate-in fade-in slide-in-from-top-2 duration-200"
          >
            <button
              onClick={() => {
                onViewDetails(extension);
                onMenuToggle(null);
              }}
              className="w-full flex items-center space-x-2 px-4 py-2 text-xs font-bold hover:bg-blue-500 hover:text-white transition-colors"
            >
              <Info className="w-3.5 h-3.5" />
              <span>Chi tiết</span>
            </button>
            <button
              onClick={() => onDownload(extension.id)}
              className="w-full flex items-center space-x-2 px-4 py-2 text-xs font-bold hover:bg-blue-500 hover:text-white transition-colors border-t border-gray-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tải về</span>
            </button>
          </div>
        )}

        {/* Download Progress Indicator */}
        {isDownloading && (
          <div className="absolute inset-0 bg-black/40 rounded-[1.8rem] flex flex-col items-center justify-center text-white z-20 overflow-hidden">
            <div className="animate-spin h-6 w-6 border-2 border-white/30 border-t-white rounded-full mb-2" />
            <span className="text-[10px] font-bold">DOWNLOADING</span>
          </div>
        )}
      </div>

      {/* App Label */}
      <span className="mt-3 text-[13px] font-semibold text-gray-800 tracking-tight text-center px-2 line-clamp-1">
        {extension.name}
      </span>
    </div>
  );
};

export default ExtensionCard;
