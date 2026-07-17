"use client";

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  TriangleAlertIcon,
  XIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      closeButton
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-center"
      offset={18}
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <TriangleAlertIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
        close: <XIcon className="size-3.5" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "cn-toast !w-[min(92vw,28rem)] !rounded-xl !border !border-border/80 !bg-popover/95 !p-4 !pr-11 !text-popover-foreground !shadow-[0_18px_55px_-28px_rgb(15_23_42_/_0.65)] !backdrop-blur-xl",
          success:
            "!border-emerald-500/25 [&_[data-icon]]:!text-emerald-600 dark:[&_[data-icon]]:!text-emerald-400",
          error: "!border-destructive/25 [&_[data-icon]]:!text-destructive",
          warning:
            "!border-amber-500/25 [&_[data-icon]]:!text-amber-600 dark:[&_[data-icon]]:!text-amber-400",
          info: "!border-primary/20 [&_[data-icon]]:!text-primary",
          loading: "!border-primary/20 [&_[data-icon]]:!text-primary",
          title: "!font-medium !text-sm !leading-5",
          description: "!mt-1 !text-muted-foreground !text-sm !leading-5",
          icon: "!mt-0.5",
          closeButton:
            "!absolute !top-3 !right-3 !left-auto !flex !size-7 !translate-x-0 !items-center !justify-center !rounded-full !border !border-border/70 !bg-background/85 !text-muted-foreground !opacity-100 !shadow-sm !transition hover:!bg-muted hover:!text-foreground focus-visible:!outline-none focus-visible:!ring-2 focus-visible:!ring-ring",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
