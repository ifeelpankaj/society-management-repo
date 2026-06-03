import { cva } from "class-variance-authority";

export const pageTitleVariants = cva(
  "font-semibold tracking-normal text-balance",
  {
    variants: {
      size: {
        default: "text-2xl",
        sm: "text-xl",
        lg: "text-3xl",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

export const pageDescriptionVariants = cva(
  "max-w-2xl text-muted-foreground text-sm leading-6",
  {
    variants: {
      align: {
        left: "",
        center: "mx-auto",
      },
    },
    defaultVariants: {
      align: "left",
    },
  },
);

export const eyebrowVariants = cva(
  "font-medium text-muted-foreground text-xs uppercase tracking-wide",
);
