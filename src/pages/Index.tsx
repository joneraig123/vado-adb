import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import adobeLogo from "@/assets/front_adb.png";

const Index = () => {
  const navigate = useNavigate();

  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     navigate("/document");
  //   }, 3000);
  //   return () => clearTimeout(timer);
  // }, [navigate]);

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
      </div>
      <p className="absolute bottom-8 text-sm text-[#aaa]">
        End-to-end encrypted · Zero knowledge
      </p>
    </div>
  );
};

export default Index;
