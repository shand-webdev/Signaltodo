"use client";

import React, { useState, useEffect, useRef } from "react";

interface BrainDumpInputProps {
  onSubmit: (input: string) => void;
  isLoading: boolean;
  initialValue?: string;
}

export default function BrainDumpInput({
  onSubmit,
  isLoading,
  initialValue = "",
}: BrainDumpInputProps) {
  const [value, setValue] = useState(initialValue);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync state with initial value (useful when restoring from localStorage)
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim().length > 0 && !isLoading) {
      onSubmit(value);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Cmd+Enter or Ctrl+Enter
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleLoadExample = () => {
    setValue(
      "Need to finish Cheeko onboarding, call mom, buy groceries, workout, send portfolio, watch startup videos, redesign homepage."
    );
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="w-full max-w-2xl mx-auto flex flex-col gap-5 animate-slide-up"
      id="brain-dump-form"
    >
      <div className="relative group rounded-2xl p-[1px] transition-all duration-500 bg-white/5 focus-within:bg-gradient-to-b focus-within:from-amber-500/20 focus-within:to-transparent">
        {/* Large Text Area Container */}
        <textarea
          ref={textareaRef}
          id="brain-dump-textarea"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={isLoading}
          placeholder="What's on your mind today?"
          className="w-full h-48 px-6 py-5 bg-[#0D1426]/60 backdrop-blur-md border border-white/5 rounded-2xl text-slate-100 placeholder-slate-500 outline-none resize-none transition-all duration-300 focus:border-amber-500/20 focus:bg-[#0D1426]/80 text-base md:text-lg leading-relaxed focus:shadow-[0_0_50px_-12px_rgba(245,158,11,0.06)]"
        />
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Clickable Example */}
        <div className="text-xs text-slate-500 select-none text-center sm:text-left">
          <span>Example: </span>
          <button
            type="button"
            onClick={handleLoadExample}
            disabled={isLoading}
            className="text-slate-400 hover:text-amber-500 underline underline-offset-4 cursor-pointer transition-colors duration-200"
          >
            "Need to finish onboarding, call mom, workout..."
          </button>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          id="submit-button"
          disabled={isLoading || value.trim().length === 0}
          className={`relative group px-8 py-3.5 rounded-full font-semibold text-sm tracking-wide transition-all duration-300 overflow-hidden cursor-pointer select-none
            ${
              value.trim().length === 0 || isLoading
                ? "bg-slate-800/40 text-slate-600 border border-white/5 cursor-not-allowed"
                : "bg-white text-slate-900 border border-white/10 hover:bg-amber-500 hover:text-white shadow-[0_4px_20px_-4px_rgba(255,255,255,0.1)] hover:shadow-[0_8px_30px_0_rgba(245,158,11,0.3)] active:scale-95"
            }
          `}
        >
          <span className="relative z-10">Find My Signal</span>
        </button>
      </div>

      {/* Keyboard Shortcut Hint */}
      <div className="text-center text-[10px] text-slate-600 select-none mt-2 hidden sm:block">
        Press <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-white/5 text-[9px]">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-white/5 text-[9px]">Enter</kbd> to find signal instantly.
      </div>
    </form>
  );
}
