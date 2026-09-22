import React from 'react';
import { RegexFlags } from '../types';

interface FlagSelectorProps {
  flags: RegexFlags;
  onChange: (flags: RegexFlags) => void;
}

interface FlagConfig {
  key: keyof RegexFlags;
  label: string;
  name: string;
  description: string;
}

const FLAG_CONFIGS: FlagConfig[] = [
  { key: 'g', label: 'g', name: 'Global', description: 'Find all matches rather than stopping after the first match' },
  { key: 'i', label: 'i', name: 'Ignore Case', description: 'Case-insensitive matching (A matches a)' },
  { key: 'm', label: 'm', name: 'Multiline', description: '^ and $ match start and end of each line' },
  { key: 's', label: 's', name: 'DotAll', description: '. matches any character including newline \\n' },
  { key: 'u', label: 'u', name: 'Unicode', description: 'Treat pattern as a sequence of Unicode code points' },
];

export const FlagSelector: React.FC<FlagSelectorProps> = ({ flags, onChange }) => {
  const toggleFlag = (key: keyof RegexFlags) => {
    onChange({
      ...flags,
      [key]: !flags[key],
    });
  };

  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 block">
        RegExp Flags
      </label>
      <div className="flex flex-wrap items-center gap-2">
        {FLAG_CONFIGS.map((config) => {
          const isActive = flags[config.key];
          return (
            <button
              key={config.key}
              type="button"
              onClick={() => toggleFlag(config.key)}
              title={`${config.name}: ${config.description}`}
              className={`group relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono text-xs font-semibold transition-all duration-150 select-none cursor-pointer ${
                isActive
                  ? 'bg-cyan-500/20 border-cyan-400/60 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                  : 'bg-[#090a0d] border-white/10 text-slate-400 hover:text-slate-200 hover:border-white/20'
              }`}
            >
              <span
                className={`inline-block w-2 h-2 rounded-full transition-colors ${
                  isActive ? 'bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]' : 'bg-slate-700'
                }`}
              />
              <span>{config.label}</span>
              <span className="text-[10px] font-sans text-slate-400 font-normal hidden sm:inline">
                ({config.name})
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
