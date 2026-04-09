import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     navigate("/download");
  //   }, 3000);
  //   return () => clearTimeout(timer);
  // }, [navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f5f5f5]">
      <div className="flex flex-col items-center gap-6">
        <div className="rounded-xl bg-white p-4 shadow-lg shadow-black/5">
          <span className="text-3xl font-bold tracking-tight" style={{ color: "#E30613", fontFamily: "Arial, sans-serif" }}>
            Adobe
          </span>
        </div>
        <h1 className="text-4xl font-semibold text-[#1a1a1a]" style={{ fontFamily: "system-ui, sans-serif" }}>
          ShareFile
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
