'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Plus } from 'lucide-react';
import type { Canvas } from '@/types/canvas';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Logo } from '@/components/Logo';
import { CanvasCard } from './CanvasCard';

export function Dashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [canvases, setCanvases] = useState<Canvas[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    api
      .listCanvases()
      .then(setCanvases)
      .catch(() => setError('Could not load your canvases.'));
  }, []);

  const createCanvas = useCallback(async () => {
    setCreating(true);
    try {
      const canvas = await api.createCanvas({ title: 'Untitled' });
      router.push(`/canvas/${canvas.id}`);
    } catch {
      setError('Could not create a canvas.');
      setCreating(false);
    }
  }, [router]);

  const deleteCanvas = useCallback(async (canvas: Canvas) => {
    if (!window.confirm(`Delete "${canvas.title}"? This can't be undone.`)) return;
    setCanvases((prev) => prev?.filter((c) => c.id !== canvas.id) ?? prev);
    try {
      await api.deleteCanvas(canvas.id);
    } catch {
      setError('Could not delete the canvas.');
      const fresh = await api.listCanvases().catch(() => null);
      if (fresh) setCanvases(fresh);
    }
  }, []);

  return (
    <div className="min-h-screen">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Logo />
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-zinc-500 sm:inline">{user?.email}</span>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Your canvases</h1>
            <p className="mt-1 text-sm text-zinc-500">Everything you make is saved automatically.</p>
          </div>
          <Button onClick={createCanvas} loading={creating}>
            <Plus className="h-4 w-4" />
            New canvas
          </Button>
        </div>

        {error && <p className="mb-6 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        {canvases === null ? (
          <Spinner />
        ) : canvases.length === 0 ? (
          <div className="flex flex-col items-center rounded-xl border border-dashed border-zinc-300 px-6 py-20 text-center">
            <p className="text-sm font-medium text-zinc-900">No canvases yet</p>
            <p className="mt-1 max-w-xs text-sm text-zinc-500">Create one and start dropping in rectangles, circles and text.</p>
            <Button className="mt-6" variant="secondary" onClick={createCanvas} loading={creating}>
              <Plus className="h-4 w-4" />
              Create your first canvas
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {canvases.map((canvas) => (
              <CanvasCard key={canvas.id} canvas={canvas} onDelete={deleteCanvas} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
