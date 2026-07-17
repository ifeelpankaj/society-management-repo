import type { InputHTMLAttributes, ReactNode } from "react";

import { Check } from "@/components/ui/check";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  icon?: ReactNode;
  error?: string;
  hint?: ReactNode;
  valid?: boolean | null;
  containerClassName?: string;
};

function FormField({
  id,
  label,
  icon,
  error,
  hint,
  valid = null,
  className,
  containerClassName,
  ...props
}: FormFieldProps) {
  return (
    <label className={cn("block space-y-2.5", containerClassName)} htmlFor={id}>
      <span className="font-medium text-sm">{label}</span>
      <div className="relative w-full">
        {icon ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-4 z-10 flex size-4 -translate-y-1/2 items-center justify-center text-muted-foreground"
          >
            {icon}
          </span>
        ) : null}
        <Input
          id={id}
          // FormField - input className
          className={cn(
            "h-11 rounded-lg border-border/60 bg-background text-sm shadow-none placeholder:text-muted-foreground/55 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/15",
            icon ? "pl-14" : "pl-3.5",
            "pr-14",
            className,
          )}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          {...props}
        />
        <Check valid={valid} />
      </div>
      {error ? (
        <p id={`${id}-error`} className="text-destructive text-xs">
          {error}
        </p>
      ) : hint ? (
        <p className="text-muted-foreground text-xs">{hint}</p>
      ) : null}
    </label>
  );
}

export { FormField, type FormFieldProps };
