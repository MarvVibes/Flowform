import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function Logo({ className, muted }: { className?: string; muted?: boolean }) {
  return (
    <Link to="/" className={cn("group inline-flex items-center gap-2.5", className)} aria-label="FlowForm home">
      <img src="/favicon.svg" alt="FlowForm Logo" className="h-7 w-7 rounded-md transition-transform duration-300 group-hover:scale-105" />
      <span className={cn("font-display text-[16px] font-semibold text-foreground", muted && "text-muted-foreground")}>
        FlowForm
      </span>
    </Link>
  );
}
