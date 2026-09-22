import React, { useMemo, useRef } from 'react';
import { MatchDetail, MatchCaptureGroup } from '../types';
import { Play, ListFilter, Target, AlignLeft } from 'lucide-react';

interface LiveTesterProps {
  pattern: string;
  flags: string;
  sampleText: string;
  onSampleTextChange: (text: string) => void;
  regexError: string | null;
}

export const LiveTester: React.FC<LiveTesterProps> = ({
  pattern,
  flags,
  sampleText,
  onSampleTextChange,
  regexError,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  // Synchronize scroll position between textarea and highlight backdrop
  const handleScroll = () => {
    if (textareaRef.current && backdropRef.current) {
      backdropRef.current.scrollTop = textareaRef.current.scrollTop;
      backdropRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  // Execute client-side RegExp match calculation
  const { matches, isValidRegex } = useMemo(() => {
    if (!pattern || regexError) {
      return { matches: [], isValidRegex: false };
    }

    try {
      const regex = new RegExp(pattern, flags);
      const matchesList: MatchDetail[] = [];

      if (!flags.includes('g')) {
        const match = regex.exec(sampleText);
        if (match && match[0] !== '') {
          const groups: MatchCaptureGroup[] = [];
          for (let i = 1; i < match.length; i++) {
            groups.push({
              index: i,
              content: match[i] ?? '',
            });
          }
          if (match.groups) {
            Object.entries(match.groups).forEach(([name, val]) => {
              groups.push({
                index: -1,
                name,
                content: val ?? '',
              });
            });
          }

          matchesList.push({
            matchIndex: 0,
            fullMatch: match[0],
            startIndex: match.index,
            endIndex: match.index + match[0].length,
            groups,
          });
        }
      } else {
        let match: RegExpExecArray | null;
        let count = 0;
        const maxMatches = 1000; // Safeguard against excessive iterations

        while ((match = regex.exec(sampleText)) !== null && count < maxMatches) {
          if (match[0] === '') {
            regex.lastIndex++; // Advance manually on zero-width match to prevent infinite loops
            continue;
          }

          const groups: MatchCaptureGroup[] = [];
          for (let i = 1; i < match.length; i++) {
            groups.push({
              index: i,
              content: match[i] ?? '',
            });
          }
          if (match.groups) {
            Object.entries(match.groups).forEach(([name, val]) => {
              groups.push({
                index: -1,
                name,
                content: val ?? '',
              });
            });
          }

          matchesList.push({
            matchIndex: count,
            fullMatch: match[0],
            startIndex: match.index,
            endIndex: match.index + match[0].length,
            groups,
          });

          count++;
        }
      }

      return { matches: matchesList, isValidRegex: true };
    } catch {
      return { matches: [], isValidRegex: false };
    }
  }, [pattern, flags, sampleText, regexError]);

  // Generate highlighted JSX representation for overlay
  const highlightedJSX = useMemo(() => {
    if (!isValidRegex || matches.length === 0 || !sampleText) {
      return <span>{sampleText}</span>;
    }

    const elements: React.ReactNode[] = [];
    let lastEnd = 0;

    matches.forEach((m) => {
      if (m.startIndex > lastEnd) {
        elements.push(sampleText.substring(lastEnd, m.startIndex));
      }

      elements.push(
        <mark
          key={`match-${m.matchIndex}-${m.startIndex}`}
          className="bg-cyan-500/30 text-cyan-200 border border-cyan-400/50 rounded px-0.5 py-0 font-mono shadow-[0_0_10px_rgba(6,182,212,0.3)] transition-all"
        >
          {m.fullMatch}
        </mark>
      );

      lastEnd = m.endIndex;
    });

    if (lastEnd < sampleText.length) {
      elements.push(sampleText.substring(lastEnd));
    }

    return elements;
  }, [matches, sampleText, isValidRegex]);

  return (
    <div className="space-y-4">
      {/* Live Tester Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Play className="h-4 w-4 text-cyan-400 fill-cyan-400/20" />
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300">
            Live Tester & Validator
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {isValidRegex && (
            <span
              className={`text-xs font-mono font-medium px-3 py-1 rounded-full border transition-all ${
                matches.length > 0
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 shadow-sm shadow-emerald-500/10'
                  : 'bg-[#1a1b21] text-slate-400 border-white/10'
              }`}
            >
              {matches.length} {matches.length === 1 ? 'match' : 'matches'} found
            </span>
          )}
        </div>
      </div>

      {/* Editor & Highlight Container */}
      <div className="relative rounded-xl border border-white/10 bg-[#090a0d] overflow-hidden focus-within:border-cyan-500/80 focus-within:ring-2 focus-within:ring-cyan-500/20 transition-all">
        {/* Backdrop for highlighted text */}
        <div
          ref={backdropRef}
          aria-hidden="true"
          className="absolute inset-0 p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap break-words pointer-events-none text-transparent overflow-auto"
          style={{ wordBreak: 'break-word' }}
        >
          {highlightedJSX}
          {sampleText.endsWith('\n') && <br />}
        </div>

        {/* Textarea for user input */}
        <textarea
          ref={textareaRef}
          value={sampleText}
          onChange={(e) => onSampleTextChange(e.target.value)}
          onScroll={handleScroll}
          placeholder="Paste or type test text here to test your regular expression live..."
          rows={6}
          spellCheck={false}
          className="relative z-10 w-full p-4 bg-transparent text-slate-200 font-mono text-sm leading-relaxed focus:outline-none resize-y min-h-[160px]"
          style={{ caretColor: '#38bdf8' }}
        />
      </div>

      {/* Capture Groups Breakdown List */}
      {matches.length > 0 && (
        <div className="rounded-xl border border-white/10 bg-[#13141a] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400 flex items-center gap-1.5">
              <ListFilter className="h-4 w-4" />
              <span>Matches & Capture Groups ({matches.length})</span>
            </span>
            <span className="text-[11px] text-slate-400 font-mono">JS RegExp Engine</span>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
            {matches.map((m) => (
              <div
                key={m.matchIndex}
                className="p-3 rounded-lg bg-[#090a0d] border border-white/10 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 font-mono text-[11px] font-bold border border-cyan-500/30">
                      Match #{m.matchIndex + 1}
                    </span>
                    <span className="text-slate-400 text-[11px] font-mono">
                      [Index {m.startIndex}..{m.endIndex}]
                    </span>
                  </div>
                  <code className="text-cyan-300 font-mono font-medium px-2 py-0.5 rounded bg-[#1a1b21] border border-white/10">
                    "{m.fullMatch}"
                  </code>
                </div>

                {m.groups.length > 0 ? (
                  <div className="pl-3 border-l-2 border-cyan-500/40 space-y-1 mt-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Captured Groups:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {m.groups.map((grp, gi) => (
                        <div
                          key={gi}
                          className="flex items-center gap-2 font-mono text-[11px] bg-[#1a1b21] px-2 py-1 rounded border border-white/5"
                        >
                          <span className="text-cyan-400 font-semibold">
                            {grp.name ? grp.name : `Group $${grp.index}`}:
                          </span>
                          <span className="text-slate-200 font-semibold truncate">
                            "{grp.content}"
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-500 italic pl-1">No capture groups</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
