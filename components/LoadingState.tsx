import React from "react";

export default function LoadingState() {
  return (
    <div className="w-full py-20 flex flex-col items-center justify-center animate-fade-in" id="loading-state">
      <div className="flex flex-col items-center gap-5 select-none">
        {/* Glowing Ambient Loader Ring */}
        <div className="relative w-10 h-10 flex items-center justify-center">
          <div className="absolute w-8 h-8 rounded-full border-2 border-amber-500/10 border-t-amber-500 animate-spin"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60 blur-[2px] animate-ping"></div>
        </div>
        
        {/* Pulsing Typography */}
        <p className="text-sm md:text-base font-light tracking-widest text-slate-400 uppercase animate-pulse-glow">
          Separating signal from noise...
        </p>
      </div>
    </div>
  );
}
