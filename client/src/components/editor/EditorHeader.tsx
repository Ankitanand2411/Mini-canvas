'use client';

import Link from 'next/link';
import { ArrowLeft, Download, Redo2, Undo2 } from 'lucide-react';
import type { SaveStatus } from '@/hooks/useAutosave';
import { IconButton } from '@/components/ui/IconButton';
import { Button } from '@/components/ui/Button';
import { TextField } from './fields';
import { cn } from '@/lib/cn';

interface Props {
  title: string;
  status: SaveStatus;
  canUndo: boolean;
  canRedo: boolean;
  onRename: (title: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  onExport: () => void;
}

const statusText: Record<SaveStatus, string> = {
  idle: 'Saved',
  dirty: 'Unsaved changes',
  saving: 'Saving…',
  saved: 'Saved',
  error: 'Failed to save',
};

export function EditorHeader({ title, status, canUndo, canRedo, onRename, onUndo, onRedo, onExport }: Props) {
  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-3">
      <div className="flex items-center gap-2">
        <Link
          href="/"
          className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
          aria-label="Back to canvases"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="w-56 [&_input]:h-8 [&_input]:border-transparent [&_input]:bg-transparent [&_input]:text-sm [&_input]:font-medium [&_input:hover]:border-zinc-200 [&_input:focus]:bg-white">
          <TextField value={title} onCommit={(next) => onRename(next.trim() || 'Untitled')} />
        </div>
        <span className="flex items-center gap-1.5 text-[12px] text-zinc-500">
          <span
            className={cn(
              'h-1.5 w-1.5 rounded-full',
              status === 'error' ? 'bg-red-500' : status === 'dirty' || status === 'saving' ? 'bg-amber-400' : 'bg-emerald-500',
            )}
          />
          {statusText[status]}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <IconButton label="Undo (⌘Z)" onClick={onUndo} disabled={!canUndo}>
          <Undo2 className="h-4 w-4" />
        </IconButton>
        <IconButton label="Redo (⇧⌘Z)" onClick={onRedo} disabled={!canRedo}>
          <Redo2 className="h-4 w-4" />
        </IconButton>
        <div className="mx-1 h-5 w-px bg-zinc-200" />
        <Button variant="secondary" size="sm" onClick={onExport}>
          <Download className="h-3.5 w-3.5" />
          Export PNG
        </Button>
      </div>
    </header>
  );
}
