'use client';

import { Circle, Square, Type } from 'lucide-react';
import type { ElementType } from '@/types/canvas';
import { IconButton } from '@/components/ui/IconButton';

interface Props {
  onAdd: (type: ElementType) => void;
}

const tools: { type: ElementType; label: string; icon: typeof Square }[] = [
  { type: 'rect', label: 'Rectangle (R)', icon: Square },
  { type: 'circle', label: 'Circle (C)', icon: Circle },
  { type: 'text', label: 'Text (T)', icon: Type },
];

export function Toolbar({ onAdd }: Props) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-zinc-200 bg-white p-1 shadow-sm">
      {tools.map(({ type, label, icon: Icon }) => (
        <IconButton key={type} label={label} onClick={() => onAdd(type)}>
          <Icon className="h-4 w-4" />
        </IconButton>
      ))}
    </div>
  );
}
