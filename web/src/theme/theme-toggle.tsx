"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ModeToggleProps {
  className?: string;
  variant?: "icon" | "full";
}

export function ModeToggle({
  className = "",
  variant = "icon",
}: ModeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  if (!mounted) {
    return null;
  }
  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label="Toggle theme"
        className={cn(
          "relative flex h-9 w-[5.6rem] items-center rounded-full border border-border/70 bg-background/45 px-1 shadow-[0_1px_0_color-mix(in_oklch,white_42%,transparent)_inset] backdrop-blur transition-all duration-300 hover:bg-muted/70",
          className,
        )}
      >
        <span
          className={cn(
            "absolute z-10 flex h-7 w-7 items-center justify-center rounded-full shadow-sm ring-1 transition-all duration-300",
            theme === "dark"
              ? "translate-x-[2.7rem] bg-primary text-primary-foreground ring-primary/35"
              : "translate-x-0 bg-[linear-gradient(135deg,color-mix(in_oklch,var(--primary)_94%,white),var(--primary))] text-primary-foreground ring-primary/30",
          )}
        >
          {theme === "dark" ? (
            <Moon className="h-3.5 w-3.5" />
          ) : (
            <Sun className="h-3.5 w-3.5" />
          )}
        </span>

        <div className="flex w-full items-center justify-between px-2">
          <Sun className="h-3.5 w-3.5 text-primary/75" />
          <Moon className="h-3.5 w-3.5 text-accent/75" />
        </div>
      </button>
    );
  }

  // Full-width variant for mobile sidebar
  return (
    <Button
      onClick={toggleTheme}
      className={cn(
        "group flex w-full items-center justify-between gap-3 rounded-xl bg-secondary/70 px-4 py-3 font-medium text-foreground transition-all duration-200 hover:bg-secondary",
        className,
      )}
      aria-label="Toggle theme"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-background/60 text-primary transition-all duration-200">
          <Sun className="h-4 w-4 transition-transform duration-300 dark:scale-0" />
          <Moon className="absolute h-4 w-4 transition-transform duration-300 scale-0 dark:scale-100" />
        </div>
        <span className="text-sm">
          {theme === "dark" ? "Dark Mode" : "Light Mode"}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div
          className={`
          relative h-6 w-11 rounded-full transition-colors duration-300
          ${theme === "dark" ? "bg-primary" : "bg-accent"}
        `}
        >
          <div
            className={`
            absolute top-1 h-4 w-4 rounded-full shadow-md transition-transform duration-300
            ${theme === "dark" ? "translate-x-6 bg-primary-foreground" : "translate-x-1 bg-accent-foreground"}
          `}
          />
        </div>
      </div>
    </Button>
  );
}
