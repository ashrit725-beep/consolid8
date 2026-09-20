import { cn } from "@/lib/utils";

/**
 * Consolid8 mark: two brackets closing in on a single retained line —
 * context being compressed toward what is necessary, with the surviving
 * constraint highlighted.
 */
export function LogoMark({
  size = 22,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={className}
    >
      <rect
        x="0.75"
        y="0.75"
        width="22.5"
        height="22.5"
        rx="5.25"
        stroke="currentColor"
        strokeOpacity="0.16"
        strokeWidth="1.5"
      />
      <path
        d="M8.4 6.5 L5.2 12 L8.4 17.5"
        stroke="currentColor"
        strokeOpacity="0.45"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.6 6.5 L18.8 12 L15.6 17.5"
        stroke="currentColor"
        strokeOpacity="0.45"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="11.15" y="7.4" width="1.7" height="9.2" rx="0.85" fill="#3fd98b" />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "text-[13px] leading-none font-semibold tracking-[0.1em] text-fg",
        className,
      )}
    >
      CONSOLID<span className="text-signal">8</span>
    </span>
  );
}
