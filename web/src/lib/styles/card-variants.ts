import { cva } from "class-variance-authority";

export const cardSurfaceVariants = cva(
  "rounded-lg border border-border bg-card",
  {
    variants: {
      variant: {
        default: "shadow-xs",
        flat: "shadow-none",
        elevated: "shadow-sm",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export const dashboardCardVariants = cva(
  "transition-colors hover:border-primary/30",
  {
    variants: {
      loading: {
        true: "pointer-events-none",
        false: "",
      },
    },
    defaultVariants: {
      loading: false,
    },
  },
);
