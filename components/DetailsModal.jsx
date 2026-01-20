import React from "react";
import { X, Download } from "lucide-react";
import { getIcon } from "../data/extensions";

const DetailsModal = ({ extension, onClose, onDownload }) => {
  if (!extension) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-md"
        onClick={onClose}
      />
      <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        <div className="p-8">
          <div className="flex items-start justify-between mb-8">
            <div
              className={`w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center shadow-inner ${extension.iconColor}`}
            >
              {getIcon(extension.icon, "w-10 h-10")}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <h3 className="text-2xl font-bold mb-1">{extension.name}</h3>
          <p className="text-sm text-blue-600 font-semibold mb-6">
            {extension.author}
          </p>

          <div className="space-y-4 mb-8">
            <p className="text-gray-500 text-sm leading-relaxed">
              {extension.description}
            </p>
            <div className="flex space-x-8 pt-4 border-t border-gray-100">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">
                  Phiên bản
                </p>
                <p className="text-sm font-bold">{extension.version}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">
                  Kích thước
                </p>
                <p className="text-sm font-bold">{extension.size}</p>
              </div>
            </div>
            {extension.folderPath && (
              <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1">
                  Đường dẫn
                </p>
                <code className="text-xs text-blue-600 font-mono">
                  {extension.folderPath}
                </code>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              onDownload(extension.id);
              onClose();
            }}
            className="w-full bg-black text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-zinc-800 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Tải về ngay</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailsModal;
