import React, { useState } from 'react';
import { Copy, Check, Sparkles, AlertCircle, Edit3 } from 'lucide-react';

interface GeneratedPatternCardProps {
  pattern: string;
  flags: string;
  onPatternChange: (newPattern: string) => void;
  onFlagsChange?: (newFlags: string) => void;
  regexError?: string | null;
}

export const GeneratedPatternCard: React.FC<GeneratedPatternCardProps> = ({
  pattern,
  flags,
  onPatternChange,
  regexError,
}) => {
  const [copied, setCopied] = useState(false);
  const fullRegexString = `/${pattern}/${flags}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullRegexString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative rounded-2xl border border-cyan-500/30 bg-[#13141a] p-5 shadow-[0_0_25px_rgba(6,182,212,0.1)] backdrop-blur-md overflow-hidden ring-1 ring-cyan-500/20">
      {/* Decorative background glow */}
      <div className="absolute -top-24 -right-24 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300">
              Generated RegExp Pattern
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1 hidden sm:inline-flex">
              <Edit3 className="h-3 w-3 text-cyan-400" />
              Editable live pattern
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a1b21] hover:bg-[#22242c] text-slate-200 hover:text-white border border-white/10 transition-all text-xs font-medium cursor-pointer shadow-sm"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-mono">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-slate-400" />
                  <span>Copy /{flags}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Interactive Pattern Display / Input */}
        <div className="relative group">
          <div className="flex items-center bg-[#090a0d] border border-white/10 focus-within:border-cyan-500/80 focus-within:ring-2 focus-within:ring-cyan-500/20 rounded-xl px-4 py-3 font-mono text-base text-cyan-300 shadow-inner transition-all">
            <span className="text-slate-500 select-none text-lg font-bold pr-1">/</span>
            <input
              type="text"
              value={pattern}
              onChange={(e) => onPatternChange(e.target.value)}
              placeholder="enter regex pattern..."
              className="flex-1 bg-transparent text-cyan-300 focus:outline-none font-mono text-base placeholder:text-slate-700"
            />
            <span className="text-slate-500 select-none text-lg font-bold pl-1">/</span>
            <span className="text-cyan-400 font-bold ml-1 text-base select-none">{flags}</span>
          </div>
        </div>

        {regexError && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
            <div>
              <span className="font-semibold">Invalid JavaScript RegExp Syntax:</span>
              <p className="font-mono mt-0.5 text-rose-200">{regexError}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
