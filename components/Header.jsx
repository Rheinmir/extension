import React from "react";
import { HelpCircle, Search } from "lucide-react";

const Header = ({ onHelpClick }) => {
  return (
    <header className="fixed top-0 w-full h-14 bg-white/60 backdrop-blur-2xl z-40 flex items-center justify-between px-6 border-b border-gray-200/50">
      <div className="flex items-center space-x-3">
        <div className="w-7 h-7 bg-black rounded-md flex items-center justify-center">
          <span className="text-white font-bold text-sm">@</span>
        </div>
        <span className="font-semibold text-sm tracking-tight opacity-80">
          Launchpad
        </span>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative group hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm tiện ích..."
            className="bg-gray-200/50 border-none rounded-md py-1.5 pl-9 pr-4 text-xs focus:ring-1 focus:ring-black/10 w-48 transition-all"
          />
        </div>
        <button
          onClick={onHelpClick}
          className="p-1.5 hover:bg-gray-200 rounded-md transition-all active:scale-90"
        >
          <HelpCircle className="w-5 h-5 text-gray-500" />
        </button>
      </div>
    </header>
  );
};

export default Header;
