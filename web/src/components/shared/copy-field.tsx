"use client";

import { Copy } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type CopyFieldProps = {
  id: string;
  label: string;
  value: string;
};

function CopyField({ id, label, value }: CopyFieldProps) {
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  const handleCopy = async () => {
    if (!navigator.clipboard) {
      setCopyStatus("Clipboard unavailable");
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      setCopyStatus("Copied");
    } catch {
      setCopyStatus("Copy failed");
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label
          htmlFor={id}
          className="font-medium text-muted-foreground text-xs"
        >
          {label}
        </label>
        <span
          aria-live="polite"
          className="min-h-4 text-muted-foreground text-xs"
        >
          {copyStatus}
        </span>
      </div>
      <div className="flex gap-2">
        <Input id={id} readOnly value={value} />
        <Button
          aria-label={`Copy ${label.toLowerCase()}`}
          variant="outline"
          size="icon"
          onClick={handleCopy}
        >
          <Copy className="size-4" />
        </Button>
      </div>
    </div>
  );
}

export { CopyField, type CopyFieldProps };
