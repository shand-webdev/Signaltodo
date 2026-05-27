"use client";

import React, { useState, useEffect, useRef } from "react";
import { LifeTask, SignalResponse, PriorityType } from "../types";
import LoadingState from "../components/LoadingState";

const LOCAL_STORAGE_KEY = "signal_clarity_session";
const HISTORY_STORAGE_KEY = "signal_history";

interface HistoryItem {
  id: string;
  input: string;
  tasks: LifeTask[];
  summary: string;
  timestamp: number;
  completedTasks: string[];
}

const DIMENSIONS = [
  "Startup",
  "Career",
  "Health",
  "Finance",
  "Relationships",
  "Creativity",
  "Learning",
  "Content",
  "Personal",
  "Home",
  "Networking",
  "Admin"
] as const;

const MOTIVATIONAL_PHRASES = [
  "Build. Focus. Ship.",
  "Think. Create. Repeat.",
  "Clarity Beats Chaos.",
  "Start Before Ready.",
  "Create Don't Consume.",
  "Make It Happen."
];

export default function Home() {
  const [input, setInput] = useState<string>("");
  const [tasks, setTasks] = useState<LifeTask[]>([]);
  const [summary, setSummary] = useState<string>("");
  const [timestamp, setTimestamp] = useState<number | null>(null);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedDimension, setSelectedDimension] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  
  const [newThoughtsText, setNewThoughtsText] = useState("");
  const [motivationalPhrase, setMotivationalPhrase] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDumpOpen, setIsDumpOpen] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize random phrase, active session, and history on mount
  useEffect(() => {
    setIsMounted(true);
    
    // 1. Pick a random motivational phrase
    const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_PHRASES.length);
    setMotivationalPhrase(MOTIVATIONAL_PHRASES[randomIndex]);

    try {
      // 2. Load active session
      const savedActive = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedActive) {
        const parsed = JSON.parse(savedActive);
        
        if (parsed.input) setInput(parsed.input);
        if (parsed.timestamp) setTimestamp(parsed.timestamp);
        if (parsed.completedTasks) setCompletedTasks(parsed.completedTasks);
        if (parsed.summary) setSummary(parsed.summary);
        if (parsed.tasks) {
          setTasks(parsed.tasks);
        }
      }

      // 3. Load History list
      const savedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (e) {
      console.error("Failed to load Signal data from localStorage:", e);
    }
  }, []);

  const handleAnalyze = async (text: string) => {
    if (text.trim().length === 0 || isLoading) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: text }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to analyze mind. Please try again.");
      }

      const signalResponse = data as SignalResponse;
      const noteTimestamp = Date.now();
      
      // Flatten response tasks
      const mustTasks = (signalResponse.must || []).map(t => ({ ...t, priority: "Must Do" as const }));
      const shouldTasks = (signalResponse.should || []).map(t => ({ ...t, priority: "Should Do" as const }));
      const waitTasks = (signalResponse.wait || []).map(t => ({ ...t, priority: "Can Wait" as const }));
      const combinedTasks = [...mustTasks, ...shouldTasks, ...waitTasks];

      setTasks(combinedTasks);
      setSummary(signalResponse.summary);
      setTimestamp(noteTimestamp);
      setCompletedTasks([]); // Reset ticks for fresh dump
      setInput(text);

      const sessionData = {
        input: text,
        tasks: combinedTasks,
        summary: signalResponse.summary,
        timestamp: noteTimestamp,
        completedTasks: [],
      };

      // Sync active session
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sessionData));

      // Append to History
      const historyItem: HistoryItem = {
        id: noteTimestamp.toString(),
        input: text,
        tasks: combinedTasks,
        summary: signalResponse.summary,
        timestamp: noteTimestamp,
        completedTasks: [],
      };

      setHistory((prev) => {
        // Exclude duplicate inputs to keep history clean
        const filtered = prev.filter((item) => item.input.toLowerCase() !== text.toLowerCase());
        const updated = [historyItem, ...filtered].slice(0, 15);
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    } catch (err: any) {
      console.error("Analysis failed:", err);
      setError(err.message || "An error occurred while connecting to the AI brain.");
    } finally {
      setIsLoading(false);
    }
  };

  // Continuous writing bar append handler
  const handleAnalyzeAgain = async (newThoughtsText: string) => {
    const combinedDump = input ? `${input}, ${newThoughtsText}` : newThoughtsText;
    await handleAnalyze(combinedDump);
  };

  const handleToggleComplete = (taskText: string) => {
    setCompletedTasks((prev) => {
      const updated = prev.includes(taskText)
        ? prev.filter((t) => t !== taskText)
        : [...prev, taskText];
      
      // Save current status to local storage
      if (timestamp) {
        const session = {
          input,
          tasks,
          summary,
          timestamp,
          completedTasks: updated,
        };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(session));

        // Sync completedTasks state back into history for consistency
        setHistory(prevHist => {
          const updatedHist = prevHist.map(item => 
            item.timestamp === timestamp ? { ...item, completedTasks: updated } : item
          );
          localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHist));
          return updatedHist;
        });
      }
      return updated;
    });
  };

  const handleOverridePriority = (taskText: string, newPriority: PriorityType) => {
    setTasks((prev) => {
      const updated = prev.map((t) =>
        t.task === taskText ? { ...t, priority: newPriority } : t
      );

      // Save updated tasks list to localStorage
      if (timestamp) {
        const session = {
          input,
          tasks: updated,
          summary,
          timestamp,
          completedTasks,
        };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(session));

        // Sync overridden task list into history list
        setHistory(prevHist => {
          const updatedHist = prevHist.map(item => 
            item.timestamp === timestamp ? { ...item, tasks: updated } : item
          );
          localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHist));
          return updatedHist;
        });
      }
      return updated;
    });
  };

  const handleRestoreSession = (item: HistoryItem) => {
    setInput(item.input);
    setTasks(item.tasks);
    setSummary(item.summary);
    setTimestamp(item.timestamp);
    setCompletedTasks(item.completedTasks || []);
    setError(null);
    setIsSidebarOpen(false); // Close sidebar after restoring

    // Save restored session as active session
    const sessionData = {
      input: item.input,
      tasks: item.tasks,
      summary: item.summary,
      timestamp: item.timestamp,
      completedTasks: item.completedTasks || [],
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sessionData));
  };

  const handleDeleteHistory = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation(); // Avoid restoring session when clicking delete
    setHistory((prev) => {
      const updated = prev.filter((item) => item.id !== itemId);
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const handleReset = () => {
    setTasks([]);
    setSummary("");
    setInput("");
    setTimestamp(null);
    setCompletedTasks([]);
    setError(null);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (e) {
      console.error("Failed to clear localStorage:", e);
    }
  };

  const handleExampleTrigger = () => {
    const example = "Call Founder important, Fold clothes, buy groceries ASAP client deadline, watch startup videos, write a story.";
    setNewThoughtsText(example);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newThoughtsText.trim().length > 0) {
      // If we have an active session, append new thoughts. Otherwise, run fresh morning dump.
      if (tasks.length > 0 && input) {
        const appended = `${input}, ${newThoughtsText}`;
        handleAnalyze(appended);
      } else {
        handleAnalyze(newThoughtsText);
      }
      setNewThoughtsText("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (newThoughtsText.trim().length > 0) {
        handleInputSubmit(e);
      }
    }
  };

  // Hydration guard
  if (!isMounted) {
    return <div className="h-screen w-screen bg-[#080C18]" />;
  }

  // Filter tasks based on right sidebar dimension selection
  const filteredTasks = tasks.filter(
    (t) => !selectedDimension || t.dimension === selectedDimension
  );

  const mustDo = filteredTasks.filter((t) => t.priority === "Must Do");
  const shouldDo = filteredTasks.filter((t) => t.priority === "Should Do");
  const canWait = filteredTasks.filter((t) => t.priority === "Can Wait");

  // Format active timestamp
  let activeFormattedDate = "";
  if (timestamp) {
    const date = new Date(timestamp);
    activeFormattedDate = date.toLocaleDateString("en-US", {
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // Common renderer for high-density tasks
  const renderLifeTask = (item: LifeTask, index: number) => {
    const isCompleted = completedTasks.includes(item.task);
    return (
      <div
        key={index}
        className={`group flex items-start gap-3 py-2 border-b border-white/5 last:border-b-0 transition-all duration-300
          ${isCompleted ? "opacity-30 scale-[0.99]" : "hover:translate-x-0.5"}
        `}
      >
        {/* satisfies lightweight checkbox tick */}
        <div
          onClick={() => handleToggleComplete(item.task)}
          className="flex-shrink-0 mt-0.5 cursor-pointer w-4 h-4 rounded border border-slate-700 bg-[#080C18]/60 flex items-center justify-center transition-all duration-200 hover:border-amber-500 bg-amber-500/5 select-none"
        >
          {isCompleted ? (
            <svg className="w-3.5 h-3.5 text-amber-500 font-bold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <div className="w-1.5 h-1.5 rounded-sm bg-transparent group-hover:bg-amber-500/20"></div>
          )}
        </div>

        {/* Task Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-wrap gap-1.5">
            <span
              onClick={() => handleToggleComplete(item.task)}
              className={`text-xs font-semibold text-slate-100 cursor-pointer tracking-tight leading-tight select-none
                ${isCompleted ? "line-through text-slate-500 decoration-1" : ""}
              `}
            >
              {item.task}
            </span>

            {/* Subtle Tag */}
            <span className="text-[7.5px] font-mono tracking-widest text-slate-400 bg-white/5 border border-white/5 px-1 py-0.2 rounded uppercase select-none">
              {item.dimension}
            </span>

            {/* Subtle User Override Pill Dropdown */}
            <select
              value={item.priority}
              onChange={(e) => handleOverridePriority(item.task, e.target.value as PriorityType)}
              className="bg-[#0B1020] border border-white/5 text-[7.5px] uppercase font-mono tracking-wider text-slate-500 hover:text-slate-300 outline-none cursor-pointer rounded px-1 py-0.2 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-200"
            >
              <option value="Must Do" className="bg-[#080C18] text-slate-300">Must Do</option>
              <option value="Should Do" className="bg-[#080C18] text-slate-300">Should Do</option>
              <option value="Can Wait" className="bg-[#080C18] text-slate-300">Can Wait</option>
            </select>
          </div>
          <p className="text-[10px] text-slate-500 font-light mt-0.5 leading-relaxed tracking-tight select-text">
            {item.reason}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen w-screen flex bg-[#080C18] text-slate-100 font-sans overflow-hidden select-none relative">
      
      {/* SIDEBAR NAVIGATION (Left Panel - Push Transition) */}
      <aside
        className={`h-full bg-[#060912] border-r border-slate-900/60 flex flex-col justify-between py-6 transition-all duration-300 ease-in-out overflow-hidden flex-shrink-0 select-none shadow-2xl
          ${isSidebarOpen ? "w-64 lg:w-72 px-4" : "w-0 px-0 border-r-0"}
        `}
      >
        <div 
          className={`flex flex-col gap-6 h-full overflow-hidden justify-start transition-all duration-300
            ${isSidebarOpen ? "opacity-100 delay-100" : "opacity-0 pointer-events-none"}
          `}
          style={{ width: "240px" }}
        >
          
          {/* Sidebar Top / Close Toggle */}
          <div className="flex items-center justify-between flex-shrink-0">
            <span className="text-[10px] font-bold tracking-widest text-amber-500 uppercase">
              Signal OS
            </span>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-1 rounded hover:bg-white/5 text-slate-500 hover:text-slate-200 text-sm select-none cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* SECTION 1: HISTORY (ChatGPT-style past dumps) */}
          <div className="flex flex-col overflow-hidden max-h-[35%] flex-shrink-0">
            <h2 className="text-[9px] font-bold tracking-widest text-slate-500 uppercase mb-2">
              History
            </h2>
            
            <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-1 pr-1">
              {history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleRestoreSession(item)}
                  className={`group relative px-2.5 py-1.5 rounded-lg text-xs font-light text-slate-400 hover:text-slate-100 hover:bg-white/5 transition-all duration-200 cursor-pointer flex items-center justify-between select-none
                    ${timestamp === item.timestamp ? "bg-white/5 text-amber-500 font-medium" : ""}
                  `}
                >
                  <span className="truncate pr-4 flex-1">{item.input}</span>
                  <button
                    onClick={(e) => handleDeleteHistory(e, item.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-slate-200 text-xs px-1 select-none cursor-pointer transition-opacity duration-200 absolute right-1.5"
                  >
                    ×
                  </button>
                </div>
              ))}
              {history.length === 0 && (
                <div className="text-[10px] text-slate-600 italic py-1 pl-1 select-none font-light">
                  No logs recorded.
                </div>
              )}
            </div>
          </div>

          {/* Thin Sidebar Separator */}
          <div className="w-full border-t border-white/5 flex-shrink-0"></div>

          {/* SECTION 2: DIMENSION FILTERS */}
          <div className="flex-grow flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-2 flex-shrink-0">
              <h2 className="text-[9px] font-bold tracking-widest text-slate-500 uppercase">
                Filter by Area
              </h2>
              {selectedDimension && (
                <button
                  onClick={() => setSelectedDimension(null)}
                  className="text-[8px] text-amber-500 hover:text-amber-400 uppercase font-mono tracking-wider cursor-pointer"
                >
                  Clear Filter
                </button>
              )}
            </div>

            <div className="flex-grow overflow-y-auto no-scrollbar flex flex-col gap-0.5 pr-1">
              {/* All Option */}
              <button
                onClick={() => setSelectedDimension(null)}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-light transition-all duration-200 select-none cursor-pointer flex items-center justify-between
                  ${
                    !selectedDimension
                      ? "text-amber-500 bg-white/5 font-semibold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                  }
                `}
              >
                <span>All Areas</span>
                <span className="text-[8px] font-mono text-slate-600">{tasks.length}</span>
              </button>

              {/* Dimensions map */}
              {DIMENSIONS.map((dim) => {
                const count = tasks.filter((t) => t.dimension === dim).length;
                const isActive = selectedDimension === dim;
                return (
                  <button
                    key={dim}
                    onClick={() => setSelectedDimension(dim)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-light transition-all duration-200 select-none cursor-pointer flex items-center justify-between
                      ${
                        isActive
                          ? "text-amber-500 bg-white/5 font-semibold"
                          : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                      }
                    `}
                  >
                    <span>{dim}</span>
                    {count > 0 && (
                      <span className={`text-[8.5px] font-mono font-bold px-1.5 rounded-full select-none
                        ${isActive ? "bg-amber-500/20 text-amber-500" : "text-slate-500 bg-white/5"}
                      `}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* SECTION 3: SETTINGS PLACEHOLDER */}
        <div 
          className={`pt-3 border-t border-white/5 select-none flex flex-col gap-2 transition-all duration-300
            ${isSidebarOpen ? "opacity-100 delay-100" : "opacity-0 pointer-events-none"}
          `}
          style={{ width: "240px" }}
        >
          <div className="flex items-center gap-2 px-2.5 py-1 text-slate-500 text-[10px] select-none font-mono tracking-widest uppercase">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Settings</span>
          </div>
          <div className="text-[8.5px] text-slate-600 font-mono tracking-widest text-center uppercase py-1 select-none">
            Signal OS v1.4
          </div>
        </div>

      </aside>

      {/* MAIN WORKSPACE (Resizes and shifts right dynamically) */}
      <main className="flex-1 flex flex-col justify-between p-6 md:p-8 overflow-hidden relative">
        
        {/* Sidebar Toggle Button (Absolute Top-Left Corner of Viewport/Workspace) */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute top-5 left-5 z-30 p-1.5 rounded-lg border border-white/5 bg-[#0F1524]/40 hover:bg-[#0F1524]/80 text-slate-400 hover:text-slate-100 cursor-pointer transition-all duration-200 select-none shadow-md flex-shrink-0"
          title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Radial Ambient Glow */}
        <div className="absolute top-[-25%] left-[20%] w-[60%] h-[40%] rounded-full bg-amber-500/5 blur-[120px] pointer-events-none select-none"></div>

        <div className="flex flex-col gap-6 flex-1 overflow-hidden justify-start">
          
          {/* Top Bar Layout (Center-aligned motivational hero phrase) */}
          <div className="w-full max-w-2xl mx-auto flex items-center justify-center flex-shrink-0 select-none pt-2">
            <h1 className="text-xl md:text-2xl font-extralight tracking-[0.2em] text-slate-300 uppercase leading-none font-sans filter drop-shadow-sm select-none text-center">
              {motivationalPhrase}
            </h1>
          </div>


          {/* Claude-style Premium Input Composer */}
          <div className="w-full max-w-2xl mx-auto">
            <form 
              onSubmit={handleInputSubmit} 
              className="bg-[#0F1524]/65 border border-white/5 shadow-2xl rounded-2xl p-3.5 flex flex-col gap-3 focus-within:border-amber-500/20 focus-within:bg-[#0F1524]/85 transition-all duration-300 focus-within:shadow-[0_8px_40px_-15px_rgba(245,158,11,0.06)]"
            >
              {/* Textarea inside Composer */}
              <textarea
                ref={textareaRef}
                value={newThoughtsText}
                onChange={(e) => setNewThoughtsText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={tasks.length > 0 ? "What's on your mind now?" : "Dump everything on your mind today... (e.g. Call Founder important, Fold clothes, write a story)"}
                className="w-full bg-transparent border-none text-slate-100 placeholder-slate-500 outline-none text-sm leading-relaxed resize-none h-[44px] focus:h-[68px] transition-all duration-300 no-scrollbar"
              />
              
              {/* Bottom Actions Row inside Composer */}
              <div className="flex items-center justify-between pt-2.5 border-t border-white/5">
                {/* Left Side: Try Example link */}
                {tasks.length === 0 ? (
                  <button
                    type="button"
                    onClick={handleExampleTrigger}
                    className="text-[10px] text-slate-500 hover:text-slate-300 underline underline-offset-4 cursor-pointer font-light select-none tracking-wide"
                  >
                    Try Example Dump
                  </button>
                ) : (
                  <div className="text-[9px] text-slate-500 tracking-wide select-none">
                    Continuous thought appender active.
                  </div>
                )}
                
                {/* Right Side: Update Signal button */}
                <button
                  type="submit"
                  disabled={newThoughtsText.trim().length === 0 || isLoading}
                  className={`px-5 py-2.5 rounded-xl text-[10px] font-bold tracking-widest uppercase transition-all duration-300 select-none cursor-pointer
                    ${
                      newThoughtsText.trim().length === 0 || isLoading
                        ? "bg-slate-800/10 text-slate-600 border border-white/5 cursor-not-allowed"
                        : "bg-white text-slate-950 hover:bg-amber-500 hover:text-white shadow-md active:scale-95"
                    }
                  `}
                >
                  {isLoading ? "Thinking..." : "Update Signal"}
                </button>
              </div>
            </form>
          </div>

          {/* Global Error Notice */}
          {error && (
            <div className="w-full max-w-2xl mx-auto glass-panel border-red-500/10 bg-red-500/5 rounded-xl p-3 flex items-center justify-between animate-fade-in">
              <span className="text-xs text-red-400 font-light pl-2">Error: {error}</span>
              <button onClick={() => setError(null)} className="text-slate-600 hover:text-slate-400 text-xs px-2 select-none cursor-pointer">×</button>
            </div>
          )}

          {/* MAIN PRIORITIZATION DECK: 3 Horizontal Columns */}
          <div className="flex-1 w-full max-w-5xl mx-auto overflow-hidden mt-2">
            {isLoading ? (
              <LoadingState />
            ) : tasks.length > 0 ? (
              <div className="grid grid-cols-3 gap-6 h-full items-stretch overflow-hidden animate-fade-in">
                
                {/* 1. MUST DO COLUMN (Warm Amber Header) */}
                <div className="flex flex-col gap-3 h-full overflow-hidden" id="col-must-do">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2 px-1 flex-shrink-0">
                    <span className="text-[10px] font-bold tracking-widest text-amber-500 uppercase">
                      Must Do
                    </span>
                    <span className="text-[8px] font-mono text-slate-500">{mustDo.length} items</span>
                  </div>
                  <div className="flex-1 overflow-y-auto no-scrollbar pr-1">
                    {mustDo.map((item, idx) => renderLifeTask(item, idx))}
                    {mustDo.length === 0 && (
                      <div className="text-slate-600 text-[10px] italic py-2 font-light pl-1 select-none">
                        No critical priorities today.
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. SHOULD DO COLUMN (Muted Amber) */}
                <div className="flex flex-col gap-3 h-full overflow-hidden" id="col-should-do">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2 px-1 flex-shrink-0">
                    <span className="text-[10px] font-bold tracking-widest text-amber-500/80 uppercase">
                      Should Do
                    </span>
                    <span className="text-[8px] font-mono text-slate-500">{shouldDo.length} items</span>
                  </div>
                  <div className="flex-1 overflow-y-auto no-scrollbar pr-1">
                    {shouldDo.map((item, idx) => renderLifeTask(item, idx))}
                    {shouldDo.length === 0 && (
                      <div className="text-slate-600 text-[10px] italic py-2 font-light pl-1 select-none">
                        No secondary tasks.
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. CAN WAIT COLUMN (Muted Slate Bullet list) */}
                <div className="flex flex-col gap-3 h-full overflow-hidden" id="col-can-wait">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2 px-1 flex-shrink-0">
                    <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                      Can Wait
                    </span>
                    <span className="text-[8px] font-mono text-slate-500">{canWait.length} items</span>
                  </div>
                  <div className="flex-1 overflow-y-auto no-scrollbar pr-1 opacity-60 hover:opacity-85 transition-opacity duration-300">
                    {canWait.map((item, idx) => renderLifeTask(item, idx))}
                    {canWait.length === 0 && (
                      <div className="text-slate-600 text-[10px] italic py-2 font-light pl-1 select-none">
                        No postponed chores.
                      </div>
                    )}
                  </div>
                </div>

              </div>
            ) : (
              /* EMPTY PREVIEW WORKSPACE */
              <div className="h-full flex flex-col items-center justify-center text-center px-4 animate-fade-in">
                <div className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center mb-4 select-none">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/40 animate-ping"></div>
                </div>
                <p className="text-sm font-light text-slate-400 select-none max-w-sm leading-relaxed">
                  Enter your morning thoughts in the composer above. Signal will map the life dimensions and isolate your focus instantly.
                </p>
              </div>
            )}
          </div>

        </div>

        {/* Dynamic Workspace Footers */}
        {tasks.length > 0 && !isLoading && (
          <div className="flex items-center justify-between max-w-2xl w-full mx-auto pt-3 border-t border-white/5 text-[9px] text-slate-600 select-none flex-shrink-0 mt-3">
            <button
              onClick={() => setIsDumpOpen(!isDumpOpen)}
              className="hover:text-slate-400 underline underline-offset-2 cursor-pointer transition-colors duration-200"
            >
              {isDumpOpen ? "Hide Original Thoughts" : "View Original Thoughts"}
            </button>
            
            <button
              onClick={handleReset}
              className="hover:text-amber-500 underline underline-offset-2 cursor-pointer transition-colors duration-200"
            >
              Clear Workspace
            </button>

            {isDumpOpen && (
              <div className="absolute bottom-16 left-6 right-6 max-w-2xl mx-auto glass-panel rounded-xl p-3.5 bg-[#0A0F1D]/95 text-[10px] text-slate-500 font-mono leading-relaxed whitespace-pre-wrap select-text animate-fade-in max-h-[80px] overflow-y-auto border border-white/5 shadow-2xl z-20">
                {input}
              </div>
            )}
          </div>
        )}
      </main>

    </div>
  );
}
