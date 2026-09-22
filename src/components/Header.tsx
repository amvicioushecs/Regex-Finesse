import React from 'react';
import { Terminal, Sparkles, ShieldCheck, KeyRound, BookOpen, Layers } from 'lucide-react';

interface HeaderProps {
  hasApiKey: boolean | null;
  hasGeminiKey?: boolean;
  hasXaiKey?: boolean;
  activeView: 'studio' | 'database';
  onViewChange: (view: 'studio' | 'database') => void;
  templateCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  hasApiKey,
  hasGeminiKey,
  hasXaiKey,
  activeView,
  onViewChange,
  templateCount,
}) => {
  return (
    <header className="border-b border-white/10 bg-[#13141a]/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 p-0.5 shadow-[0_0_15px_rgba(6,182,212,0.25)] flex items-center justify-center">
            <Terminal className="h-5 w-5 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                Regex <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">Finesse</span>
              </h1>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hidden sm:inline-block">
                AI Studio
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Plain English regex studio & documentation template database
            </p>
          </div>
        </div>

        {/* View Navigation Switcher */}
        <div className="flex items-center p-1 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs">
          <button
            onClick={() => onViewChange('studio')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeView === 'studio'
                ? 'bg-cyan-500 text-zinc-950 font-bold shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Regex Studio</span>
          </button>

          <button
            onClick={() => onViewChange('database')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeView === 'database'
                ? 'bg-cyan-500 text-zinc-950 font-bold shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Template Database</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeView === 'database'
                  ? 'bg-zinc-950/30 text-zinc-950 font-bold'
                  : 'bg-zinc-800 text-cyan-400 border border-zinc-700'
              }`}
            >
              {templateCount}
            </span>
          </button>
        </div>

        {/* Status Indicators */}
        <div className="hidden md:flex items-center gap-2">
          {hasGeminiKey && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 text-xs font-medium">
              <Sparkles className="h-3 w-3 text-cyan-400" />
              <span>Gemini AI Active</span>
            </div>
          )}

          {hasXaiKey ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
              <ShieldCheck className="h-3 w-3 text-emerald-400" />
              <span>xAI Connected</span>
            </div>
          ) : !hasGeminiKey && hasApiKey === false ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">
              <KeyRound className="h-3 w-3 animate-pulse" />
              <span>API Key Required</span>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
};
