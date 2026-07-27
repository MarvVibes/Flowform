import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function Logo({ className, muted }: { className?: string; muted?: boolean }) {
  return (
    <Link to="/" className={cn("group inline-flex items-center gap-2", className)} aria-label="FlowForm home">
      <span className="relative flex h-7 w-7 items-center justify-center rounded-md bg-primary">
        <span className="absolute h-2.5 w-2.5 rounded-[2px] bg-primary-foreground transition-transform duration-300 group-hover:translate-x-[3px] group-hover:-translate-y-[3px]" />
        <span className="absolute h-2.5 w-2.5 translate-x-[4px] translate-y-[4px] rounded-[2px] bg-highlight transition-transform duration-300 group-hover:translate-x-[6px] group-hover:translate-y-[6px]" />
      </span>
      <span className={cn("font-display text-[16px]", muted && "text-muted-foreground")}>
        FlowForm
      </span>
    </Link>

  );
}
