import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import adobeLogo from "@/assets/front_adb.png";

const Index = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);

   // useEffect(() => {
   //  const duration = 3000;
   //  const interval = 30;
   //  const step = (interval / duration) * 100;
     const timer = setInterval(() => {
       setProgress((prev) => {
         if (prev >= 100) {
           clearInterval(timer);
           return 100;
         }
         return prev + step;
       });
     }, interval);
     const redirect = setTimeout(() => navigate("/document"), duration);
     return () => {
       clearInterval(timer);
       clearTimeout(redirect);
     };
   }, [navigate]);

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
