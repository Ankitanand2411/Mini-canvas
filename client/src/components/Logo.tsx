import { cn } from '@/lib/cn';

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2 text-sm font-semibold tracking-tight text-zinc-900', className)}>
      <span className="grid h-6 w-6 grid-cols-2 gap-0.5 rounded-md bg-zinc-900 p-1">
        <span className="rounded-[2px] bg-white" />
        <span className="rounded-full bg-white/70" />
        <span className="rounded-full bg-white/70" />
        <span className="rounded-[2px] bg-white" />
      </span>
      Mini Canvas
    </span>
  );
}
