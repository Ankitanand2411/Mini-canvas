import { useCallback, useMemo, useState } from 'react';
import type { CanvasElement, ElementType } from '@/types/canvas';
import { createElement, duplicateElement } from '@/lib/elements';
import { useHistory } from './useHistory';

export type LayerMove = 'up' | 'down' | 'top' | 'bottom';

interface UpdateOptions {
  transient?: boolean;
}

export function useEditorState(canvasSize: { width: number; height: number }) {
  const history = useHistory<CanvasElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const elements = history.state;
  const selected = useMemo(() => elements.find((e) => e.id === selectedId) ?? null, [elements, selectedId]);

  const addElement = useCallback(
    (type: ElementType) => {
      const el = createElement(type, canvasSize, elements);
      history.set((prev) => [...prev, el]);
      setSelectedId(el.id);
    },
    [canvasSize, elements, history],
  );

  const updateElement = useCallback(
    (id: string, patch: Partial<CanvasElement>, options?: UpdateOptions) => {
      history.set((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)), options);
    },
    [history],
  );

  const removeElement = useCallback(
    (id: string) => {
      history.set((prev) => prev.filter((e) => e.id !== id));
      setSelectedId((current) => (current === id ? null : current));
    },
    [history],
  );

  const duplicate = useCallback(
    (id: string) => {
      const source = elements.find((e) => e.id === id);
      if (!source) return;
      const copy = duplicateElement(source, elements);
      history.set((prev) => [...prev, copy]);
      setSelectedId(copy.id);
    },
    [elements, history],
  );

  const moveLayer = useCallback(
    (id: string, move: LayerMove) => {
      history.set((prev) => {
        const index = prev.findIndex((e) => e.id === id);
        if (index === -1) return prev;
        const target =
          move === 'up' ? index + 1 : move === 'down' ? index - 1 : move === 'top' ? prev.length - 1 : 0;
        if (target < 0 || target >= prev.length || target === index) return prev;
        const next = [...prev];
        const [el] = next.splice(index, 1);
        next.splice(target, 0, el);
        return next;
      });
    },
    [history],
  );

  return {
    elements,
    selected,
    selectedId,
    select: setSelectedId,
    addElement,
    updateElement,
    removeElement,
    duplicate,
    moveLayer,
    load: history.reset,
    commit: history.commit,
    undo: history.undo,
    redo: history.redo,
    canUndo: history.canUndo,
    canRedo: history.canRedo,
  };
}
