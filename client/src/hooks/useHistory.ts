import { useCallback, useRef, useState } from 'react';

interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

interface SetOptions {
  // A run of transient updates (typing in a field, dragging a colour picker)
  // collapses into a single undo step. Call commit() to end the run.
  transient?: boolean;
}

type Updater<T> = T | ((prev: T) => T);

export function useHistory<T>(initial: T, limit = 100) {
  const [history, setHistory] = useState<HistoryState<T>>({ past: [], present: initial, future: [] });
  const inTransientRun = useRef(false);

  const set = useCallback(
    (updater: Updater<T>, options: SetOptions = {}) => {
      const pushSnapshot = !(options.transient && inTransientRun.current);
      inTransientRun.current = Boolean(options.transient);

      setHistory((h) => {
        const next = typeof updater === 'function' ? (updater as (prev: T) => T)(h.present) : updater;
        if (Object.is(next, h.present)) return h;
        if (!pushSnapshot) return { ...h, present: next, future: [] };
        return {
          past: [...h.past, h.present].slice(-limit),
          present: next,
          future: [],
        };
      });
    },
    [limit],
  );

  const commit = useCallback(() => {
    inTransientRun.current = false;
  }, []);

  const undo = useCallback(() => {
    inTransientRun.current = false;
    setHistory((h) => {
      if (h.past.length === 0) return h;
      const present = h.past[h.past.length - 1];
      return { past: h.past.slice(0, -1), present, future: [h.present, ...h.future] };
    });
  }, []);

  const redo = useCallback(() => {
    inTransientRun.current = false;
    setHistory((h) => {
      if (h.future.length === 0) return h;
      const [present, ...future] = h.future;
      return { past: [...h.past, h.present], present, future };
    });
  }, []);

  const reset = useCallback((value: T) => {
    inTransientRun.current = false;
    setHistory({ past: [], present: value, future: [] });
  }, []);

  return {
    state: history.present,
    set,
    commit,
    undo,
    redo,
    reset,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
  };
}
