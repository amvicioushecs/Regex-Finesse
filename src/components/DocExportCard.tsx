import React, { useState } from 'react';
import {
  FileText,
  Copy,
  Check,
  BookmarkPlus,
  Sparkles,
  ExternalLink,
  Code2,
} from 'lucide-react';
import { GrokRegexResult, DocTemplate, DocFormat } from '../types';
import { generateDocContent } from '../utils/docGenerator';

interface DocExportCardProps {
  result: GrokRegexResult | null;
  activePattern: string;
  activeFlags: string;
  sampleText: string;
  descriptionPrompt: string;
  onOpenSaveModal: () => void;
  onOpenInspectModal: (template: DocTemplate) => void;
  onSwitchToDatabase: () => void;
}

export const DocExportCard: React.FC<DocExportCardProps> = ({
  result,
  activePattern,
  activeFlags,
  sampleText,
  descriptionPrompt,
  onOpenSaveModal,
  onOpenInspectModal,
  onSwitchToDatabase,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<DocFormat>('markdown');
  const [copied, setCopied] = useState(false);

  if (!activePattern) return null;

  // Synthesize a temporary DocTemplate from the current state
  const currentTempTemplate: DocTemplate = {
    id: 'current-active-spec',
    title: descriptionPrompt || 'Custom Regular Expression',
    category: 'Custom',
    difficulty: 'Intermediate',
    description: result?.explanation || 'Active regular expression pattern generated in Regex Finesse.',
    pattern: activePattern,
    flags: activeFlags,
    tags: ['active', 'generated'],
    difficulty: 'Intermediate',
    author: 'user',
    components: result?.components || [
      { token: activePattern, meaning: 'Regular expression pattern match' },
    ],
    examples: result?.examples || {
      matches: [],
      non_matches: [],
    },
    sampleTestText: sampleText,
  };

  const currentSnippet = generateDocContent(currentTempTemplate, selectedFormat);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id="doc-export-card"
      className="rounded-2xl border border-zinc-800 bg-[#13141a]/90 backdrop-blur-md p-5 shadow-xl space-y-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <FileText className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Documentation & Template Generator
            </h3>
            <p className="text-xs text-zinc-400">
              Auto-generate production specs, JSDoc, Python doctests, and OpenAPI schemas
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSaveModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition-colors"
            title="Save to documentation template database"
          >
            <BookmarkPlus className="h-3.5 w-3.5" />
            <span>Save to Database</span>
          </button>

          <button
            onClick={() => onOpenInspectModal(currentTempTemplate)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors"
            title="Inspect full modal spec sheet"
          >
            <Code2 className="h-3.5 w-3.5 text-cyan-400" />
            <span>Full Spec Sheet</span>
          </button>
        </div>
      </div>

      {/* Format tabs and quick snippet */}
      <div className="space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1 bg-zinc-950/80 border border-zinc-800 rounded-lg p-1">
            {(
              [
                { id: 'markdown', label: 'Markdown' },
                { id: 'jsdoc', label: 'JSDoc / TS' },
                { id: 'python', label: 'Python (re)' },
                { id: 'openapi', label: 'OpenAPI' },
              ] as const
            ).map((fmt) => (
              <button
                key={fmt.id}
                onClick={() => setSelectedFormat(fmt.id)}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  selectedFormat === fmt.id
                    ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {fmt.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs transition-colors"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">Copied Spec!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>

        {/* Code snippet display */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/90 max-h-48 overflow-y-auto p-3 text-xs font-mono text-zinc-300 select-text whitespace-pre leading-relaxed">
          {currentSnippet}
        </div>
      </div>

      <div className="flex items-center justify-between pt-1 text-xs text-zinc-400">
        <span>Need a pre-validated regex? Browse 15+ curated standards in the database.</span>
        <button
          onClick={onSwitchToDatabase}
          className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
        >
          <span>Open Template Database</span>
          <ExternalLink className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
};
