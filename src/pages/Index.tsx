import { useState } from "react";
import adobeLogo from "@/assets/front_adb.png";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const [progress] = useState(0);
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-[500px] animate-in fade-in slide-in-from-bottom-4 rounded-xl bg-white p-5 text-center shadow-xl">
          <div className="mb-4 text-5xl">⚠️</div>
          <h2 className="mb-2 text-2xl font-semibold text-[#333]">Mobile Viewing Error</h2>
          <p className="mb-2 text-base leading-relaxed text-[#555]">
            This file cannot be viewed on mobile devices.
          </p>
          <p className="border-t pt-3 text-sm leading-relaxed text-[#666]">
            Please use a laptop or desktop computer to view this file.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f5f5f5]">
      <div className="flex flex-col items-center gap-6">
        <div className="rounded-xl bg-white p-6 shadow-lg shadow-black/5">
          <img src={adobeLogo} alt="Adobe" className="h-9 object-contain" />
        </div>
        <h1 className="text-4xl font-semibold text-[#1a1a1a]" style={{ fontFamily: "system-ui, sans-serif" }}>
          ShareFile Pro
        </h1>
        <p className="text-lg text-[#888]">Secure file sharing, simplified</p>
        <div className="mt-2 h-[2px] w-48 overflow-hidden rounded-full bg-[#e0e0e0]">
          <div
            className="h-full bg-[#1a1a1a] transition-none"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>
      <p className="absolute bottom-8 text-sm text-[#aaa]">
        End-to-end encrypted · Zero knowledge
      </p>
    </div>
  );
};

export default Index;
