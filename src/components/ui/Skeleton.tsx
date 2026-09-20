import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "rounded-sm bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.045),transparent)] bg-[length:200%_100%] animate-shimmer",
        "bg-white/[0.035]",
        className,
      )}
    />
  );
}
