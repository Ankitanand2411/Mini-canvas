'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type Konva from 'konva';
import type { Canvas, CanvasElement } from '@/types/canvas';
import { api, ApiError } from '@/lib/api';
import { serializeElements } from '@/lib/elements';
import { downloadStageAsPng } from '@/lib/export';
import { useAutosave } from '@/hooks/useAutosave';
import { useEditorState } from '@/hooks/useEditorState';
import { useElementSize } from '@/hooks/useElementSize';
import { Spinner } from '@/components/ui/Spinner';
import { EditorHeader } from './EditorHeader';
import { LayersPanel } from './LayersPanel';
import { PropertiesPanel } from './PropertiesPanel';
import { Toolbar } from './Toolbar';

// Konva touches `window` at import time, so the stage can only render on the client.
const CanvasStage = dynamic(() => import('./CanvasStage'), { ssr: false });

interface Settings {
  title: string;
  width: number;
  height: number;
  background: string;
}

type Doc = Settings & { elements: CanvasElement[] };

const isTypingTarget = (target: EventTarget | null) =>
  target instanceof HTMLElement && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);

export function Editor({ canvasId }: { canvasId: string }) {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const stageRef = useRef<Konva.Stage | null>(null);
  const { ref: viewportRef, size: viewport } = useElementSize<HTMLDivElement>();

  const canvasSize = useMemo(
    () => ({ width: settings?.width ?? 1280, height: settings?.height ?? 800 }),
    [settings?.width, settings?.height],
  );
  const editor = useEditorState(canvasSize);
  const loadElements = editor.load;

  useEffect(() => {
    let cancelled = false;
    api
      .getCanvas(canvasId)
      .then((canvas: Canvas) => {
        if (cancelled) return;
        setSettings({ title: canvas.title, width: canvas.width, height: canvas.height, background: canvas.background });
        loadElements(canvas.elements);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setLoadError(err instanceof ApiError && err.status === 404 ? 'This canvas does not exist.' : 'Could not load the canvas.');
      });
    return () => {
      cancelled = true;
    };
  }, [canvasId, loadElements]);

  const doc = useMemo<Doc | null>(
    () => (settings ? { ...settings, elements: editor.elements } : null),
    [settings, editor.elements],
  );

  const persist = useCallback(
    (doc: Doc | null) => {
      if (!doc) return Promise.resolve();
      return api.updateCanvas(canvasId, {
        title: doc.title,
        width: doc.width,
        height: doc.height,
        background: doc.background,
        elements: serializeElements(doc.elements),
      });
    },
    [canvasId],
  );

  const { status, flush } = useAutosave(doc, persist, { enabled: doc !== null });

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  const exportPng = useCallback(() => {
    if (stageRef.current && settings) downloadStageAsPng(stageRef.current, settings.title);
  }, [settings]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;

      if (mod && e.key.toLowerCase() === 's') {
        e.preventDefault();
        flush();
        return;
      }
      if (mod && e.key.toLowerCase() === 'z') {
        if (isTypingTarget(e.target)) return;
        e.preventDefault();
        if (e.shiftKey) editor.redo();
        else editor.undo();
        return;
      }
      if (mod && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        editor.redo();
        return;
      }

      if (isTypingTarget(e.target) || mod) return;

      switch (e.key) {
        case 'Backspace':
        case 'Delete':
          if (editor.selectedId) {
            e.preventDefault();
            editor.removeElement(editor.selectedId);
          }
          break;
        case 'd':
          if (editor.selectedId) editor.duplicate(editor.selectedId);
          break;
        case 'r':
          editor.addElement('rect');
          break;
        case 'c':
          editor.addElement('circle');
          break;
        case 't':
          editor.addElement('text');
          break;
        case 'Escape':
          editor.select(null);
          break;
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [editor, flush]);

  if (loadError) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 text-sm text-zinc-600">
        <p>{loadError}</p>
        <Link href="/" className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-[13px] font-medium hover:bg-zinc-50">
          Back to canvases
        </Link>
      </div>
    );
  }

  if (!settings) return <Spinner label="Opening canvas" />;

  const scale = viewport.width
    ? Math.min(1, (viewport.width - 96) / settings.width, (viewport.height - 96) / settings.height)
    : 1;

  const handleElementChange = (id: string, patch: Partial<CanvasElement>, options?: { transient?: boolean }) =>
    editor.updateElement(id, patch, options);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-zinc-100">
      <EditorHeader
        title={settings.title}
        status={status}
        canUndo={editor.canUndo}
        canRedo={editor.canRedo}
        onRename={(title) => updateSettings({ title })}
        onUndo={editor.undo}
        onRedo={editor.redo}
        onExport={exportPng}
      />

      <div className="flex min-h-0 flex-1">
        <div
          ref={viewportRef}
          className="relative flex min-w-0 flex-1 items-center justify-center overflow-auto bg-[radial-gradient(circle,#d4d4d8_1px,transparent_1px)] [background-size:20px_20px]"
        >
          <div className="absolute left-4 top-4 z-10">
            <Toolbar onAdd={editor.addElement} />
          </div>
          <CanvasStage
            width={settings.width}
            height={settings.height}
            scale={scale}
            background={settings.background}
            elements={editor.elements}
            selectedId={editor.selectedId}
            stageRef={stageRef}
            onSelect={editor.select}
            onChange={handleElementChange}
            onCommit={editor.commit}
          />
          <div className="pointer-events-none absolute bottom-3 right-4 rounded bg-white/80 px-2 py-0.5 text-[11px] tabular-nums text-zinc-500">
            {settings.width} × {settings.height} · {Math.round(scale * 100)}%
          </div>
        </div>

        <aside className="flex w-64 shrink-0 flex-col border-l border-zinc-200 bg-white">
          <div className="overflow-y-auto">
            <PropertiesPanel
              element={editor.selected}
              canvas={settings}
              onChangeElement={handleElementChange}
              onChangeCanvas={updateSettings}
              onCommit={editor.commit}
              onDuplicate={editor.duplicate}
              onDelete={editor.removeElement}
            />
          </div>
          <div className="min-h-0 flex-1 border-t border-zinc-100">
            <LayersPanel
              elements={editor.elements}
              selectedId={editor.selectedId}
              onSelect={editor.select}
              onChange={(id, patch) => editor.updateElement(id, patch)}
              onMove={editor.moveLayer}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
