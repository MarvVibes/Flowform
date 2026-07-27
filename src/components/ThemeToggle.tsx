import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        "relative flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-300 outline-none",
        isDark
          ? "border-white/15 bg-white/5 text-amber-300 hover:bg-white/10 hover:text-amber-200"
          : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 shadow-sm",
        className
      )}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className="h-4 w-4 transition-transform duration-300 rotate-0 scale-100" />
      ) : (
        <Moon className="h-4 w-4 transition-transform duration-300 rotate-0 scale-100" />
      )}
    </button>
  );
}
