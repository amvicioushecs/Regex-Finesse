import React, { useState } from 'react';
import { AlertTriangle, Copy, Check, ExternalLink, Terminal } from 'lucide-react';

interface ApiKeyBannerProps {
  onRetryConfigCheck?: () => void;
}

export const ApiKeyBanner: React.FC<ApiKeyBannerProps> = ({ onRetryConfigCheck }) => {
  const [copied, setCopied] = useState(false);
  const exportCmd = 'export XAI_API_KEY="xai-..."';

  const handleCopy = () => {
    navigator.clipboard.writeText(exportCmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-5 backdrop-blur-sm text-zinc-200 shadow-xl shadow-amber-950/20">
      <div className="flex items-start gap-4">
        <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 shrink-0 border border-amber-500/20">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div className="space-y-3 flex-1">
          <div>
            <h3 className="text-base font-semibold text-amber-200 flex items-center gap-2">
              XAI_API_KEY Missing
            </h3>
            <p className="text-sm text-zinc-300 mt-1">
              To generate regex patterns using grok-4.5, Regex Finesse requires an xAI API key set in your server environment.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-zinc-400 font-medium">Quick Setup Instructions:</p>
            <ol className="text-xs text-zinc-300 space-y-1.5 list-decimal list-inside">
              <li>
                Generate an API key at{' '}
                <a
                  href="https://console.x.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:underline inline-flex items-center gap-1 font-mono"
                >
                  https://console.x.ai <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>Export the variable in your terminal before starting the server:</li>
            </ol>
          </div>

          <div className="flex items-center gap-2 bg-zinc-950/80 border border-zinc-800 rounded-lg p-2.5 font-mono text-xs text-zinc-200">
            <Terminal className="h-4 w-4 text-cyan-400 shrink-0" />
            <code className="flex-1 text-cyan-300">{exportCmd}</code>
            <button
              onClick={handleCopy}
              className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center gap-1 transition-colors text-xs"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {onRetryConfigCheck && (
            <div className="pt-1">
              <button
                onClick={onRetryConfigCheck}
                className="text-xs font-medium px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/30 transition-colors"
              >
                Re-check API Key
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
