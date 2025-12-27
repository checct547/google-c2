
import React from 'react';
import { InputComponentState } from '../types';

interface InputGroupProps {
  label: string;
  state: InputComponentState;
  options: string[];
  onChange: (value: Partial<InputComponentState>) => void;
  autoLabel?: string;
  placeholder?: string;
  optionsPlaceholder?: string;
}

const InputGroup: React.FC<InputGroupProps> = ({
  label,
  state,
  options,
  onChange,
  autoLabel = "Auto",
  placeholder = "Custom...",
  optionsPlaceholder = "Select..."
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">{label}</label>
        <label className="flex items-center gap-2 text-[9px] font-black text-slate-500 uppercase tracking-widest cursor-pointer hover:text-indigo-400 transition-colors">
          <input
            type="checkbox"
            checked={state.auto}
            onChange={(e) => onChange({ auto: e.target.checked })}
            className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-0"
          />
          {autoLabel}
        </label>
      </div>
      
      <div className="space-y-3">
        <input
          type="text"
          value={state.custom}
          onChange={(e) => onChange({ custom: e.target.value })}
          placeholder={placeholder}
          className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3 text-sm focus:border-indigo-500 transition-all outline-none shadow-inner"
        />
        <select
          value={state.selected}
          onChange={(e) => onChange({ selected: e.target.value })}
          className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3 text-sm focus:border-indigo-500 transition-all outline-none appearance-none font-medium shadow-inner cursor-pointer"
        >
          <option value="">{optionsPlaceholder}</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default InputGroup;
