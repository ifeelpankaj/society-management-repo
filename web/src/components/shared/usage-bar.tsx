import { formatNumberIN } from "@/lib/format";
import { cn } from "@/lib/utils";

type UsageBarProps = {
  label: string;
  used?: number;
  limit?: number;
  remaining?: number;
  percent?: number;
  className?: string;
};

function UsageBar({
  label,
  used,
  limit,
  remaining,
  percent: percentProp,
  className,
}: UsageBarProps) {
  const percent = Math.max(0, Math.min(percentProp ?? 0, 100));

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">
          {formatNumberIN(used)} / {formatNumberIN(limit)}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full",
            percent >= 90
              ? "bg-destructive"
              : percent >= 70
                ? "bg-amber-500"
                : "bg-emerald-500",
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="text-muted-foreground text-xs">
        {formatNumberIN(remaining)} remaining
      </p>
    </div>
  );
}

export { UsageBar, type UsageBarProps };
