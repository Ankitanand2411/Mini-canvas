'use client';

import { ChevronDown, ChevronUp, Circle, Eye, EyeOff, Lock, LockOpen, Square, Type } from 'lucide-react';
import type { CanvasElement, ElementType } from '@/types/canvas';
import type { LayerMove } from '@/hooks/useEditorState';
import { elementLabel } from '@/lib/elements';
import { cn } from '@/lib/cn';

interface Props {
  elements: CanvasElement[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onChange: (id: string, patch: Partial<CanvasElement>) => void;
  onMove: (id: string, move: LayerMove) => void;
}

const icons: Record<ElementType, typeof Square> = {
  rect: Square,
  circle: Circle,
  text: Type,
};

export function LayersPanel({ elements, selectedId, onSelect, onChange, onMove }: Props) {
  // top of the stack first, the way every design tool lists layers
  const ordered = [...elements].reverse();

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between px-3 py-2">
        <h3 className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Layers</h3>
        <span className="text-[11px] text-zinc-400">{elements.length}</span>
      </div>

      {ordered.length === 0 ? (
        <p className="px-3 pb-3 text-[12px] text-zinc-400">Nothing on the canvas yet.</p>
      ) : (
        <ul className="min-h-0 flex-1 overflow-y-auto pb-2">
          {ordered.map((el, i) => {
            const Icon = icons[el.type];
            const active = el.id === selectedId;
            const hidden = el.visible === false;
            return (
              <li
                key={el.id}
                className={cn(
                  'group flex h-8 items-center gap-2 px-3 text-[12px]',
                  active ? 'bg-blue-50 text-blue-900' : 'text-zinc-700 hover:bg-zinc-50',
                  hidden && 'text-zinc-400',
                )}
              >
                <button type="button" onClick={() => onSelect(el.id)} className="flex min-w-0 flex-1 items-center gap-2 text-left">
                  <Icon className={cn('h-3.5 w-3.5 shrink-0', active ? 'text-blue-600' : 'text-zinc-400')} />
                  <span className="truncate">{el.name || elementLabel(el.type)}</span>
                </button>

                <div className={cn('flex items-center gap-0.5', !active && 'opacity-0 group-hover:opacity-100')}>
                  <LayerButton label="Move up" disabled={i === 0} onClick={() => onMove(el.id, 'up')}>
                    <ChevronUp className="h-3.5 w-3.5" />
                  </LayerButton>
                  <LayerButton label="Move down" disabled={i === ordered.length - 1} onClick={() => onMove(el.id, 'down')}>
                    <ChevronDown className="h-3.5 w-3.5" />
                  </LayerButton>
                  <LayerButton label={el.locked ? 'Unlock' : 'Lock'} onClick={() => onChange(el.id, { locked: !el.locked })}>
                    {el.locked ? <Lock className="h-3.5 w-3.5" /> : <LockOpen className="h-3.5 w-3.5" />}
                  </LayerButton>
                  <LayerButton label={hidden ? 'Show' : 'Hide'} onClick={() => onChange(el.id, { visible: hidden })}>
                    {hidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </LayerButton>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function LayerButton({
  label,
  children,
  ...rest
}: { label: string; children: React.ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className="flex h-6 w-6 items-center justify-center rounded text-zinc-500 hover:bg-white hover:text-zinc-900 disabled:pointer-events-none disabled:opacity-30"
      {...rest}
    >
      {children}
    </button>
  );
}
