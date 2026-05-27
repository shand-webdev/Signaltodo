"use client";

import React, { useState, useEffect } from "react";
import { LifeTask, PriorityType } from "../types";

interface ResultsDisplayProps {
  tasks: LifeTask[];
  summary: string;
  originalInput: string;
  timestamp: number;
  completedTasks: string[];
  onToggleComplete: (task: string) => void;
  onOverridePriority: (task: string, newPriority: PriorityType) => void;
  onAnalyzeAgain: (newInput: string) => void;
  onReset: () => void;
}

export default function ResultsDisplay({
  tasks,
  summary,
  originalInput,
  timestamp,
  completedTasks,
  onToggleComplete,
  onOverridePriority,
  onAnalyzeAgain,
  onReset,
}: ResultsDisplayProps) {
  const [isDumpOpen, setIsDumpOpen] = useState(false);
  const [newDumpText, setNewDumpText] = useState("");
  const [formattedDate, setFormattedDate] = useState("");

  // Format date client-side
  useEffect(() => {
    const date = new Date(timestamp);
    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
    };
    setFormattedDate(date.toLocaleDateString("en-US", options));
  }, [timestamp]);

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDumpText.trim().length > 0) {
      onAnalyzeAgain(newDumpText);
      setNewDumpText("");
    }
  };

  // Group tasks by their priority state
  const mustDoTasks = tasks.filter((t) => t.priority === "Must Do");
  const shouldDoTasks = tasks.filter((t) => t.priority === "Should Do");
  const canWaitTasks = tasks.filter((t) => t.priority === "Can Wait");

  // Render a task item
  const renderPriorityTask = (item: LifeTask, index: number) => {
    const isCompleted = completedTasks.includes(item.task);
    return (
      <div
        key={index}
        className={`group flex items-start gap-3 py-1.5 transition-all duration-300
          ${isCompleted ? "opacity-35" : "hover:translate-x-0.5"}
        `}
      >
        {/* Satisfying check box trigger */}
        <div
          onClick={() => onToggleComplete(item.task)}
          className="flex-shrink-0 mt-1 cursor-pointer w-4 h-4 rounded border border-slate-600 bg-[#080C18]/60 flex items-center justify-center transition-all duration-200 hover:border-amber-500 bg-amber-500/10"
        >
          {isCompleted ? (
            <svg className="w-3.5 h-3.5 text-amber-500 font-bold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <div className="w-2 h-2 rounded bg-transparent group-hover:bg-amber-500/20"></div>
          )}
        </div>

        {/* Task Details */}
        <div className="flex-1 flex flex-col justify-start">
          <div className="flex flex-wrap items-center gap-2">
            <span
              onClick={() => onToggleComplete(item.task)}
              className={`text-sm md:text-base font-semibold text-slate-100 leading-snug tracking-tight cursor-pointer
                ${isCompleted ? "line-through text-slate-500 decoration-1" : ""}
              `}
            >
              {item.task}
            </span>

            {/* Subtle Dimension Tag */}
            <span className="text-[8px] font-mono tracking-widest text-slate-400 bg-white/5 border border-white/5 px-1.5 py-0.5 rounded uppercase select-none">
              {item.dimension}
            </span>

            {/* Subtle Override Priority Dropdown */}
            <select
              value={item.priority}
              onChange={(e) => onOverridePriority(item.task, e.target.value as PriorityType)}
              className="bg-[#0D1426]/60 border border-white/5 text-[8px] uppercase font-mono tracking-widest text-slate-500 hover:text-slate-300 outline-none cursor-pointer rounded px-1.5 py-0.5 transition-colors duration-200"
            >
              <option value="Must Do" className="bg-[#080C18] text-slate-300">Must Do</option>
              <option value="Should Do" className="bg-[#080C18] text-slate-300">Should Do</option>
              <option value="Can Wait" className="bg-[#080C18] text-slate-300">Can Wait</option>
            </select>
          </div>
          
          <p className="mt-1 text-xs text-slate-400 font-light leading-relaxed">
            {item.reason}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col justify-between flex-1 py-1 md:py-2 select-none animate-slide-up text-slate-100">
      
      {/* 1. TODAY'S DIRECTION (The Hero Title) */}
      <header className="py-2 text-center md:text-left select-none mb-1">
        <h2 className="text-[10px] font-bold tracking-widest text-amber-500 uppercase mb-1">
          Today's Direction
        </h2>
        <h3 className="text-base md:text-lg font-light text-slate-100 leading-snug">
          {summary}
        </h3>
        <p className="mt-1 text-[8px] text-slate-500 font-mono tracking-wider uppercase">
          Set {formattedDate}
        </p>
      </header>

      {/* Elegant Separator Line */}
      <div className="w-full border-t border-white/10 my-2"></div>

      {/* 2. MUST DO SECTION */}
      <section className="flex flex-col gap-3 select-none" id="section-must-do">
        <h2 className="text-[10px] font-bold tracking-widest text-red-400 uppercase mb-1">
          Must Do
        </h2>
        <div className="flex flex-col gap-3">
          {mustDoTasks.map((item, index) => renderPriorityTask(item, index))}
          {mustDoTasks.length === 0 && (
            <div className="text-slate-600 text-xs py-1 italic font-light">
              No critical must-do priorities.
            </div>
          )}
        </div>
      </section>

      {/* 3. SHOULD DO SECTION */}
      {shouldDoTasks.length > 0 && (
        <>
          {/* Elegant Separator Line */}
          <div className="w-full border-t border-white/10 my-2"></div>
          
          <section className="flex flex-col gap-3 select-none" id="section-should-do">
            <h2 className="text-[10px] font-bold tracking-widest text-amber-500 uppercase mb-1">
              Should Do
            </h2>
            <div className="flex flex-col gap-3">
              {shouldDoTasks.map((item, index) => renderPriorityTask(item, index))}
            </div>
          </section>
        </>
      )}

      {/* Elegant Separator Line */}
      <div className="w-full border-t border-white/10 my-2"></div>

      {/* 4. CAN WAIT SECTION (Clean Muted Bullets) */}
      {canWaitTasks.length > 0 && (
        <section className="flex flex-col gap-2 select-none" id="section-can-wait">
          <h2 className="text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-1">
            Can Wait
          </h2>

          <div className="flex flex-col gap-2 pl-1 opacity-50 hover:opacity-75 transition-opacity duration-300">
            {canWaitTasks.map((item, index) => (
              <div key={index} className="flex items-start gap-2.5 text-xs font-light">
                <span className="text-slate-600 mt-1 select-none flex-shrink-0">•</span>
                <div className="flex-1 flex flex-wrap items-center gap-2">
                  <span className="font-medium text-slate-400 line-through decoration-slate-700 decoration-1 tracking-tight">
                    {item.task}
                  </span>

                  {/* Subtle Dimension Tag */}
                  <span className="text-[8px] font-mono tracking-widest text-slate-500 bg-white/5 border border-white/5 px-1 py-0.5 rounded uppercase select-none">
                    {item.dimension}
                  </span>

                  {/* Subtle Override Priority Dropdown */}
                  <select
                    value={item.priority}
                    onChange={(e) => onOverridePriority(item.task, e.target.value as PriorityType)}
                    className="bg-[#0D1426]/60 border border-white/5 text-[8px] uppercase font-mono tracking-widest text-slate-600 hover:text-slate-400 outline-none cursor-pointer rounded px-1.5 py-0.5 transition-colors duration-200"
                  >
                    <option value="Must Do" className="bg-[#080C18] text-slate-300">Must Do</option>
                    <option value="Should Do" className="bg-[#080C18] text-slate-300">Should Do</option>
                    <option value="Can Wait" className="bg-[#080C18] text-slate-300">Can Wait</option>
                  </select>

                  <span className="text-slate-500 font-light italic leading-normal block w-full sm:inline sm:w-auto sm:ml-2">
                    — {item.reason}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Elegant Separator Line */}
      <div className="w-full border-t border-white/10 my-2"></div>

      {/* 5. PERSISTENT INBOX BAR (Living input at the bottom) */}
      <section className="flex flex-col gap-3 py-1" id="section-persistent-input">
        <form onSubmit={handleQuickSubmit} className="flex items-center gap-3">
          <input
            type="text"
            id="persistent-quick-input"
            value={newDumpText}
            onChange={(e) => setNewDumpText(e.target.value)}
            placeholder="What's on your mind now?"
            className="flex-1 px-4 py-3 rounded-xl bg-[#0D1426]/50 border border-white/5 text-slate-100 placeholder-slate-500 outline-none text-xs focus:border-amber-500/20 focus:bg-[#0D1426]/80 transition-all duration-300"
          />
          <button
            type="submit"
            disabled={newDumpText.trim().length === 0}
            className={`px-5 py-3 rounded-xl text-[10px] font-bold tracking-wider uppercase transition-all duration-300 select-none cursor-pointer flex-shrink-0
              ${
                newDumpText.trim().length === 0
                  ? "bg-slate-800/20 text-slate-600 border border-white/5 cursor-not-allowed"
                  : "bg-white text-slate-950 hover:bg-amber-500 hover:text-white active:scale-95"
              }
            `}
          >
            Update Signal
          </button>
        </form>

        {/* 6. MUTED LINKS IN FOOTER */}
        <div className="flex items-center justify-between px-1 text-[9px] text-slate-600">
          <button
            onClick={() => setIsDumpOpen(!isDumpOpen)}
            className="hover:text-slate-400 underline underline-offset-2 cursor-pointer select-none transition-colors duration-200"
          >
            {isDumpOpen ? "Hide Original Thoughts" : "View Original Thoughts"}
          </button>
          
          <button
            onClick={onReset}
            className="hover:text-amber-500 underline underline-offset-2 cursor-pointer select-none transition-colors duration-200"
          >
            Clear & Start Fresh
          </button>
        </div>

        {isDumpOpen && (
          <div className="glass-panel rounded-xl p-3 bg-[#0D1426]/40 text-[10px] text-slate-500 font-mono leading-relaxed whitespace-pre-wrap select-text animate-fade-in max-h-[80px] overflow-y-auto">
            {originalInput}
          </div>
        )}
      </section>

    </div>
  );
}
