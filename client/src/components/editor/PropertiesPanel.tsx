'use client';

import { AlignCenter, AlignLeft, AlignRight, Copy, Trash2 } from 'lucide-react';
import type { CanvasElement, TextAlign } from '@/types/canvas';
import { elementLabel } from '@/lib/elements';
import { IconButton } from '@/components/ui/IconButton';
import { ColorField, NumberField, Section, Segmented, TextField } from './fields';

interface CanvasSettings {
  width: number;
  height: number;
  background: string;
}

interface Props {
  element: CanvasElement | null;
  canvas: CanvasSettings;
  onChangeElement: (id: string, patch: Partial<CanvasElement>, options?: { transient?: boolean }) => void;
  onChangeCanvas: (patch: Partial<CanvasSettings>) => void;
  onCommit: () => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

export function PropertiesPanel({ element, canvas, onChangeElement, onChangeCanvas, onCommit, onDuplicate, onDelete }: Props) {
  if (!element) {
    return (
      <div>
        <Section title="Canvas">
          <NumberField label="W" value={canvas.width} min={100} max={8000} onCommit={(width) => onChangeCanvas({ width })} />
          <NumberField label="H" value={canvas.height} min={100} max={8000} onCommit={(height) => onChangeCanvas({ height })} />
          <ColorField
            label="BG"
            value={canvas.background}
            onChange={(background) => onChangeCanvas({ background })}
            onCommit={onCommit}
          />
        </Section>
        <p className="px-3 py-3 text-[12px] leading-relaxed text-zinc-400">
          Select an element to edit its properties. Double-click text to edit it in place.
        </p>
      </div>
    );
  }

  const el = element;
  const update = (patch: Partial<CanvasElement>, options?: { transient?: boolean }) => onChangeElement(el.id, patch, options);

  return (
    <div>
      <div className="flex items-center justify-between border-b border-zinc-100 px-3 py-2">
        <span className="text-[11px] font-medium text-zinc-500">{elementLabel(el.type)}</span>
        <div className="flex items-center gap-0.5">
          <IconButton label="Duplicate" onClick={() => onDuplicate(el.id)} className="h-7 w-7">
            <Copy className="h-3.5 w-3.5" />
          </IconButton>
          <IconButton label="Delete" onClick={() => onDelete(el.id)} className="h-7 w-7 hover:text-red-600">
            <Trash2 className="h-3.5 w-3.5" />
          </IconButton>
        </div>
      </div>

      <Section title="Layer">
        <TextField value={el.name ?? ''} placeholder={elementLabel(el.type)} onCommit={(name) => update({ name })} />
      </Section>

      <Section title="Position">
        <NumberField label="X" value={el.x} onCommit={(x) => update({ x })} />
        <NumberField label="Y" value={el.y} onCommit={(y) => update({ y })} />
        <NumberField label="W" value={el.width} min={1} onCommit={(width) => update({ width })} />
        <NumberField label="H" value={el.height} min={1} onCommit={(height) => update({ height })} />
        <NumberField label="R" value={el.rotation} min={-360} max={360} onCommit={(rotation) => update({ rotation })} />
        {el.type === 'rect' && (
          <NumberField label="Rd" value={el.cornerRadius ?? 0} min={0} max={500} onCommit={(cornerRadius) => update({ cornerRadius })} />
        )}
      </Section>

      <Section title="Appearance">
        <ColorField label="Fill" value={el.fill} onChange={(fill, options) => update({ fill }, options)} onCommit={onCommit} />
        <NumberField
          label="Op"
          value={Math.round((el.opacity ?? 1) * 100)}
          min={0}
          max={100}
          onCommit={(pct) => update({ opacity: pct / 100 })}
        />
      </Section>

      {el.type === 'text' && (
        <Section title="Text">
          <textarea
            value={el.text ?? ''}
            rows={3}
            onChange={(e) => update({ text: e.target.value }, { transient: true })}
            onBlur={onCommit}
            className="col-span-2 w-full resize-none rounded border border-zinc-200 bg-white px-2 py-1.5 text-[12px] leading-snug text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
          />
          <NumberField label="Aa" value={el.fontSize ?? 24} min={4} max={400} onCommit={(fontSize) => update({ fontSize })} />
          <Segmented
            value={(el.fontStyle ?? 'normal') as 'normal' | 'bold' | 'italic'}
            options={[
              { value: 'normal', label: 'Regular' },
              { value: 'bold', label: <span className="font-bold">B</span>, title: 'Bold' },
              { value: 'italic', label: <span className="italic">I</span>, title: 'Italic' },
            ]}
            onChange={(fontStyle) => update({ fontStyle })}
          />
          <Segmented<TextAlign>
            value={el.align ?? 'left'}
            options={[
              { value: 'left', label: <AlignLeft className="h-3.5 w-3.5" />, title: 'Align left' },
              { value: 'center', label: <AlignCenter className="h-3.5 w-3.5" />, title: 'Align centre' },
              { value: 'right', label: <AlignRight className="h-3.5 w-3.5" />, title: 'Align right' },
            ]}
            onChange={(align) => update({ align })}
          />
        </Section>
      )}
    </div>
  );
}
