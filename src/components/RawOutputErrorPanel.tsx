import React, { useState } from 'react';
import { AlertCircle, Copy, Check, Terminal } from 'lucide-react';

interface RawOutputErrorPanelProps {
  rawOutput: string;
}

export const RawOutputErrorPanel: React.FC<RawOutputErrorPanelProps> = ({ rawOutput }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(rawOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-5 space-y-3 backdrop-blur-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 text-rose-300">
          <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
          <h4 className="text-sm font-semibold">JSON Structure Parse Error</h4>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-medium transition-colors"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5 text-zinc-400" />
              <span>Copy Raw Output</span>
            </>
          )}
        </button>
      </div>

      <p className="text-xs text-zinc-300">
        The model returned a response, but it could not be automatically formatted into structured JSON. Below is the unformatted raw response string:
      </p>

      <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 font-mono text-xs text-zinc-300 max-h-60 overflow-y-auto whitespace-pre-wrap break-words custom-scrollbar">
        {rawOutput}
      </div>
    </div>
  );
};
