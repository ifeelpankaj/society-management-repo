import { CheckCircle2 } from "lucide-react";
import type { ReactNode } from "react";

type ProfileRowProps = {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  accent?: boolean;
};

export function ProfileRow({ icon, label, value, accent }: ProfileRowProps) {
  return (
    <div className="grid gap-3 p-4 sm:grid-cols-[auto_10rem_1fr] sm:items-center">
      <div className="flex size-9 items-center justify-center rounded-md bg-muted text-muted-foreground">
        {icon}
      </div>

      <p className="font-medium text-muted-foreground text-sm">{label}</p>

      <div className="flex items-center gap-2 font-medium text-sm">
        {accent ? <CheckCircle2 className="size-4 text-emerald-600" /> : null}
        <span>{value || "Not available"}</span>
      </div>
    </div>
  );
}
