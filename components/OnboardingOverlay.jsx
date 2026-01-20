import React, { useState } from "react";
import { X, Copy, CheckCircle2 } from "lucide-react";

const OnboardingOverlay = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    const textArea = document.createElement("textarea");
    textArea.value = "chrome://extensions";
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/10 backdrop-blur-xl"
        onClick={onClose}
      />
      <div className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500 max-h-[90vh] flex flex-col">
        <div className="p-8 md:p-12 overflow-y-auto">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-3xl font-bold tracking-tight italic">
              Hướng dẫn cài đặt
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-2xl transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-12">
            {/* Step 1 */}
            <StepItem
              number={1}
              title="Tải & Giải nén"
              description={
                <>
                  Bấm nút <b>Download</b> (icon mũi tên) trên thẻ tiện ích để
                  tải về file <code>.zip</code>. Sau đó{" "}
                  <b>giải nén (Extract)</b> file này ra một thư mục.
                </>
              }
              illustration={<DownloadIllustration />}
            />

            {/* Step 2 */}
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <span className="w-6 h-6 rounded-full bg-black text-white text-xs flex items-center justify-center font-bold">
                    2
                  </span>
                  <h4 className="font-bold text-lg">Bật Developer Mode</h4>
                </div>
                <p className="text-gray-500 text-sm mb-3">
                  Truy cập trang quản lý tiện ích và bật chế độ nhà phát triển ở
                  góc phải màn hình.
                </p>
                <div
                  onClick={copyToClipboard}
                  className="group relative flex items-center justify-between bg-blue-50/50 border border-blue-100 px-4 py-3 rounded-xl cursor-pointer hover:bg-blue-50 transition-colors"
                >
                  <code className="text-blue-600 font-mono text-[10px] sm:text-xs tracking-tight">
                    chrome://extensions
                  </code>
                  {copied ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-blue-400 opacity-0 group-hover:opacity-100" />
                  )}
                </div>
              </div>
              <div className="flex-1 bg-gray-50 rounded-2xl p-4 flex items-center justify-center border border-gray-100">
                <div className="w-12 h-6 bg-gray-200 rounded-full relative">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-blue-500 rounded-full animate-pulse" />
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <StepItem
              number={3}
              title="Tải tiện ích lên"
              description={
                <>
                  Bấm nút <b>Load unpacked</b> (hoặc "Tải tiện ích đã giải nén")
                  ở góc trái. Chọn đúng <b>thư mục</b> bạn vừa giải nén ở Bước
                  1.
                </>
              }
              illustration={<LoadUnpackedIllustration />}
            />
          </div>

          <button
            onClick={onClose}
            className="w-full mt-12 bg-black text-white py-5 rounded-3xl font-bold text-lg hover:bg-zinc-800 active:scale-[0.98] transition-all shadow-xl shadow-black/10"
          >
            Got it / Hiểu rồi
          </button>
        </div>
      </div>
    </div>
  );
};

// Sub-components
const StepItem = ({ number, title, description, illustration }) => (
  <div className="flex flex-col md:flex-row gap-6">
    <div className="flex-1">
      <div className="flex items-center space-x-3 mb-3">
        <span className="w-6 h-6 rounded-full bg-black text-white text-xs flex items-center justify-center font-bold">
          {number}
        </span>
        <h4 className="font-bold text-lg">{title}</h4>
      </div>
      <p className="text-gray-500 text-sm">{description}</p>
    </div>
    <div className="flex-1 bg-gray-50 rounded-2xl p-4 flex items-center justify-center border border-gray-100">
      {illustration}
    </div>
  </div>
);

const DownloadIllustration = () => (
  <svg
    width="80"
    height="60"
    viewBox="0 0 80 60"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="10"
      y="10"
      width="60"
      height="40"
      rx="6"
      fill="white"
      stroke="#E5E7EB"
      strokeWidth="2"
    />
    <path
      d="M40 20V35M40 35L36 31M40 35L44 31"
      stroke="#3B82F6"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const LoadUnpackedIllustration = () => (
  <div className="w-16 h-10 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
    <div className="w-8 h-1 bg-gray-200" />
  </div>
);

export default OnboardingOverlay;
