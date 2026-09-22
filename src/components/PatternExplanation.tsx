import React from 'react';
import { RegexComponent, RegexExamples } from '../types';
import { BookOpen, Layers, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

interface PatternExplanationProps {
  explanation: string;
  components: RegexComponent[];
  examples?: RegexExamples;
  onUseExampleText?: (text: string) => void;
}

export const PatternExplanation: React.FC<PatternExplanationProps> = ({
  explanation,
  components,
  examples,
  onUseExampleText,
}) => {
  return (
    <div className="space-y-4">
      {/* Overview Explanation */}
      {explanation && (
        <div className="rounded-xl border border-white/10 bg-[#13141a] p-4 space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">
            <BookOpen className="h-4 w-4" />
            <span>Pattern Explanation</span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed font-sans">{explanation}</p>
        </div>
      )}

      {/* Component Token Breakdown */}
      {components && components.length > 0 && (
        <div className="rounded-xl border border-white/10 bg-[#13141a] p-4 space-y-3">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">
            <Layers className="h-4 w-4" />
            <span>Token Breakdown</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {components.map((comp, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-2.5 rounded-lg bg-[#090a0d] border border-white/10 font-sans"
              >
                <code className="px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 font-mono text-xs font-bold shrink-0">
                  {comp.token || '•'}
                </code>
                <span className="text-xs text-slate-300 leading-tight self-center">
                  {comp.meaning}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Examples Badges */}
      {examples && (examples.matches?.length > 0 || examples.non_matches?.length > 0) && (
        <div className="rounded-xl border border-white/10 bg-[#13141a] p-4 space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 block">
            Generated Validation Examples
          </span>

          <div className="space-y-2">
            {examples.matches?.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 font-mono">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Expected Matches
                </span>
                <div className="flex flex-wrap gap-2">
                  {examples.matches.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => onUseExampleText?.(item)}
                      title="Click to test in live editor"
                      className="group flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 hover:border-emerald-400 font-mono text-xs transition-colors cursor-pointer"
                    >
                      <span>{item}</span>
                      <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {examples.non_matches?.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] text-rose-400 font-medium flex items-center gap-1 font-mono">
                  <XCircle className="h-3.5 w-3.5" /> Non-Matches
                </span>
                <div className="flex flex-wrap gap-2">
                  {examples.non_matches.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => onUseExampleText?.(item)}
                      title="Click to test in live editor"
                      className="group flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-950/30 border border-rose-500/30 text-rose-300 hover:border-rose-400 font-mono text-xs transition-colors cursor-pointer"
                    >
                      <span>{item}</span>
                      <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
