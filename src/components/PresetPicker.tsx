import React from 'react';
import { PRESET_SAMPLES } from '../data/presets';
import { PresetSample } from '../types';
import { Phone, Mail, Calendar, Wand2 } from 'lucide-react';

interface PresetPickerProps {
  onSelectPreset: (preset: PresetSample) => void;
  activePresetId?: string;
}

const PRESET_ICONS: Record<string, React.ReactNode> = {
  'us-phone': <Phone className="h-4 w-4 text-cyan-400" />,
  'email-extract': <Mail className="h-4 w-4 text-indigo-400" />,
  'iso-date': <Calendar className="h-4 w-4 text-violet-400" />,
};

export const PresetPicker: React.FC<PresetPickerProps> = ({
  onSelectPreset,
  activePresetId,
}) => {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-1.5">
          <Wand2 className="h-3.5 w-3.5 text-cyan-400" />
          <span>Preset Sample Request Tray</span>
        </label>
        <span className="text-[11px] text-slate-400 font-mono">Auto-populates prompt & test suite</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {PRESET_SAMPLES.map((preset) => {
          const isSelected = activePresetId === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelectPreset(preset)}
              className={`p-3.5 rounded-xl border text-left transition-all duration-200 group relative overflow-hidden cursor-pointer ${
                isSelected
                  ? 'bg-[#1a1b21] border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/30'
                  : 'bg-[#13141a] border-white/10 hover:border-cyan-500/40 hover:bg-[#1a1b21]'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-[#090a0d] border border-white/10 group-hover:border-cyan-500/30 shrink-0">
                  {PRESET_ICONS[preset.id] || <Wand2 className="h-4 w-4 text-cyan-400" />}
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-slate-200 group-hover:text-white truncate">
                      {preset.title}
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {preset.prompt}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
