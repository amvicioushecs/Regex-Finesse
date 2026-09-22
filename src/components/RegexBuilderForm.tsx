import React from 'react';
import { RegexFlags } from '../types';
import { FlagSelector } from './FlagSelector';
import { Sparkles, Loader2, ArrowRight, Bot } from 'lucide-react';

interface RegexBuilderFormProps {
  description: string;
  onDescriptionChange: (val: string) => void;
  flags: RegexFlags;
  onFlagsChange: (flags: RegexFlags) => void;
  onSubmit: () => void;
  isLoading: boolean;
  engine: 'gemini' | 'grok';
  onEngineChange: (engine: 'gemini' | 'grok') => void;
  hasGeminiKey?: boolean;
  hasXaiKey?: boolean;
}

export const RegexBuilderForm: React.FC<RegexBuilderFormProps> = ({
  description,
  onDescriptionChange,
  flags,
  onFlagsChange,
  onSubmit,
  isLoading,
  engine,
  onEngineChange,
  hasGeminiKey,
  hasXaiKey,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || isLoading) return;
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            Plain English Pattern Prompt
          </label>

          {/* Model / Engine Selector */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-zinc-500 font-medium hidden sm:inline-block">Engine:</span>
            <div className="flex items-center p-0.5 rounded-lg bg-zinc-950 border border-zinc-800 text-[11px]">
              <button
                type="button"
                onClick={() => onEngineChange('gemini')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                  engine === 'gemini'
                    ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="Google Gemini 3.8 Flash Engine"
              >
                <Sparkles className="h-3 w-3 text-cyan-400" />
                <span>Gemini 3.8 Flash</span>
              </button>

              <button
                type="button"
                onClick={() => onEngineChange('grok')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                  engine === 'grok'
                    ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="xAI grok-4.5 Engine"
              >
                <Bot className="h-3 w-3 text-slate-400" />
                <span>grok-4.5</span>
              </button>
            </div>
          </div>
        </div>

        <div className="relative">
          <textarea
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder='e.g., "US phone numbers", "Extract email addresses", or "ISO 8601 dates like 2026-06-24"'
            rows={3}
            className="w-full rounded-xl border border-white/10 bg-[#090a0d] p-3.5 text-sm text-slate-100 placeholder:text-slate-600 focus:border-cyan-500/80 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all resize-none font-sans"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-1">
        <div className="flex-1">
          <FlagSelector flags={flags} onChange={onFlagsChange} />
        </div>

        <button
          type="submit"
          disabled={!description.trim() || isLoading}
          className="group relative inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 via-sky-600 to-indigo-600 hover:from-cyan-500 hover:via-sky-500 hover:to-indigo-500 text-white font-medium text-sm shadow-[0_0_20px_rgba(6,182,212,0.3)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shrink-0 cursor-pointer overflow-hidden border border-cyan-400/30"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-white" />
              <span>Building Regex...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 text-cyan-200 group-hover:rotate-12 transition-transform" />
              <span>Build Regex</span>
              <ArrowRight className="h-4 w-4 text-cyan-200 group-hover:translate-x-0.5 transition-transform" />
            </>
          )}
        </button>
      </div>
    </form>
  );
};
