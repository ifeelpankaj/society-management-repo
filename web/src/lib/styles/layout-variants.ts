import { cva } from "class-variance-authority";

export const pageShellVariants = cva(
  "relative mx-auto flex w-full flex-col gap-6 px-4 py-6 sm:px-6 lg:py-8",
  {
    variants: {
      size: {
        default: "max-w-6xl",
        wide: "max-w-7xl",
        full: "max-w-full",
      },
      background: {
        default: "",
        tinted:
          "isolate overflow-hidden before:pointer-events-none before:absolute before:inset-x-[calc(50%_-_50vw)] before:top-0 before:-z-10 before:h-full before:bg-[linear-gradient(145deg,color-mix(in_oklch,var(--primary)_7%,var(--background))_0%,var(--background)_38rem),linear-gradient(90deg,color-mix(in_oklch,var(--muted)_58%,transparent)_0%,transparent_46%,color-mix(in_oklch,var(--accent)_22%,transparent)_100%),linear-gradient(180deg,color-mix(in_oklch,var(--background)_96%,white)_0%,var(--background)_100%)] dark:before:bg-[linear-gradient(145deg,color-mix(in_oklch,var(--primary)_12%,var(--background))_0%,var(--background)_36rem),linear-gradient(90deg,color-mix(in_oklch,var(--muted)_18%,transparent)_0%,transparent_48%,color-mix(in_oklch,var(--accent)_12%,transparent)_100%),linear-gradient(180deg,var(--background)_0%,color-mix(in_oklch,var(--background)_94%,black)_100%)]",

        // ✨ New premium variant
        premium:
          "isolate overflow-hidden " +
          // Radial bloom top-left — soft primary halo
          "before:pointer-events-none before:absolute before:inset-x-[calc(50%_-_50vw)] before:top-0 before:-z-10 before:h-full " +
          "before:bg-[" +
          // Layer 1: diagonal primary bleed — light 5%, fades by 30rem
          "linear-gradient(135deg,color-mix(in_oklch,var(--primary)_5%,var(--background))_0%,var(--background)_30rem)," +
          // Layer 2: radial bloom anchored top-left — feels like light source
          "radial-gradient(ellipse_80%_50%_at_-10%_-20%,color-mix(in_oklch,var(--primary)_9%,transparent)_0%,transparent_70%)," +
          // Layer 3: soft accent whisper bottom-right — balances bloom
          "radial-gradient(ellipse_60%_40%_at_110%_110%,color-mix(in_oklch,var(--accent)_8%,transparent)_0%,transparent_65%)," +
          // Layer 4: vertical vignette — grounds the page, adds depth
          "linear-gradient(180deg,color-mix(in_oklch,var(--background)_94%,white)_0%,var(--background)_40%,color-mix(in_oklch,var(--background)_97%,black)_100%)" +
          "] " +
          // Dark mode — deeper, richer, more dramatic
          "dark:before:bg-[" +
          "linear-gradient(135deg,color-mix(in_oklch,var(--primary)_10%,var(--background))_0%,var(--background)_28rem)," +
          "radial-gradient(ellipse_80%_50%_at_-10%_-20%,color-mix(in_oklch,var(--primary)_14%,transparent)_0%,transparent_68%)," +
          "radial-gradient(ellipse_60%_40%_at_110%_110%,color-mix(in_oklch,var(--accent)_10%,transparent)_0%,transparent_62%)," +
          "linear-gradient(180deg,var(--background)_0%,color-mix(in_oklch,var(--background)_92%,black)_100%)" +
          "]",

        subtle:
          "isolate before:pointer-events-none before:absolute before:inset-x-[calc(50%_-_50vw)] before:top-0 before:-z-10 before:h-full before:bg-[linear-gradient(180deg,color-mix(in_oklch,var(--muted)_70%,transparent),transparent_28rem)]",
      },
    },
    defaultVariants: {
      size: "full",
      background: "default",
    },
  },
);

export const pageHeaderVariants = cva("flex flex-col gap-4", {
  variants: {
    align: {
      left: "text-left",
      center: "text-center",
    },
    showDivider: {
      true: "border-b border-border pb-6",
      false: "",
    },
  },
  defaultVariants: {
    align: "left",
    showDivider: false,
  },
});
