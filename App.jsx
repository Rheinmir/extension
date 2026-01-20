import React, { useState, useEffect } from "react";
import { EXTENSIONS } from "./data/extensions";
import { useDownload } from "./hooks/useApp";
import {
  Header,
  ExtensionCard,
  DetailsModal,
  OnboardingOverlay,
} from "./components";

const App = () => {
  const [showOverlay, setShowOverlay] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [selectedExt, setSelectedExt] = useState(null);
  const { downloadingId, startDownload } = useDownload();

  // Show onboarding on first visit
  useEffect(() => {
    const hasVisited = localStorage.getItem("waiter_visited");
    if (!hasVisited) {
      setShowOverlay(true);
      localStorage.setItem("waiter_visited", "true");
    }
  }, []);

  const handleDownload = (id) => {
    setActiveMenuId(null);
    startDownload(id);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] font-sans overflow-x-hidden selection:bg-black selection:text-white">
      {/* Header */}
      <Header onHelpClick={() => setShowOverlay(true)} />

      {/* Launchpad Grid */}
      <main className="pt-24 pb-20 max-w-5xl mx-auto px-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-y-12 gap-x-8">
          {EXTENSIONS.map((ext) => (
            <ExtensionCard
              key={ext.id}
              extension={ext}
              isMenuOpen={activeMenuId === ext.id}
              isDownloading={downloadingId === ext.id}
              onMenuToggle={setActiveMenuId}
              onDownload={handleDownload}
              onViewDetails={setSelectedExt}
            />
          ))}
        </div>
      </main>

      {/* Details Modal */}
      <DetailsModal
        extension={selectedExt}
        onClose={() => setSelectedExt(null)}
        onDownload={handleDownload}
      />

      {/* Onboarding Overlay */}
      <OnboardingOverlay
        isOpen={showOverlay}
        onClose={() => setShowOverlay(false)}
      />

      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center opacity-[0.03] z-[-1]">
        <span className="text-[20vw] font-black italic select-none">
          WAITER
        </span>
      </div>
    </div>
  );
};

export default App;
