import { useCallback, useEffect, useRef, useState } from 'react';

export type SaveStatus = 'idle' | 'dirty' | 'saving' | 'saved' | 'error';

interface Options {
  delay?: number;
  enabled?: boolean;
}

export function useAutosave<T>(value: T, save: (value: T) => Promise<unknown>, { delay = 1200, enabled = true }: Options = {}) {
  const [status, setStatus] = useState<SaveStatus>('idle');
  const latest = useRef(value);
  const saveRef = useRef(save);
  const armed = useRef(false);
  const pending = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const queue = useRef<Promise<unknown>>(Promise.resolve());

  useEffect(() => {
    latest.current = value;
    saveRef.current = save;
  });

  const flush = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    pending.current = false;

    const snapshot = latest.current;
    setStatus('saving');
    // chain so overlapping saves land in order
    queue.current = queue.current
      .then(() => saveRef.current(snapshot))
      .then(() => {
        if (latest.current === snapshot) setStatus('saved');
      })
      .catch(() => setStatus('error'));
    return queue.current;
  }, []);

  useEffect(() => {
    if (!enabled) {
      armed.current = false;
      return;
    }
    // the first value after enabling is the baseline, not a change
    if (!armed.current) {
      armed.current = true;
      return;
    }
    setStatus('dirty');
    pending.current = true;
    timer.current = setTimeout(flush, delay);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [value, enabled, delay, flush]);

  // don't lose a pending change when the editor unmounts (e.g. navigating back to the list)
  useEffect(
    () => () => {
      if (pending.current) {
        pending.current = false;
        void saveRef.current(latest.current);
      }
    },
    [],
  );

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (status === 'dirty' || status === 'saving') e.preventDefault();
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [status]);

  return { status, flush };
}
