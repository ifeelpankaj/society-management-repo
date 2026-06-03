import { LoaderCircle } from "lucide-react";

import { cn } from "@/lib/utils";

type AppLoaderProps = {
  label?: string;
  description?: string;
  className?: string;
};

function AppLoader({
  label = "Loading workspace",
  description = "Preparing the latest view for you.",
  className,
}: AppLoaderProps) {
  return (
    <div
      data-slot="app-loader"
      className={cn(
        "flex min-h-[60vh] w-full flex-col items-center justify-center text-center",
        className,
      )}
    >
      <style>
        {`
          @keyframes app-loader-sweep {
            0% { transform: translateX(-110%); width: 28%; opacity: 0.45; }
            45% { width: 52%; opacity: 1; }
            100% { transform: translateX(320%); width: 28%; opacity: 0.45; }
          }
        `}
      </style>

      <div className="relative mb-8 flex size-16 items-center justify-center">
        <div className="absolute inset-0 rounded-full border border-border" />
        <div className="absolute inset-1 rounded-full border border-primary/15" />
        <LoaderCircle className="size-8 animate-spin text-primary" />
      </div>

      <p className="font-semibold text-foreground text-lg tracking-normal">
        {label}
      </p>
      <p className="mt-2 max-w-sm text-muted-foreground text-sm leading-6">
        {description}
      </p>

      <div className="mt-7 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary"
          style={{ animation: "app-loader-sweep 1.45s ease-in-out infinite" }}
        />
      </div>

      <div className="mt-5 flex items-center gap-1.5" aria-hidden="true">
        <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/50" />
        <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:120ms]" />
        <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:240ms]" />
      </div>
    </div>
  );
}

export { AppLoader, type AppLoaderProps };
