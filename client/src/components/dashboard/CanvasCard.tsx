'use client';

import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import type { Canvas } from '@/types/canvas';
import { timeAgo } from '@/lib/format';
import { CanvasPreview } from './CanvasPreview';

interface Props {
  canvas: Canvas;
  onDelete: (canvas: Canvas) => void;
}

export function CanvasCard({ canvas, onDelete }: Props) {
  return (
    <div className="group relative">
      <Link
        href={`/canvas/${canvas.id}`}
        className="block overflow-hidden rounded-lg border border-zinc-200 bg-white transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
      >
        <div className="aspect-[16/10] bg-zinc-100 p-3">
          <div className="h-full w-full overflow-hidden rounded border border-zinc-200/70 bg-white shadow-sm">
            <CanvasPreview canvas={canvas} />
          </div>
        </div>
        <div className="flex items-center justify-between px-3 py-2.5">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-zinc-900">{canvas.title}</p>
            <p className="text-xs text-zinc-500">
              {canvas.elements.length} {canvas.elements.length === 1 ? 'element' : 'elements'} · edited {timeAgo(canvas.updatedAt)}
            </p>
          </div>
        </div>
      </Link>
      <button
        type="button"
        aria-label={`Delete ${canvas.title}`}
        onClick={() => onDelete(canvas)}
        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-md bg-white/90 text-zinc-500 opacity-0 shadow-sm transition-opacity hover:text-red-600 focus-visible:opacity-100 group-hover:opacity-100"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
