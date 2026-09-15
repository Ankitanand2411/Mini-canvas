'use client';

import { useState, type ReactNode } from 'react';
import { clamp, isHexColor } from '@/lib/format';
import { cn } from '@/lib/cn';

const inputClass =
  'h-7 w-full min-w-0 rounded border border-zinc-200 bg-white px-1.5 text-[12px] text-zinc-900 tabular-nums focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/30';

export function Section({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="border-b border-zinc-100 px-3 py-3">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">{title}</h3>
        {action}
      </div>
      <div className="grid grid-cols-2 gap-x-2 gap-y-2">{children}</div>
    </section>
  );
}

interface NumberFieldProps {
  label: string;
  value: number;
  onCommit: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  span?: boolean;
}

export function NumberField({ label, value, onCommit, min = -Infinity, max = Infinity, step = 1, span }: NumberFieldProps) {
  // keep the draft alongside the value it was derived from so an outside change resets the field
  const [draft, setDraft] = useState({ value, text: String(value) });
  const text = draft.value === value ? draft.text : String(value);

  const commit = () => {
    const parsed = parseFloat(text);
    if (Number.isNaN(parsed)) {
      setDraft({ value, text: String(value) });
      return;
    }
    const next = Math.round(clamp(parsed, min, max) * 100) / 100;
    if (next !== value) onCommit(next);
    else setDraft({ value, text: String(value) });
  };

  return (
    <label className={cn('flex items-center gap-1.5', span && 'col-span-2')}>
      <span className="w-4 shrink-0 text-[11px] text-zinc-500">{label}</span>
      <input
        type="number"
        step={step}
        value={text}
        onChange={(e) => setDraft({ value, text: e.target.value })}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
          if (e.key === 'Escape') setDraft({ value, text: String(value) });
        }}
        className={inputClass}
      />
    </label>
  );
}

interface ColorFieldProps {
  label: string;
  value: string;
  onChange: (value: string, options?: { transient?: boolean }) => void;
  onCommit: () => void;
}

export function ColorField({ label, value, onChange, onCommit }: ColorFieldProps) {
  const [draft, setDraft] = useState({ value, text: value });
  const text = draft.value === value ? draft.text : value;

  const commitText = () => {
    if (isHexColor(text) && text.toLowerCase() !== value.toLowerCase()) onChange(text.toLowerCase());
    else setDraft({ value, text: value });
  };

  return (
    <label className="col-span-2 flex items-center gap-1.5">
      <span className="w-4 shrink-0 text-[11px] text-zinc-500">{label}</span>
      <span className="relative h-7 w-7 shrink-0 overflow-hidden rounded border border-zinc-200">
        <input
          type="color"
          value={isHexColor(value) ? value : '#000000'}
          onChange={(e) => onChange(e.target.value, { transient: true })}
          onBlur={onCommit}
          className="absolute -left-1 -top-1 h-10 w-10 cursor-pointer border-0 p-0"
          aria-label={`${label} colour`}
        />
      </span>
      <input
        type="text"
        value={text}
        onChange={(e) => setDraft({ value, text: e.target.value })}
        onBlur={commitText}
        onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
        spellCheck={false}
        className={cn(inputClass, 'font-mono uppercase')}
      />
    </label>
  );
}

interface TextFieldProps {
  label?: string;
  value: string;
  onCommit: (value: string) => void;
  placeholder?: string;
}

export function TextField({ label, value, onCommit, placeholder }: TextFieldProps) {
  const [draft, setDraft] = useState({ value, text: value });
  const text = draft.value === value ? draft.text : value;

  return (
    <label className="col-span-2 flex items-center gap-1.5">
      {label && <span className="w-4 shrink-0 text-[11px] text-zinc-500">{label}</span>}
      <input
        type="text"
        value={text}
        placeholder={placeholder}
        onChange={(e) => setDraft({ value, text: e.target.value })}
        onBlur={() => text !== value && onCommit(text)}
        onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
        className={inputClass}
      />
    </label>
  );
}

interface SegmentedProps<T extends string> {
  value: T;
  options: { value: T; label: ReactNode; title?: string }[];
  onChange: (value: T) => void;
}

export function Segmented<T extends string>({ value, options, onChange }: SegmentedProps<T>) {
  return (
    <div className="col-span-2 inline-flex h-7 rounded border border-zinc-200 bg-zinc-50 p-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          title={opt.title}
          onClick={() => onChange(opt.value)}
          className={cn(
            'flex flex-1 items-center justify-center rounded-[3px] px-2 text-[12px] text-zinc-600 transition-colors',
            opt.value === value && 'bg-white text-zinc-900 shadow-sm',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
