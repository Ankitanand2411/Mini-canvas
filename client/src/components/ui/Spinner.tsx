import { Loader2 } from 'lucide-react';

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex h-full min-h-[40vh] flex-col items-center justify-center gap-3 text-sm text-zinc-500">
      <Loader2 className="h-5 w-5 animate-spin" />
      {label}
    </div>
  );
}
