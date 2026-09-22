import React, { useState } from 'react';
import { X, BookmarkPlus, Check, Sparkles } from 'lucide-react';
import { DocTemplate, DocCategory, GrokRegexResult } from '../types';

interface SaveTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: DocTemplate) => void;
  currentResult: GrokRegexResult | null;
  activePattern: string;
  activeFlags: string;
  sampleText: string;
  descriptionPrompt: string;
}

export const SaveTemplateModal: React.FC<SaveTemplateModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentResult,
  activePattern,
  activeFlags,
  sampleText,
  descriptionPrompt,
}) => {
  const [title, setTitle] = useState(descriptionPrompt || 'Custom Regex Pattern');
  const [category, setCategory] = useState<Exclude<DocCategory, 'All'>>('Custom');
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [description, setDescription] = useState(
    currentResult?.explanation || 'Validates and matches target custom string patterns.'
  );
  const [tagsInput, setTagsInput] = useState('custom, validation');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !activePattern.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const newTemplate: DocTemplate = {
      id: `custom-${Date.now()}`,
      title: title.trim(),
      category,
      difficulty,
      description: description.trim(),
      pattern: activePattern.trim(),
      flags: activeFlags,
      tags: tags.length > 0 ? tags : ['custom'],
      author: 'user',
      createdAt: new Date().toISOString(),
      notes: notes.trim(),
      components: currentResult?.components || [
        { token: activePattern, meaning: 'Full custom regular expression pattern' },
      ],
      examples: currentResult?.examples || {
        matches: [],
        non_matches: [],
      },
      sampleTestText: sampleText || '',
    };

    onSave(newTemplate);
    onClose();
  };

  return (
    <div
      id="save-template-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="save-template-modal-container"
        className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-[#0d0e12] text-zinc-100 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <BookmarkPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Save as Documentation Template</h2>
              <p className="text-xs text-zinc-400">Add to your persistent regex documentation library</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 font-mono text-xs">
            <span className="text-zinc-500">Pattern: </span>
            <span className="text-cyan-300">
              /{activePattern}/{activeFlags}
            </span>
          </div>

          <div>
            <label className="block text-zinc-300 font-medium mb-1">Template Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
              placeholder="e.g., Stripe Webhook Signature"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-300 font-medium mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-100 focus:outline-none focus:border-cyan-500"
              >
                <option value="Web & URLs">Web & URLs</option>
                <option value="Auth & Security">Auth & Security</option>
                <option value="Data Formats">Data Formats</option>
                <option value="Networking">Networking</option>
                <option value="Dates & Times">Dates & Times</option>
                <option value="Text Extraction">Text Extraction</option>
                <option value="Custom">Custom</option>
              </select>
            </div>

            <div>
              <label className="block text-zinc-300 font-medium mb-1">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-100 focus:outline-none focus:border-cyan-500"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-zinc-300 font-medium mb-1">Description / Specification</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500 resize-none"
              placeholder="What this pattern matches and verifies..."
            />
          </div>

          <div>
            <label className="block text-zinc-300 font-medium mb-1">Tags (comma-separated)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
              placeholder="e.g., auth, headers, rfc"
            />
          </div>

          <div>
            <label className="block text-zinc-300 font-medium mb-1">Engineering Notes / Warnings (Optional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
              placeholder="e.g., Catastrophic backtracking warning or browser edge cases"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-semibold transition-colors shadow-sm"
            >
              <Check className="h-4 w-4" />
              <span>Save to Database</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
