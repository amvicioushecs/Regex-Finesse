import React, { useState, useMemo } from 'react';
import {
  Search,
  FileCode,
  Globe,
  Shield,
  Cpu,
  Calendar,
  ScanText,
  BookmarkCheck,
  Layers,
  Copy,
  Check,
  Play,
  Eye,
  Trash2,
  Download,
  Upload,
  Plus,
  BookOpen,
  Filter,
} from 'lucide-react';
import { DocTemplate, DocCategory, DocFormat } from '../types';
import { CURATED_DOC_TEMPLATES, CATEGORY_LIST } from '../data/templateDatabase';
import { generateDocContent } from '../utils/docGenerator';

interface DocTemplateDatabaseProps {
  customTemplates: DocTemplate[];
  onDeleteCustomTemplate: (id: string) => void;
  onImportTemplates: (templates: DocTemplate[]) => void;
  onLoadInTester: (template: DocTemplate) => void;
  onOpenInspectModal: (template: DocTemplate) => void;
  onOpenCreateModal: () => void;
}

export const DocTemplateDatabase: React.FC<DocTemplateDatabaseProps> = ({
  customTemplates,
  onDeleteCustomTemplate,
  onImportTemplates,
  onLoadInTester,
  onOpenInspectModal,
  onOpenCreateModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<DocCategory>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'All' | 'Beginner' | 'Intermediate' | 'Advanced'>('All');
  const [activeFormat, setActiveFormat] = useState<DocFormat>('markdown');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Combine curated and custom templates
  const allTemplates = useMemo(() => {
    return [...customTemplates, ...CURATED_DOC_TEMPLATES];
  }, [customTemplates]);

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: allTemplates.length };
    for (const t of allTemplates) {
      counts[t.category] = (counts[t.category] || 0) + 1;
    }
    counts['Custom'] = customTemplates.length;
    return counts;
  }, [allTemplates, customTemplates]);

  // Filtered templates
  const filteredTemplates = useMemo(() => {
    return allTemplates.filter((t) => {
      // Category filter
      if (selectedCategory === 'Custom') {
        if (t.author !== 'user') return false;
      } else if (selectedCategory !== 'All' && t.category !== selectedCategory) {
        return false;
      }

      // Difficulty filter
      if (selectedDifficulty !== 'All' && t.difficulty !== selectedDifficulty) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = t.title.toLowerCase().includes(q);
        const matchesDesc = t.description.toLowerCase().includes(q);
        const matchesPattern = t.pattern.toLowerCase().includes(q);
        const matchesTags = t.tags?.some((tag) => tag.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesPattern && !matchesTags) {
          return false;
        }
      }

      return true;
    });
  }, [allTemplates, selectedCategory, selectedDifficulty, searchQuery]);

  const handleCopyCode = (template: DocTemplate) => {
    const content = generateDocContent(template, activeFormat);
    navigator.clipboard.writeText(content);
    setCopiedId(template.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportJson = () => {
    const dataStr = JSON.stringify(customTemplates, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `regex-finesse-custom-templates-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          onImportTemplates(imported);
        }
      } catch (err) {
        console.error('Failed to import templates JSON:', err);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Web & URLs':
        return <Globe className="h-4 w-4" />;
      case 'Auth & Security':
        return <Shield className="h-4 w-4" />;
      case 'Data Formats':
        return <FileCode className="h-4 w-4" />;
      case 'Networking':
        return <Cpu className="h-4 w-4" />;
      case 'Dates & Times':
        return <Calendar className="h-4 w-4" />;
      case 'Text Extraction':
        return <ScanText className="h-4 w-4" />;
      case 'Custom':
        return <BookmarkCheck className="h-4 w-4" />;
      default:
        return <Layers className="h-4 w-4" />;
    }
  };

  return (
    <div id="doc-template-database" className="space-y-6">
      {/* Database Controls Header */}
      <div className="rounded-2xl border border-zinc-800 bg-[#13141a]/90 backdrop-blur-md p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <BookOpen className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  Documentation Template Database
                  <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-700/50 text-cyan-300 font-mono">
                    {allTemplates.length} specs
                  </span>
                </h2>
                <p className="text-xs text-zinc-400">
                  Standardized, production-grade regex specifications exportable to Markdown, TypeScript/JSDoc, Python, and OpenAPI schemas.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions (Add, Export, Import) */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenCreateModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-semibold text-xs transition-colors shadow-sm"
              title="Add current or custom regex as template"
            >
              <Plus className="h-4 w-4" />
              <span>Save Pattern to DB</span>
            </button>

            {customTemplates.length > 0 && (
              <button
                onClick={handleExportJson}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors"
                title="Backup your custom templates to JSON"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export ({customTemplates.length})</span>
              </button>
            )}

            <label className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors cursor-pointer">
              <Upload className="h-3.5 w-3.5" />
              <span>Import</span>
              <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
            </label>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="mt-5 pt-4 border-t border-zinc-800/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keyword, token, regex, or tag..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Format & Difficulty controls */}
          <div className="flex items-center flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-1 bg-zinc-950/80 border border-zinc-800 rounded-lg p-1">
              <span className="text-zinc-500 px-1.5 font-medium">Export Format:</span>
              {(['markdown', 'jsdoc', 'python', 'openapi'] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setActiveFormat(fmt)}
                  className={`px-2 py-1 rounded text-xs transition-colors ${
                    activeFormat === fmt
                      ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {fmt === 'markdown'
                    ? 'Markdown'
                    : fmt === 'jsdoc'
                    ? 'JSDoc'
                    : fmt === 'python'
                    ? 'Python'
                    : 'OpenAPI'}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 bg-zinc-950/80 border border-zinc-800 rounded-lg p-1">
              <Filter className="h-3 w-3 text-zinc-500 ml-1.5" />
              {(['All', 'Beginner', 'Intermediate', 'Advanced'] as const).map((diff) => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`px-2 py-1 rounded text-xs transition-colors ${
                    selectedDifficulty === diff
                      ? 'bg-zinc-800 text-zinc-100 font-semibold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORY_LIST.map((cat) => {
            const count = categoryCounts[cat.id] || 0;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as DocCategory)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-cyan-500 text-zinc-950 font-bold shadow-md shadow-cyan-950/20'
                    : 'bg-zinc-900/80 hover:bg-zinc-800/80 text-zinc-300 border border-zinc-800'
                }`}
              >
                {getCategoryIcon(cat.id)}
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected ? 'bg-zinc-950/30 text-zinc-950' : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-[#13141a]/60 p-12 text-center space-y-3">
          <BookOpen className="h-10 w-10 text-zinc-600 mx-auto" />
          <h3 className="text-base font-semibold text-zinc-200">No matching templates found</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Try adjusting your search keywords or switching category filters. You can also save custom regex patterns to this database.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setSelectedDifficulty('All');
            }}
            className="px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => {
            const isCopied = copiedId === template.id;
            return (
              <div
                key={template.id}
                className="flex flex-col rounded-2xl border border-zinc-800/80 bg-[#13141a]/80 hover:border-cyan-500/40 hover:bg-[#13141a] transition-all duration-200 overflow-hidden shadow-lg group"
              >
                {/* Card Header */}
                <div className="p-4 pb-3 space-y-2 border-b border-zinc-800/60">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400">
                      {getCategoryIcon(template.category)}
                      <span>{template.category}</span>
                    </span>

                    <div className="flex items-center gap-1.5">
                      {template.author === 'user' && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-amber-950/50 text-amber-300 border border-amber-800/40">
                          Custom
                        </span>
                      )}
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${
                          template.difficulty === 'Beginner'
                            ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40'
                            : template.difficulty === 'Intermediate'
                            ? 'bg-cyan-950/40 text-cyan-300 border-cyan-800/40'
                            : 'bg-purple-950/40 text-purple-300 border-purple-800/40'
                        }`}
                      >
                        {template.difficulty}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-cyan-200 transition-colors line-clamp-1">
                    {template.title}
                  </h3>
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {template.description}
                  </p>
                </div>

                {/* Pattern Monospace Preview */}
                <div className="px-4 py-2.5 bg-zinc-950/70 border-b border-zinc-800/60 font-mono text-xs overflow-hidden flex items-center justify-between gap-2">
                  <code className="text-cyan-300 truncate selection:bg-cyan-500/30">
                    /{template.pattern}/{template.flags || ''}
                  </code>
                  <span className="text-[10px] text-zinc-500 shrink-0 font-sans">
                    {template.components?.length || 0} tokens
                  </span>
                </div>

                {/* Tags */}
                <div className="px-4 py-2 flex-1 flex flex-wrap gap-1.5 items-center content-start">
                  {template.tags?.slice(0, 4).map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-900 text-zinc-400 border border-zinc-800"
                    >
                      #{tag}
                    </span>
                  ))}
                  {(template.tags?.length || 0) > 4 && (
                    <span className="text-[10px] text-zinc-500">
                      +{template.tags.length - 4}
                    </span>
                  )}
                </div>

                {/* Card Actions */}
                <div className="p-3 border-t border-zinc-800/60 bg-zinc-900/30 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onLoadInTester(template)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition-colors"
                      title="Load into Live Tester Studio"
                    >
                      <Play className="h-3 w-3 fill-current" />
                      <span>Test</span>
                    </button>

                    <button
                      onClick={() => handleCopyCode(template)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors"
                      title={`Copy ${activeFormat.toUpperCase()} spec`}
                    >
                      {isCopied ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenInspectModal(template)}
                      className="p-1.5 rounded-lg bg-zinc-800/70 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                      title="Inspect Full Documentation Spec"
                    >
                      <Eye className="h-4 w-4" />
                    </button>

                    {template.author === 'user' && (
                      <button
                        onClick={() => onDeleteCustomTemplate(template.id)}
                        className="p-1.5 rounded-lg bg-zinc-800/70 hover:bg-rose-950/60 text-zinc-400 hover:text-rose-400 transition-colors"
                        title="Delete custom template"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
