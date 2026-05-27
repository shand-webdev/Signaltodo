import React from "react";

export default function Header() {
  return (
    <header className="w-full text-center py-10 md:py-16 animate-fade-in">
      <div className="inline-flex flex-col items-center group">
        {/* Glow Brand Dot Indicator */}
        <div className="relative mb-3 flex items-center justify-center">
          <div className="absolute w-6 h-6 rounded-full bg-amber-500/20 blur-md group-hover:bg-amber-500/40 transition-all duration-700"></div>
          <div className="relative w-2.5 h-2.5 rounded-full bg-amber-500 border border-amber-400"></div>
        </div>
        
        {/* Application Logo Title */}
        <h1 
          id="brand-title" 
          className="text-4xl md:text-5xl font-extrabold tracking-tight text-white select-none transition-all duration-300 hover:text-amber-500 cursor-default"
        >
          Signal
        </h1>
        
        {/* Subtitle */}
        <p className="mt-2 text-sm md:text-base font-medium text-slate-400 tracking-wide max-w-xs md:max-w-md select-none">
          Find the signal in your chaos.
        </p>
      </div>
    </header>
  );
}
