import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Download,
  Play,
  FileText,
  Code,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Cpu,
  Layers,
  Sparkles,
} from 'lucide-react';
import { DocTemplate, DocFormat, GeminiDocResult } from '../types';
import { generateDocContent } from '../utils/docGenerator';

interface DocTemplateModalProps {
  template: DocTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onLoadInTester: (template: DocTemplate) => void;
}

export const DocTemplateModal: React.FC<DocTemplateModalProps> = ({
  template,
  isOpen,
  onClose,
  onLoadInTester,
}) => {
  const [activeFormat, setActiveFormat] = useState<DocFormat>('markdown');
  const [copied, setCopied] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiSpec, setAiSpec] = useState<GeminiDocResult | null>(null);

  if (!isOpen || !template) return null;

  const currentDocCode = aiSpec
    ? (activeFormat === 'markdown'
        ? aiSpec.markdown
        : activeFormat === 'jsdoc'
        ? aiSpec.jsdoc
        : activeFormat === 'python'
        ? aiSpec.python
        : activeFormat === 'openapi'
        ? aiSpec.openApi
        : generateDocContent(template, activeFormat))
    : generateDocContent(template, activeFormat);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentDocCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const extMap: Record<DocFormat, string> = {
      markdown: 'md',
      jsdoc: 'ts',
      python: 'py',
      go: 'go',
      openapi: 'json',
    };
    const blob = new Blob([currentDocCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.id || 'regex-spec'}.${extMap[activeFormat] || 'txt'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleGenerateGeminiDoc = async () => {
    setIsAiGenerating(true);
    try {
      const res = await fetch('/api/gemini/generate-doc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pattern: template.pattern,
          flags: template.flags,
          description: template.description,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiSpec(data);
      }
    } catch (err) {
      console.error('Failed to generate Gemini doc spec:', err);
    } finally {
      setIsAiGenerating(false);
    }
  };

  return (
    <div
      id="doc-template-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="doc-template-modal-container"
        className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border border-zinc-800 bg-[#0d0e12] text-zinc-100 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">{template.title}</h2>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
                  {template.category}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
                    template.difficulty === 'Beginner'
                      ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40'
                      : template.difficulty === 'Intermediate'
                      ? 'bg-cyan-950/40 text-cyan-300 border-cyan-800/40'
                      : 'bg-amber-950/40 text-amber-300 border-amber-800/40'
                  }`}
                >
                  {template.difficulty}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">{template.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onLoadInTester(template);
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-semibold text-xs transition-colors shadow-sm"
              title="Load into Live Tester & Studio"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>Test Live</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Pattern Banner */}
        <div className="px-6 py-3 bg-zinc-950/70 border-b border-zinc-800 flex items-center justify-between gap-4 font-mono text-sm overflow-x-auto">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-zinc-500 font-semibold">RegExp:</span>
            <code className="text-cyan-300 truncate selection:bg-cyan-500/30">
              /{template.pattern}/{template.flags || ''}
            </code>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(`/${template.pattern}/${template.flags || ''}`);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="shrink-0 text-xs px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors flex items-center gap-1"
          >
            {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
            <span>Copy Pattern</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Format Selector Bar */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-medium">
              {(
                [
                  { id: 'markdown', label: 'Markdown Spec' },
                  { id: 'jsdoc', label: 'TypeScript / JSDoc' },
                  { id: 'python', label: 'Python (re)' },
                  { id: 'openapi', label: 'OpenAPI Schema' },
                  { id: 'go', label: 'Go regexp' },
                ] as const
              ).map((fmt) => (
                <button
                  key={fmt.id}
                  onClick={() => setActiveFormat(fmt.id)}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    activeFormat === fmt.id
                      ? 'bg-cyan-500 text-zinc-950 font-bold shadow-sm'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  {fmt.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleGenerateGeminiDoc}
                disabled={isAiGenerating}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-cyan-500/30 bg-cyan-950/30 hover:bg-cyan-900/40 text-cyan-300 text-xs font-medium transition-colors"
                title="Use Gemini to generate in-depth edge cases and ReDoS safety analysis"
              >
                <Sparkles className={`h-3.5 w-3.5 ${isAiGenerating ? 'animate-spin' : ''}`} />
                <span>{isAiGenerating ? 'Analyzing with Gemini...' : '✨ Enhance Spec (Gemini AI)'}</span>
              </button>

              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>

              <button
                onClick={handleDownload}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors"
                title="Download documentation file"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* AI Analysis Badges if loaded */}
          {aiSpec && (
            <div className="p-3.5 rounded-xl border border-cyan-500/30 bg-cyan-950/20 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-cyan-200 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-cyan-400" /> Gemini Engine Analysis
                </span>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-700">
                    Complexity: <strong className="text-white">{aiSpec.complexityScore}</strong>
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded border ${
                      aiSpec.reDosSafe
                        ? 'bg-emerald-950/50 text-emerald-300 border-emerald-800/50'
                        : 'bg-amber-950/50 text-amber-300 border-amber-800/50'
                    }`}
                  >
                    {aiSpec.reDosSafe ? '🛡️ Safe from ReDoS' : '⚠️ ReDoS Caution'}
                  </span>
                </div>
              </div>
              {aiSpec.notes && <p className="text-zinc-300">{aiSpec.notes}</p>}
            </div>
          )}

          {/* Generated Code Window */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/90 overflow-hidden shadow-inner">
            <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/80 border-b border-zinc-800/80 text-xs text-zinc-400 font-mono">
              <span>documentation.{activeFormat === 'markdown' ? 'md' : activeFormat === 'jsdoc' ? 'ts' : activeFormat === 'python' ? 'py' : activeFormat === 'openapi' ? 'json' : 'go'}</span>
              <span>UTF-8</span>
            </div>
            <pre className="p-4 text-xs font-mono text-zinc-200 overflow-x-auto whitespace-pre leading-relaxed select-text">
              <code>{currentDocCode}</code>
            </pre>
          </div>

          {/* Token Breakdown Table */}
          {template.components && template.components.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-cyan-400" />
                Token Component Breakdown ({template.components.length})
              </h3>
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-zinc-900/60 text-zinc-400">
                      <th className="py-2.5 px-4 font-medium w-1/3">RegEx Token</th>
                      <th className="py-2.5 px-4 font-medium">Semantics & Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {template.components.map((comp, idx) => (
                      <tr key={idx} className="hover:bg-zinc-900/30 transition-colors">
                        <td className="py-2 px-4 font-mono text-cyan-300 select-text">
                          <code className="bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
                            {comp.token}
                          </code>
                        </td>
                        <td className="py-2 px-4 text-zinc-300">{comp.meaning}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Test Vectors Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Matches */}
            <div className="p-4 rounded-xl border border-emerald-900/30 bg-emerald-950/10 space-y-2">
              <h4 className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                Valid Test Vectors ({template.examples?.matches?.length || 0})
              </h4>
              <ul className="space-y-1.5 text-xs font-mono text-emerald-200">
                {template.examples?.matches?.map((m, i) => (
                  <li key={i} className="p-1.5 rounded bg-zinc-950/60 border border-emerald-900/30 break-all select-text">
                    {m}
                  </li>
                ))}
              </ul>
            </div>

            {/* Non-matches */}
            <div className="p-4 rounded-xl border border-rose-900/30 bg-rose-950/10 space-y-2">
              <h4 className="text-xs font-semibold text-rose-400 flex items-center gap-1.5">
                <XCircle className="h-4 w-4" />
                Invalid Test Vectors ({template.examples?.non_matches?.length || 0})
              </h4>
              <ul className="space-y-1.5 text-xs font-mono text-rose-200">
                {template.examples?.non_matches?.map((nm, i) => (
                  <li key={i} className="p-1.5 rounded bg-zinc-950/60 border border-rose-900/30 break-all select-text">
                    {nm}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-900/40 flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-3">
            <span>Author: {template.author === 'curated' ? 'Curated Spec' : 'User Saved'}</span>
            <span>Tags: {template.tags?.join(', ') || 'general'}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
