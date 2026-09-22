import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { ApiKeyBanner } from './components/ApiKeyBanner';
import { PresetPicker } from './components/PresetPicker';
import { RegexBuilderForm } from './components/RegexBuilderForm';
import { GeneratedPatternCard } from './components/GeneratedPatternCard';
import { PatternExplanation } from './components/PatternExplanation';
import { LiveTester } from './components/LiveTester';
import { RawOutputErrorPanel } from './components/RawOutputErrorPanel';
import { DocExportCard } from './components/DocExportCard';
import { DocTemplateDatabase } from './components/DocTemplateDatabase';
import { DocTemplateModal } from './components/DocTemplateModal';
import { SaveTemplateModal } from './components/SaveTemplateModal';
import { PRESET_SAMPLES, flagsToString, stringToFlags } from './data/presets';
import { CURATED_DOC_TEMPLATES } from './data/templateDatabase';
import { RegexFlags, GrokRegexResult, PresetSample, DocTemplate } from './types';
import { AlertCircle, Terminal, BookOpen, Layers } from 'lucide-react';

const STORAGE_KEY = 'regex_finesse_custom_templates';

export default function App() {
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);
  const [hasGeminiKey, setHasGeminiKey] = useState<boolean>(false);
  const [hasXaiKey, setHasXaiKey] = useState<boolean>(false);
  const [engine, setEngine] = useState<'gemini' | 'grok'>('gemini');

  // View state: 'studio' | 'database'
  const [activeView, setActiveView] = useState<'studio' | 'database'>('studio');

  // Studio builder states
  const [description, setDescription] = useState<string>('');
  const [flags, setFlags] = useState<RegexFlags>({
    g: true,
    i: true,
    m: false,
    s: false,
    u: false,
  });
  const [sampleText, setSampleText] = useState<string>('');
  const [activePresetId, setActivePresetId] = useState<string | undefined>(undefined);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<GrokRegexResult | null>(null);
  const [editablePattern, setEditablePattern] = useState<string>('');
  const [apiError, setApiError] = useState<string | null>(null);

  // Template Database states
  const [customTemplates, setCustomTemplates] = useState<DocTemplate[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modal dialog states
  const [inspectModalTemplate, setInspectModalTemplate] = useState<DocTemplate | null>(null);
  const [isInspectModalOpen, setIsInspectModalOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  // Check backend configuration status on load
  const checkConfig = async () => {
    try {
      const res = await fetch('/api/config');
      if (res.ok) {
        const data = await res.json();
        setHasApiKey(data.hasKey);
        setHasGeminiKey(Boolean(data.hasGeminiKey));
        setHasXaiKey(Boolean(data.hasXaiKey));
        if (data.defaultEngine === 'gemini') {
          setEngine('gemini');
        } else if (data.defaultEngine === 'grok') {
          setEngine('grok');
        }
      } else {
        setHasApiKey(false);
      }
    } catch {
      setHasApiKey(false);
    }
  };

  useEffect(() => {
    checkConfig();

    // Auto-select first preset for instant demo readiness
    const defaultPreset = PRESET_SAMPLES[0];
    if (defaultPreset) {
      loadPreset(defaultPreset);
    }
  }, []);

  // Sync custom templates to localStorage
  const saveCustomTemplate = (template: DocTemplate) => {
    setCustomTemplates((prev) => {
      const updated = [template, ...prev];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save to localStorage:', e);
      }
      return updated;
    });
  };

  const deleteCustomTemplate = (id: string) => {
    setCustomTemplates((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to update localStorage:', e);
      }
      return updated;
    });
  };

  const importCustomTemplates = (incoming: DocTemplate[]) => {
    setCustomTemplates((prev) => {
      // Merge unique by ID
      const existingIds = new Set(prev.map((p) => p.id));
      const fresh = incoming.filter((item) => item && item.id && !existingIds.has(item.id));
      const updated = [...fresh, ...prev];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to import to localStorage:', e);
      }
      return updated;
    });
  };

  const loadPreset = (preset: PresetSample) => {
    setActivePresetId(preset.id);
    setDescription(preset.prompt);
    setSampleText(preset.sampleText);
    setFlags(preset.flags);
    setResult(null);
    setEditablePattern('');
    setApiError(null);
  };

  const handleLoadTemplateInTester = (template: DocTemplate) => {
    setActivePresetId(undefined);
    setDescription(template.title);
    setEditablePattern(template.pattern);
    setFlags(stringToFlags(template.flags || 'g'));
    setSampleText(template.sampleTestText || '');
    setResult({
      pattern: template.pattern,
      flags: template.flags || 'g',
      explanation: template.description,
      components: template.components || [],
      examples: template.examples || { matches: [], non_matches: [] },
    });
    setApiError(null);
    setActiveView('studio');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Convert current flags object to flags string
  const flagsString = useMemo(() => flagsToString(flags), [flags]);

  // Validate editable pattern syntax in real-time
  const regexSyntaxError = useMemo(() => {
    if (!editablePattern) return null;
    try {
      new RegExp(editablePattern, flagsString);
      return null;
    } catch (e: any) {
      return e.message || 'Invalid Regular Expression syntax';
    }
  }, [editablePattern, flagsString]);

  // Submit description to server route
  const handleBuildRegex = async () => {
    if (!description.trim()) return;

    setIsLoading(true);
    setApiError(null);
    setResult(null);

    try {
      const response = await fetch('/api/generate-regex', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: description.trim(),
          flags: flagsString,
          engine,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === 'XAI_API_KEY_MISSING' || data.error === 'GEMINI_API_KEY_MISSING') {
          setHasApiKey(false);
        }
        setApiError(data.message || `API error HTTP ${response.status}`);
        setIsLoading(false);
        return;
      }

      setResult(data);
      if (data.pattern) {
        setEditablePattern(data.pattern);
      }
      if (data.flags) {
        setFlags(stringToFlags(data.flags));
      }
    } catch (err: any) {
      setApiError(err.message || 'Failed to connect to backend server.');
    } finally {
      setIsLoading(false);
    }
  };

  const totalTemplateCount = CURATED_DOC_TEMPLATES.length + customTemplates.length;

  return (
    <div className="min-h-screen bg-[#0d0e12] text-slate-100 flex flex-col font-sans antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
      <Header
        hasApiKey={hasApiKey}
        hasGeminiKey={hasGeminiKey}
        hasXaiKey={hasXaiKey}
        activeView={activeView}
        onViewChange={setActiveView}
        templateCount={totalTemplateCount}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* API Key Missing Alert Banner (only if neither key is configured) */}
        {hasApiKey === false && !hasGeminiKey && !hasXaiKey && (
          <ApiKeyBanner onRetryConfigCheck={checkConfig} />
        )}

        {/* View Switcher: REGEX STUDIO */}
        {activeView === 'studio' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Preset Selector Header */}
            <PresetPicker
              onSelectPreset={loadPreset}
              activePresetId={activePresetId}
            />

            {/* Main Builder Form Card */}
            <div className="rounded-2xl border border-white/10 bg-[#13141a] p-6 backdrop-blur-sm shadow-2xl space-y-6">
              <RegexBuilderForm
                description={description}
                onDescriptionChange={(val) => {
                  setDescription(val);
                  setActivePresetId(undefined);
                }}
                flags={flags}
                onFlagsChange={setFlags}
                onSubmit={handleBuildRegex}
                isLoading={isLoading}
                engine={engine}
                onEngineChange={setEngine}
                hasGeminiKey={hasGeminiKey}
                hasXaiKey={hasXaiKey}
              />
            </div>

            {/* Server or API Error Display */}
            {apiError && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-5 space-y-2 text-rose-200">
                <div className="flex items-center gap-2 font-semibold text-rose-300 text-sm">
                  <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
                  <span>Regex Generation Error</span>
                </div>
                <p className="text-xs text-rose-200 leading-relaxed font-sans">{apiError}</p>
              </div>
            )}

            {/* Generated Pattern Output Section */}
            {result && !result.parseError && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <GeneratedPatternCard
                  pattern={editablePattern}
                  flags={flagsString}
                  onPatternChange={setEditablePattern}
                  regexError={regexSyntaxError}
                />

                <PatternExplanation
                  explanation={result.explanation}
                  components={result.components}
                  examples={result.examples}
                  onUseExampleText={(text) => {
                    setSampleText((prev) => (prev ? `${prev}\n${text}` : text));
                  }}
                />

                {/* Documentation & Template Exporter Card */}
                <DocExportCard
                  result={result}
                  activePattern={editablePattern}
                  activeFlags={flagsString}
                  sampleText={sampleText}
                  descriptionPrompt={description}
                  onOpenSaveModal={() => setIsSaveModalOpen(true)}
                  onOpenInspectModal={(temp) => {
                    setInspectModalTemplate(temp);
                    setIsInspectModalOpen(true);
                  }}
                  onSwitchToDatabase={() => setActiveView('database')}
                />
              </div>
            )}

            {/* Non-Crashing Raw Output Fallback Panel on Parse Error */}
            {result && result.parseError && result.rawOutput && (
              <RawOutputErrorPanel rawOutput={result.rawOutput} />
            )}

            {/* Live Interactive Tester */}
            <div className="rounded-2xl border border-white/10 bg-[#13141a] p-6 backdrop-blur-sm shadow-2xl space-y-6">
              <LiveTester
                pattern={editablePattern}
                flags={flagsString}
                sampleText={sampleText}
                onSampleTextChange={setSampleText}
                regexError={regexSyntaxError}
              />
            </div>
          </div>
        )}

        {/* View Switcher: DOCUMENTATION TEMPLATE DATABASE */}
        {activeView === 'database' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <DocTemplateDatabase
              customTemplates={customTemplates}
              onDeleteCustomTemplate={deleteCustomTemplate}
              onImportTemplates={importCustomTemplates}
              onLoadInTester={handleLoadTemplateInTester}
              onOpenInspectModal={(tpl) => {
                setInspectModalTemplate(tpl);
                setIsInspectModalOpen(true);
              }}
              onOpenCreateModal={() => setIsSaveModalOpen(true)}
            />
          </div>
        )}
      </main>

      {/* Global Modals */}
      <DocTemplateModal
        template={inspectModalTemplate}
        isOpen={isInspectModalOpen}
        onClose={() => {
          setIsInspectModalOpen(false);
          setInspectModalTemplate(null);
        }}
        onLoadInTester={handleLoadTemplateInTester}
      />

      <SaveTemplateModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSave={saveCustomTemplate}
        currentResult={result}
        activePattern={editablePattern}
        activeFlags={flagsString}
        sampleText={sampleText}
        descriptionPrompt={description}
      />

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#090a0d] py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-mono">
            <Terminal className="h-3.5 w-3.5 text-cyan-400" />
            <span>Regex Finesse &bull; Gemini 3.8 Flash &amp; grok-4.5</span>
          </div>
          <div className="text-slate-400 font-mono text-[11px] flex items-center gap-3">
            <span>Documentation Template Database ({totalTemplateCount} standards)</span>
            <span>&bull;</span>
            <span>Client-side Live JS RegExp Engine</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
