"use client";

import type { SelectHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type FilterSelectOption = {
  label: string;
  value: string;
};

type FilterSelectProps = Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "children"
> & {
  options: FilterSelectOption[];
  placeholder?: string;
};

function FilterSelect({
  className,
  options,
  placeholder,
  ...props
}: FilterSelectProps) {
  return (
    <select
      className={cn(
        "h-9 w-full min-w-[8rem] rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {placeholder ? (
        <option disabled value="">
          {placeholder}
        </option>
      ) : null}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export { FilterSelect, type FilterSelectOption, type FilterSelectProps };
